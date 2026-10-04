import { Request, Response } from "express";
import { CreateRoomSchema } from "@repo/common/src/types";
import { prismaClient } from "db";
import { canAccessRoom, canModifyWorkspaceContent, getUserRoleInWorkspace } from "../utils/auth";

export async function createRoom(req: Request, res: Response) {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid inputs" });
        return;
    }
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        if (parsedData.data.workspaceId) {
            const canModify = await canModifyWorkspaceContent(userId, parsedData.data.workspaceId);
            if (!canModify) {
                res.status(403).json({ message: "Forbidden: You do not have permission to create rooms in this workspace" });
                return;
            }
        }

        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId,
                workspaceId: parsedData.data.workspaceId || null,
            },
        });
        res.json({ roomId: room.id, slug: room.slug });
    } catch {
        res.status(409).json({ message: "Room already exists" });
    }
}

export async function getRoom(req: Request, res: Response): Promise<void> {
    const slug = req.params.slug as string;
    try {
        const room = await prismaClient.room.findUnique({
            where: { slug },
        });

        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }

        const userId = req.userId;
        if (!userId || !(await canAccessRoom(userId, room.id))) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }

        res.json({ room });
    } catch (e) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getShapes(req: Request, res: Response): Promise<void> {
    const slug = req.params.slug as string;
    try {
        const room = await prismaClient.room.findUnique({
            where: { slug },
            include: { shapes: true }
        });

        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }

        const userId = req.userId;
        if (!userId || !(await canAccessRoom(userId, room.id))) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }
        // Legacy rooms are intentionally available to every authenticated user.
        const role = room.workspaceId
            ? await getUserRoleInWorkspace(userId, room.workspaceId)
            : room.adminId === userId ? "OWNER" : "VIEWER";

        res.json({ shapes: room.shapes, role });
    } catch (e) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getNotesForRoom(req: Request, res: Response): Promise<void> {
    const userId = req.userId as string;
    const roomId = parseInt(req.params.roomId as string);

    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    if (isNaN(roomId)) {
        res.status(400).json({ message: "Invalid roomId" });
        return;
    }

    try {
        const room = await prismaClient.room.findUnique({ where: { id: roomId } });
        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }

        const hasAccess = await canAccessRoom(userId, roomId);
        if (!hasAccess) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }

        const noteWhiteboards = await prismaClient.noteWhiteboard.findMany({
            where: { roomId },
            include: { note: true }
        });

        const notes = noteWhiteboards.map(nw => nw.note);
        res.json({ notes });
    } catch (e) {
        console.error("Error fetching notes for room", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteRoom(req: Request, res: Response): Promise<void> {
    const userId = req.userId as string;
    const roomId = parseInt(req.params.roomId as string);

    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    if (isNaN(roomId)) {
        res.status(400).json({ message: "Invalid roomId" });
        return;
    }

    try {
        const room = await prismaClient.room.findUnique({
            where: { id: roomId },
            include: { workspace: true }
        });

        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }

        const isRoomAdmin = room.adminId === userId;
        
        let canModifyWorkspace = false;
        if (room.workspaceId) {
            canModifyWorkspace = await canModifyWorkspaceContent(userId, room.workspaceId);
        }

        if (!isRoomAdmin && !canModifyWorkspace) {
            res.status(403).json({ message: "Forbidden: You do not have permission to delete this room." });
            return;
        }

        await prismaClient.room.delete({
            where: { id: roomId }
        });

        res.json({ success: true });
    } catch (e) {
        console.error("Error deleting room", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

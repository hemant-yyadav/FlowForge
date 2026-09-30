import { Request, Response } from "express";
import { CreateRoomSchema } from "@repo/common/src/types";
import { prismaClient } from "db";
import { canAccessRoom } from "../utils/auth";

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
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId,
            },
        });
        res.json({ roomId: room.id });
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

        res.json({ shapes: room.shapes });
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

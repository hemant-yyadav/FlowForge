import { Request, Response } from "express";
import { prismaClient } from "db";
import { canAccessWorkspace, canModifyNote, canAccessRoom, canModifyWorkspaceContent, getUserRoleInWorkspace } from "../utils/auth";

// --- Endpoints ---

export async function createNote(req: Request, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const workspaceId = req.params.workspaceId as string;
    const { title, content } = req.body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
        res.status(400).json({ message: "Invalid inputs: title is required" });
        return;
    }

    if (!content) {
        res.status(400).json({ message: "Invalid inputs: content is required" });
        return;
    }

    try {
        const workspace = await prismaClient.workspace.findUnique({
            where: { id: workspaceId }
        });

        if (!workspace) {
            res.status(404).json({ message: "Workspace not found" });
            return;
        }

        const canModify = await canModifyWorkspaceContent(userId, workspaceId);
        if (!canModify) {
            res.status(403).json({ message: "Forbidden: You do not have permission to create notes in this workspace" });
            return;
        }

        const note = await prismaClient.note.create({
            data: {
                title: title.trim(),
                content: content,
                workspaceId,
                userId,
            },
        });
        
        res.json({ note });
    } catch (e) {
        console.error("Error creating note:", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getNotes(req: Request, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const workspaceId = req.params.workspaceId as string;

    try {
        const workspace = await prismaClient.workspace.findUnique({
            where: { id: workspaceId }
        });

        if (!workspace) {
            res.status(404).json({ message: "Workspace not found" });
            return;
        }

        const hasAccess = await canAccessWorkspace(userId, workspaceId);
        if (!hasAccess) {
            res.status(403).json({ message: "Forbidden: You do not have access to this workspace" });
            return;
        }

        const notes = await prismaClient.note.findMany({
            where: { workspaceId },
            orderBy: { updatedAt: 'desc' }
        });
        
        res.json({ notes });
    } catch (e) {
        console.error("Error fetching notes:", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getNote(req: Request, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const id = req.params.id as string;

    try {
        const note = await prismaClient.note.findUnique({
            where: { id }
        });

        if (!note) {
            res.status(404).json({ message: "Note not found" });
            return;
        }

        const role = await getUserRoleInWorkspace(userId, note.workspaceId);
        if (role === null) {
            res.status(403).json({ message: "Forbidden: You do not have access to this note" });
            return;
        }

        res.json({ note, role });
    } catch (e) {
        console.error("Error fetching note:", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateNote(req: Request, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const id = req.params.id as string;
    const { title, content } = req.body;

    try {
        const canModify = await canModifyNote(userId, id);
        
        if (canModify === null) {
            res.status(404).json({ message: "Note not found" });
            return;
        }
        
        if (!canModify) {
            res.status(403).json({ message: "Forbidden: You do not have permission to modify this note" });
            return;
        }

        // We need to fetch it again briefly just to get existing values for partial updates
        const existingNote = await prismaClient.note.findUnique({
            where: { id }
        });

        if (!existingNote) {
            res.status(404).json({ message: "Note not found" });
            return;
        }

        const note = await prismaClient.note.update({
            where: { id },
            data: {
                title: title !== undefined ? String(title).trim() : existingNote.title,
                content: content !== undefined ? content : existingNote.content,
            }
        });

        res.json({ note });
    } catch (e) {
        console.error("Error updating note:", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteNote(req: Request, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const id = req.params.id as string;

    try {
        const canModify = await canModifyNote(userId, id);
        
        if (canModify === null) {
            res.status(404).json({ message: "Note not found" });
            return;
        }
        
        if (!canModify) {
            res.status(403).json({ message: "Forbidden: You do not have permission to delete this note" });
            return;
        }

        await prismaClient.note.delete({
            where: { id }
        });

        res.json({ message: "Note deleted successfully" });
    } catch (e) {
        console.error("Error deleting note:", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getRoomsForNote(req: Request, res: Response) {
    const userId = req.userId as string;
    const noteId = req.params.noteId as string;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const note = await prismaClient.note.findUnique({ where: { id: noteId } });
        if (!note) return res.status(404).json({ message: "Note not found" });

        const hasAccess = await canAccessWorkspace(userId, note.workspaceId);
        if (!hasAccess) return res.status(403).json({ message: "Forbidden" });

        const noteWhiteboards = await prismaClient.noteWhiteboard.findMany({
            where: { noteId },
            include: { room: true }
        });

        const rooms = noteWhiteboards.map(nw => nw.room);
        res.json({ rooms });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function addRoomToNote(req: Request, res: Response) {
    const userId = req.userId as string;
    const noteId = req.params.noteId as string;
    const roomId = parseInt(req.body.roomId as string);

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (isNaN(roomId)) return res.status(400).json({ message: "Invalid roomId" });

    try {
        const note = await prismaClient.note.findUnique({ where: { id: noteId } });
        if (!note) return res.status(404).json({ message: "Note not found" });

        const room = await prismaClient.room.findUnique({ where: { id: roomId } });
        if (!room) return res.status(404).json({ message: "Room not found" });

        if (!room.workspaceId) {
            return res.status(400).json({ message: "Legacy rooms without a workspace cannot be referenced." });
        }

        if (room.workspaceId !== note.workspaceId) {
            return res.status(400).json({ message: "Room and Note must belong to the same workspace." });
        }

        const hasWorkspaceAccess = await canAccessWorkspace(userId, note.workspaceId);
        if (!hasWorkspaceAccess) return res.status(403).json({ message: "Forbidden" });

        const hasRoomAccess = await canAccessRoom(userId, roomId);
        if (!hasRoomAccess) return res.status(403).json({ message: "Forbidden" });

        await prismaClient.noteWhiteboard.upsert({
            where: {
                noteId_roomId: { noteId, roomId }
            },
            update: {},
            create: { noteId, roomId }
        });

        res.json({ message: "Room added to Note successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function removeRoomFromNote(req: Request, res: Response) {
    const userId = req.userId as string;
    const noteId = req.params.noteId as string;
    const roomId = parseInt(req.params.roomId as string);

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (isNaN(roomId)) return res.status(400).json({ message: "Invalid roomId" });

    try {
        const note = await prismaClient.note.findUnique({ where: { id: noteId } });
        if (!note) return res.status(404).json({ message: "Note not found" });

        const hasWorkspaceAccess = await canAccessWorkspace(userId, note.workspaceId);
        if (!hasWorkspaceAccess) return res.status(403).json({ message: "Forbidden" });

        const nw = await prismaClient.noteWhiteboard.findUnique({
            where: { noteId_roomId: { noteId, roomId } }
        });

        if (nw) {
            await prismaClient.noteWhiteboard.delete({
                where: { noteId_roomId: { noteId, roomId } }
            });
        }

        res.json({ message: "Room removed from Note successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
}

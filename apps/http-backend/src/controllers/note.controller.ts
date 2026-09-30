import { Request, Response } from "express";
import { prismaClient } from "db";

// --- Helper Functions ---

async function canAccessWorkspace(userId: string, workspaceId: string): Promise<boolean> {
    const workspace = await prismaClient.workspace.findUnique({
        where: { id: workspaceId },
        include: { members: { where: { userId } } }
    });

    if (!workspace) return false;
    
    const isOwner = workspace.ownerId === userId;
    const isMember = workspace.members.length > 0;
    
    return isOwner || isMember;
}

// Returns true if allowed, false if forbidden, null if not found
async function canModifyNote(userId: string, noteId: string): Promise<boolean | null> {
    const note = await prismaClient.note.findUnique({
        where: { id: noteId },
        include: { workspace: true }
    });

    if (!note) return null; // Not found

    const isAuthor = note.userId === userId;
    const isOwner = note.workspace.ownerId === userId;

    return isAuthor || isOwner;
}

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

        const hasAccess = await canAccessWorkspace(userId, workspaceId);
        if (!hasAccess) {
            res.status(403).json({ message: "Forbidden: You do not have access to this workspace" });
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

        const hasAccess = await canAccessWorkspace(userId, note.workspaceId);
        if (!hasAccess) {
            res.status(403).json({ message: "Forbidden: You do not have access to this note" });
            return;
        }

        res.json({ note });
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

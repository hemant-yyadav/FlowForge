import { Request, Response } from "express";
import { prismaClient } from "db";
import { canAccessWorkspace } from "../utils/auth";

export async function createTag(req: Request, res: Response) {
    const userId = req.userId as string;
    const workspaceId = req.params.workspaceId as string;
    const { name } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ message: "Invalid tag name" });
    }

    try {
        const hasAccess = await canAccessWorkspace(userId, workspaceId);
        if (!hasAccess) return res.status(403).json({ message: "Forbidden" });

        const tag = await prismaClient.tag.create({
            data: {
                name: name.trim(),
                workspaceId
            }
        });

        res.json({ tag });
    } catch (e: any) {
        if (e.code === 'P2002') {
            return res.status(400).json({ message: "Tag already exists in this workspace" });
        }
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getTags(req: Request, res: Response) {
    const userId = req.userId as string;
    const workspaceId = req.params.workspaceId as string;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const hasAccess = await canAccessWorkspace(userId, workspaceId);
        if (!hasAccess) return res.status(403).json({ message: "Forbidden" });

        const tags = await prismaClient.tag.findMany({
            where: { workspaceId }
        });

        res.json({ tags });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteTag(req: Request, res: Response) {
    const userId = req.userId as string;
    const tagId = req.params.tagId as string;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const tag = await prismaClient.tag.findUnique({
            where: { id: tagId },
            include: { workspace: true }
        });

        if (!tag) return res.status(404).json({ message: "Tag not found" });

        if (tag.workspace.ownerId !== userId) {
            return res.status(403).json({ message: "Only the workspace owner can delete tags" });
        }

        await prismaClient.tag.delete({ where: { id: tagId } });

        res.json({ message: "Tag deleted successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function assignTagToNote(req: Request, res: Response) {
    const userId = req.userId as string;
    const noteId = req.params.noteId as string;
    const { tagId } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!tagId) return res.status(400).json({ message: "tagId is required" });

    try {
        const note = await prismaClient.note.findUnique({ where: { id: noteId } });
        if (!note) return res.status(404).json({ message: "Note not found" });

        const hasAccess = await canAccessWorkspace(userId, note.workspaceId);
        if (!hasAccess) return res.status(403).json({ message: "Forbidden" });

        const tag = await prismaClient.tag.findUnique({ where: { id: tagId } });
        if (!tag) return res.status(404).json({ message: "Tag not found" });

        if (tag.workspaceId !== note.workspaceId) {
            return res.status(400).json({ message: "Tag and note must belong to the same workspace" });
        }

        await prismaClient.note.update({
            where: { id: noteId },
            data: {
                tags: {
                    connect: { id: tagId }
                }
            }
        });

        res.json({ message: "Tag assigned successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function removeTagFromNote(req: Request, res: Response) {
    const userId = req.userId as string;
    const noteId = req.params.noteId as string;
    const tagId = req.params.tagId as string;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const note = await prismaClient.note.findUnique({ where: { id: noteId } });
        if (!note) return res.status(404).json({ message: "Note not found" });

        const hasAccess = await canAccessWorkspace(userId, note.workspaceId);
        if (!hasAccess) return res.status(403).json({ message: "Forbidden" });

        await prismaClient.note.update({
            where: { id: noteId },
            data: {
                tags: {
                    disconnect: { id: tagId }
                }
            }
        });

        res.json({ message: "Tag removed successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getNotesByTag(req: Request, res: Response) {
    const userId = req.userId as string;
    const tagId = req.params.tagId as string;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const tag = await prismaClient.tag.findUnique({ where: { id: tagId } });
        if (!tag) return res.status(404).json({ message: "Tag not found" });

        const hasAccess = await canAccessWorkspace(userId, tag.workspaceId);
        if (!hasAccess) return res.status(403).json({ message: "Forbidden" });

        const notes = await prismaClient.note.findMany({
            where: {
                tags: {
                    some: { id: tagId }
                }
            }
        });

        res.json({ notes });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
}

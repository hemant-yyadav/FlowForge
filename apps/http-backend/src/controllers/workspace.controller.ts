import { Request, Response } from "express";
import { prismaClient } from "db";

export async function createWorkspace(req: Request, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const { name, description } = req.body;
    if (!name || typeof name !== "string" || name.trim().length === 0) {
        res.status(400).json({ message: "Invalid inputs: name is required" });
        return;
    }

    try {
        const workspace = await prismaClient.workspace.create({
            data: {
                name: name.trim(),
                description: typeof description === "string" ? description.trim() : null,
                ownerId: userId,
            },
        });
        res.json({ workspace });
    } catch (e) {
        console.error("Error creating workspace", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getWorkspaces(req: Request, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const workspaces = await prismaClient.workspace.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId } } }
                ]
            },
            include: {
                owner: {
                    select: { id: true, name: true }
                }
            }
        });
        res.json({ workspaces });
    } catch (e) {
        console.error("Error fetching workspaces", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getWorkspace(req: Request, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const workspaceId = req.params.id as string;

    try {
        const workspace = await prismaClient.workspace.findUnique({
            where: { id: workspaceId },
            include: {
                rooms: true,
                owner: {
                    select: { id: true, name: true }
                }
            }
        });

        if (!workspace) {
            res.status(404).json({ message: "Workspace not found" });
            return;
        }

        // Auth check: Only owner or member can access
        const isOwner = workspace.ownerId === userId;
        const isMember = await prismaClient.workspaceMember.findUnique({
            where: { workspaceId_userId: { workspaceId, userId } }
        });

        if (!isOwner && !isMember && !workspace.isPublic) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }

        res.json({ workspace });
    } catch (e) {
        console.error("Error fetching workspace details", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

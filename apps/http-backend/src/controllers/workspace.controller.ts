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
        console.log(`[getWorkspaces] Fetching for userId: ${userId}`);
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
                    select: { id: true, name: true, username: true, email: true, photo: true }
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, username: true, email: true, photo: true }
                        }
                    }
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

export async function getWorkspaceRooms(req: Request, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const workspaceId = req.params.workspaceId as string;

    try {
        const workspace = await prismaClient.workspace.findUnique({
            where: { id: workspaceId },
        });

        if (!workspace) {
            res.status(404).json({ message: "Workspace not found" });
            return;
        }

        const isOwner = workspace.ownerId === userId;
        const isMember = await prismaClient.workspaceMember.findUnique({
            where: { workspaceId_userId: { workspaceId, userId } }
        });

        if (!isOwner && !isMember) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }

        const rooms = await prismaClient.room.findMany({
            where: { workspaceId }
        });

        res.json({ rooms });
    } catch (e) {
        console.error("Error fetching workspace rooms", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteWorkspace(req: Request, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }

    const workspaceId = req.params.id as string;

    try {
        const workspace = await prismaClient.workspace.findUnique({ where: { id: workspaceId } });
        if (!workspace) { res.status(404).json({ message: "Workspace not found" }); return; }
        if (workspace.ownerId !== userId) { res.status(403).json({ message: "Only the owner can delete this workspace" }); return; }

        await prismaClient.workspace.delete({ where: { id: workspaceId } });
        res.json({ message: "Workspace deleted successfully" });
    } catch (e) {
        console.error("Error deleting workspace", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function addMember(req: Request, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }

    const workspaceId = req.params.id as string;
    const { username } = req.body;

    if (!username || typeof username !== "string") {
        res.status(400).json({ message: "Username is required" });
        return;
    }

    try {
        const workspace = await prismaClient.workspace.findUnique({ where: { id: workspaceId } });
        if (!workspace) { res.status(404).json({ message: "Workspace not found" }); return; }
        if (workspace.ownerId !== userId) { res.status(403).json({ message: "Only the owner can add members" }); return; }

        // Find user by username or email
        const targetUser = await prismaClient.user.findFirst({
            where: {
                OR: [
                    { username: username.trim() },
                    { email: username.trim() }
                ]
            }
        });

        if (!targetUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (targetUser.id === userId) {
            res.status(400).json({ message: "You are already the owner of this workspace" });
            return;
        }

        // Check if already a member
        const existingMember = await prismaClient.workspaceMember.findUnique({
            where: { workspaceId_userId: { workspaceId, userId: targetUser.id } }
        });

        if (existingMember) {
            res.status(400).json({ message: "User is already a member" });
            return;
        }

        const member = await prismaClient.workspaceMember.create({
            data: {
                workspaceId,
                userId: targetUser.id,
                role: "EDITOR" // Defaulting to Editor for now
            },
            include: {
                user: {
                    select: { id: true, name: true, username: true, email: true, photo: true }
                }
            }
        });

        res.json({ member });
    } catch (e) {
        console.error("Error adding member", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function removeMember(req: Request, res: Response): Promise<void> {
    const userId = req.userId;
    if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }

    const workspaceId = req.params.id as string;
    const targetUserId = req.params.userId as string;

    try {
        const workspace = await prismaClient.workspace.findUnique({ where: { id: workspaceId } });
        if (!workspace) { res.status(404).json({ message: "Workspace not found" }); return; }
        
        // Owner can remove members. A member can also remove themselves (leave).
        if (workspace.ownerId !== userId && targetUserId !== userId) { 
            res.status(403).json({ message: "You do not have permission to remove this member" }); 
            return; 
        }

        await prismaClient.workspaceMember.delete({
            where: { workspaceId_userId: { workspaceId, userId: targetUserId } }
        });

        res.json({ message: "Member removed successfully" });
    } catch (e) {
        console.error("Error removing member", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

import { prismaClient } from "db";

export async function canAccessWorkspace(userId: string, workspaceId: string): Promise<boolean> {
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
export async function canModifyNote(userId: string, noteId: string): Promise<boolean | null> {
    const note = await prismaClient.note.findUnique({
        where: { id: noteId },
        include: { workspace: true }
    });

    if (!note) return null; // Not found

    const isAuthor = note.userId === userId;
    const isOwner = note.workspace.ownerId === userId;

    return isAuthor || isOwner;
}

export async function canAccessRoom(userId: string, roomId: number): Promise<boolean> {
    const room = await prismaClient.room.findUnique({
        where: { id: roomId }
    });

    if (!room) return false; // Not found

    // Legacy rooms with no workspace association should remain accessible.
    if (!room.workspaceId) {
        return true; 
    }

    // Workspace-bound rooms must validate workspace access.
    return await canAccessWorkspace(userId, room.workspaceId);
}

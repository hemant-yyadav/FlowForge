import { prismaClient } from "db";

export async function getUserRoleInWorkspace(userId: string, workspaceId: string): Promise<"OWNER" | "EDITOR" | "VIEWER" | null> {
    const workspace = await prismaClient.workspace.findUnique({
        where: { id: workspaceId },
        include: { members: { where: { userId } } }
    });

    if (!workspace) return null;
    if (workspace.ownerId === userId) return "OWNER";
    if (workspace.members.length > 0) return workspace.members[0]?.role as "EDITOR" | "VIEWER";
    
    return null;
}

export async function canAccessWorkspace(userId: string, workspaceId: string): Promise<boolean> {
    const role = await getUserRoleInWorkspace(userId, workspaceId);
    return role !== null;
}

export async function canModifyWorkspaceContent(userId: string, workspaceId: string): Promise<boolean> {
    const role = await getUserRoleInWorkspace(userId, workspaceId);
    return role === "OWNER" || role === "EDITOR";
}

export async function canModifyNote(userId: string, noteId: string): Promise<boolean | null> {
    const note = await prismaClient.note.findUnique({
        where: { id: noteId },
        include: { workspace: true }
    });

    if (!note) return null; // Not found

    return await canModifyWorkspaceContent(userId, note.workspaceId);
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

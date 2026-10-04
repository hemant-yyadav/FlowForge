import { WebSocket } from "ws";
import { joinRoom } from "../RoomManager.js";
import { findUser } from "../UserManager.js";
import { prismaClient } from "db";

export async function handleJoinRoom(ws: WebSocket, roomId: string, userId: string) {
    let room = await prismaClient.room.findUnique({
        where: { slug: roomId },
    });

    if (!room) {
        ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
        return;
    }

    let role = "VIEWER";
    if (room.workspaceId) {
        const workspace = await prismaClient.workspace.findUnique({
            where: { id: room.workspaceId },
            include: { members: { where: { userId } } }
        });
        if (!workspace) {
            ws.send(JSON.stringify({ type: "error", message: "Room workspace not found" }));
            return false;
        }
        if (workspace.ownerId === userId) {
            role = "OWNER";
        } else if (workspace.members.length > 0) {
            role = workspace.members[0]?.role || "VIEWER";
        } else {
            ws.send(JSON.stringify({ type: "error", message: "Forbidden" }));
            return false;
        }
    } else if (room.adminId === userId) {
        role = "OWNER";
    }

    // Legacy rooms intentionally permit authenticated users as viewers.
    joinRoom(ws, roomId);

    const user = findUser(ws);
    if (user) {
        user.roles[roomId] = role;
    }

    const { broadcastRoomUsers } = await import("./usersHandler.js");
    broadcastRoomUsers(roomId);
    return true;
}

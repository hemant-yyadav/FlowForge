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

    console.log(`User joining room ${roomId}`);
    joinRoom(ws, roomId);

    let role = "VIEWER";
    if (room.workspaceId) {
        const workspace = await prismaClient.workspace.findUnique({
            where: { id: room.workspaceId },
            include: { members: { where: { userId } } }
        });
        if (workspace?.ownerId === userId) {
            role = "OWNER";
        } else if (workspace && workspace.members.length > 0) {
            role = workspace.members[0]?.role || "VIEWER";
        }
    } else if (room.adminId === userId) {
        role = "OWNER";
    }

    const user = findUser(ws);
    if (user) {
        user.roles[roomId] = role;
    }

    // Broadcast updated users list to the room
    const { broadcastRoomUsers } = require("./usersHandler.js");
    broadcastRoomUsers(roomId);
}

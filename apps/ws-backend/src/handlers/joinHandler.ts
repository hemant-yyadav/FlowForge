import { WebSocket } from "ws";
import { joinRoom } from "../RoomManager.js";
import { prismaClient } from "db";

export async function handleJoinRoom(ws: WebSocket, roomId: string, userId: string) {
    let room = await prismaClient.room.findUnique({
        where: { slug: roomId },
    });

    if (!room) {
        // Auto-create room in WS backend if it wasn't created yet
        try {
            room = await prismaClient.room.create({
                data: { slug: roomId, adminId: userId },
            });
        } catch (e) {
            console.error("Failed to auto-create room in WS:", e);
            ws.send(JSON.stringify({ type: "error", message: "Room not found and could not be created" }));
            return;
        }
    }

    console.log(`User joining room ${roomId}`);
    joinRoom(ws, roomId);

    // Broadcast updated users list to the room
    const { broadcastRoomUsers } = require("./usersHandler.js");
    broadcastRoomUsers(roomId);
}

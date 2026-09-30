import { WebSocket } from "ws";
import { joinRoom } from "../RoomManager.js";
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

    // Broadcast updated users list to the room
    const { broadcastRoomUsers } = require("./usersHandler.js");
    broadcastRoomUsers(roomId);
}

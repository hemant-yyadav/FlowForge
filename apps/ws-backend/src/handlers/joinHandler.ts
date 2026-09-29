import { WebSocket } from "ws";
import { joinRoom } from "../RoomManager.js";
import { prismaClient } from "db";

export async function handleJoinRoom(ws: WebSocket, roomId: string) {
    const room = await prismaClient.room.findUnique({
        where: { slug: roomId },
    });

    if (!room) {
        ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
        return;
    }

    joinRoom(ws, roomId);
}

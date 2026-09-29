import { WebSocket } from "ws";
import { prismaClient } from "db";
import { getUsersInRoom } from "../UserManager.js";

export async function handleClearBoard(ws: WebSocket, roomSlug: string, userId: string) {
    const room = await prismaClient.room.findUnique({
        where: { slug: roomSlug },
    });

    if (!room) return;

    try {
        await prismaClient.shape.deleteMany({
            where: { roomId: room.id },
        });
    } catch (e) {
        console.error("Failed to clear shapes in DB:", e);
    }

    const payload = JSON.stringify({ type: "clear_board", roomId: roomSlug, userId });
    
    const usersInRoom = getUsersInRoom(roomSlug);
    usersInRoom.forEach((user) => {
        if (user.ws.readyState === 1) { // WebSocket.OPEN
            user.ws.send(payload);
        }
    });
}

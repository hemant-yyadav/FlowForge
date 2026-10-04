import { WebSocket } from "ws";
import { prismaClient } from "db";
import { getUsersInRoom, findUser } from "../UserManager.js";

export async function handleClearBoard(ws: WebSocket, roomSlug: string, userId: string) {
    const room = await prismaClient.room.findUnique({
        where: { slug: roomSlug },
    });

    if (!room) return;

    const user = findUser(ws);
    if (!user || !user.rooms.includes(roomSlug) || user.roles[roomSlug] === "VIEWER") {
        return;
    }

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

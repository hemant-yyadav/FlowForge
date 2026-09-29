import { WebSocket } from "ws";
import { prismaClient } from "db";
import { getUsersInRoom } from "../UserManager";

export async function handleChat(ws: WebSocket, roomSlug: string, message: string, userId: string) {
    const room = await prismaClient.room.findUnique({
        where: { slug: roomSlug },
    });

    if (!room) return;

    await prismaClient.chat.create({
        data: { roomId: room.id, message, userId },
    });

    const payload = JSON.stringify({ type: "chat", message, roomId: roomSlug });

    getUsersInRoom(roomSlug).forEach((user) => {
        if (user.ws !== ws) {
            user.ws.send(payload);
        }
    });
}

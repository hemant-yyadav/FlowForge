import { WebSocket } from "ws";
import { prismaClient } from "db";
import { getUsersInRoom, findUser } from "../UserManager.js";

export async function handleChat(ws: WebSocket, roomSlug: string, message: string, userId: string) {
    const room = await prismaClient.room.findUnique({
        where: { slug: roomSlug },
    });

    if (!room) return;

    await prismaClient.chat.create({
        data: { roomId: room.id, message, userId },
    });

    const sender = findUser(ws);
    const senderName = sender?.name || "Unknown";

    const payload = JSON.stringify({ type: "chat", message, roomId: roomSlug, senderName });
    
    const usersInRoom = getUsersInRoom(roomSlug);
    console.log(`Broadcasting to ${usersInRoom.length} users in room ${roomSlug}`);

    usersInRoom.forEach((user) => {
        if (user.ws !== ws) {
            user.ws.send(payload);
        }
    });
}

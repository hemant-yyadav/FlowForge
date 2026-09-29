import { WebSocket } from "ws";
import { prismaClient } from "db";
import { getUsersInRoom } from "../UserManager.js";

export async function handleDraw(ws: WebSocket, roomSlug: string, shape: any, userId: string) {
    const room = await prismaClient.room.findUnique({
        where: { slug: roomSlug },
    });

    if (!room) return;

    // Persist shape to database
    try {
        await prismaClient.shape.create({
            data: {
                roomId: room.id,
                type: shape.type,
                data: JSON.stringify(shape),
                userId,
            },
        });
    } catch (e) {
        console.error("Failed to save shape to DB:", e);
    }

    const payload = JSON.stringify({ type: "draw", shape, roomId: roomSlug, userId });
    
    const usersInRoom = getUsersInRoom(roomSlug);
    usersInRoom.forEach((user) => {
        if (user.ws !== ws) {
            user.ws.send(payload);
        }
    });
}

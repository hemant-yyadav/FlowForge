import { Request, Response } from "express";
import { CreateRoomSchema } from "@repo/common/src/types";
import { prismaClient } from "db";

export async function createRoom(req: Request, res: Response) {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid inputs" });
        return;
    }
    const userId = req.userId;
    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId,
            },
        });
        res.json({ roomId: room.id });
    } catch {
        res.status(409).json({ message: "Room already exists" });
    }
}

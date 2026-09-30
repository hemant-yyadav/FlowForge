import { Request, Response } from "express";
import { prismaClient } from "db";
import { canAccessWorkspace, canAccessRoom } from "../utils/auth";

export async function getFavorites(req: Request, res: Response) {
    const userId = req.userId as string;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const favorites = await prismaClient.favorite.findMany({
            where: { userId },
            include: { note: true, room: true }
        });

        res.json({ favorites });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function toggleNoteFavorite(req: Request, res: Response) {
    const userId = req.userId as string;
    const noteId = req.params.noteId as string;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const note = await prismaClient.note.findUnique({ where: { id: noteId } });
        if (!note) return res.status(404).json({ message: "Note not found" });

        const hasAccess = await canAccessWorkspace(userId, note.workspaceId);
        if (!hasAccess) return res.status(403).json({ message: "Forbidden" });

        const existingFavorite = await prismaClient.favorite.findUnique({
            where: {
                userId_noteId: { userId, noteId }
            }
        });

        if (existingFavorite) {
            await prismaClient.favorite.delete({ where: { id: existingFavorite.id } });
            return res.json({ favorited: false });
        } else {
            await prismaClient.favorite.create({
                data: { userId, noteId }
            });
            return res.json({ favorited: true });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function toggleRoomFavorite(req: Request, res: Response) {
    const userId = req.userId as string;
    const roomId = parseInt(req.params.roomId as string);

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (isNaN(roomId)) return res.status(400).json({ message: "Invalid room ID" });

    try {
        const room = await prismaClient.room.findUnique({ where: { id: roomId } });
        if (!room) return res.status(404).json({ message: "Room not found" });

        const hasAccess = await canAccessRoom(userId, roomId);
        if (!hasAccess) return res.status(403).json({ message: "Forbidden" });

        const existingFavorite = await prismaClient.favorite.findUnique({
            where: {
                userId_roomId: { userId, roomId }
            }
        });

        if (existingFavorite) {
            await prismaClient.favorite.delete({ where: { id: existingFavorite.id } });
            return res.json({ favorited: false });
        } else {
            await prismaClient.favorite.create({
                data: { userId, roomId }
            });
            return res.json({ favorited: true });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
}

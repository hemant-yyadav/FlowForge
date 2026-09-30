import { WebSocketServer } from "ws";
import { checkUser } from "@repo/backend-common/auth";
import { addUser, removeUser, findUser } from "./UserManager.js";
import { handleJoinRoom } from "./handlers/joinHandler.js";
import { handleLeaveRoom } from "./handlers/leaveHandler.js";
import { handleChat } from "./handlers/chatHandler.js";
import { handleDraw } from "./handlers/drawHandler.js";
import { handleClearBoard } from "./handlers/clearHandler.js";
import { broadcastRoomUsers } from "./handlers/usersHandler.js";
import { getUsersInRoom } from "./UserManager.js";
import path from "path";
import { config } from "dotenv";

config({ path: path.resolve(__dirname, "../../../.env") });

const wss = new WebSocketServer({ port: 8080 });

import { prismaClient } from "db";

wss.on("connection", async function connection(ws, request) {
    const url = request.url;
    if (!url) {
        ws.close();
        return;
    }

    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get("token") ?? "";
    const userId = checkUser(token);
    if (!userId) {
        ws.close();
        return;
    }

    addUser({ ws, rooms: [], userId, name: "Unknown" });

    prismaClient.user.findUnique({
        where: { id: userId }
    }).then(dbUser => {
        if (!dbUser) {
            ws.close();
            return;
        }
        const user = findUser(ws);
        if (user) {
            user.name = dbUser.name;
            user.rooms.forEach(roomId => broadcastRoomUsers(roomId));
        }
    }).catch(console.error);

    ws.on("error", console.error);

    const connectionId = Math.random().toString(36).substring(2, 15);

    ws.on("message", async function message(data) {
        let parsed: any;
        const rawString = data.toString();
        console.log("Received raw message:", rawString);
        try {
            parsed = JSON.parse(rawString);
        } catch (e) {
            console.error("Failed to parse JSON:", e);
            return;
        }

        console.log("Parsed message:", parsed);

        if (parsed.type === "join_room") {
            await handleJoinRoom(ws, parsed.roomId, userId);
        }

        if (parsed.type === "leave_room") {
            handleLeaveRoom(ws, parsed.roomId);
        }

        if (parsed.type === "chat") {
            await handleChat(ws, parsed.roomId, parsed.message, userId);
        }

        if (parsed.type === "draw") {
            await handleDraw(ws, parsed.roomId, parsed.shape, userId);
        }

        if (parsed.type === "clear_board") {
            await handleClearBoard(ws, parsed.roomId, userId);
        }

        if (parsed.type === "cursor") {
            const usersInRoom = getUsersInRoom(parsed.roomId);
            const payload = JSON.stringify({ type: "cursor", x: parsed.x, y: parsed.y, userId: connectionId, roomId: parsed.roomId });
            usersInRoom.forEach((u: any) => {
                if (u.ws !== ws) u.ws.send(payload);
            });
        }
    });

    ws.on("close", () => {
        const user = findUser(ws);
        if (user) {
            const rooms = [...user.rooms];
            removeUser(ws);
            // Broadcast user left to all rooms they were in
            rooms.forEach(roomId => broadcastRoomUsers(roomId));
        }
    });
});
import { WebSocketServer } from "ws";
import { checkUser } from "@repo/backend-common/auth";
import { addUser, removeUser, findUser } from "./UserManager.js";
import { handleJoinRoom } from "./handlers/joinHandler.js";
import { handleLeaveRoom } from "./handlers/leaveHandler.js";
import { handleChat } from "./handlers/chatHandler.js";
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
        }
    }).catch(console.error);

    ws.on("error", console.error);

    ws.on("close", () => {
        removeUser(ws);
    });

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
            await handleJoinRoom(ws, parsed.roomId);
        }

        if (parsed.type === "leave_room") {
            handleLeaveRoom(ws, parsed.roomId);
        }

        if (parsed.type === "chat") {
            await handleChat(ws, parsed.roomId, parsed.message, userId);
        }
    });

    ws.on("close", () => {
        removeUser(ws);
    });
});
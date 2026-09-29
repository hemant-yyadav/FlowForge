import { WebSocketServer } from "ws";
import { checkUser } from "@repo/backend-common/auth";
import { addUser, removeUser } from "./UserManager.js";
import { handleJoinRoom } from "./handlers/joinHandler.js";
import { handleLeaveRoom } from "./handlers/leaveHandler.js";
import { handleChat } from "./handlers/chatHandler.js";
import path from "path";
import { config } from "dotenv";

config({ path: path.resolve(__dirname, "../../../.env") });

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws, request) {
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

    addUser({ ws, rooms: [], userId });

    ws.on("message", async function message(data) {
        let parsed: any;
        try {
            parsed = JSON.parse(data as unknown as string);
        } catch {
            return;
        }

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
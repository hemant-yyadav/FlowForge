import { createServer } from "http";
import { WebSocketServer } from "ws";
import { WebSocketInboundMessageSchema } from "@repo/common/src/types";
import { checkUser } from "@repo/backend-common/auth";
import { assertWebSocketConfiguration, isAllowedOrigin } from "@repo/backend-common/config";
import { prismaClient } from "db";
import { addUser, findUser, getActiveRooms, getUsersInRoom, removeUser } from "./UserManager.js";
import { handleJoinRoom } from "./handlers/joinHandler.js";
import { handleLeaveRoom } from "./handlers/leaveHandler.js";
import { handleChat } from "./handlers/chatHandler.js";
import { handleDraw } from "./handlers/drawHandler.js";
import { handleClearBoard } from "./handlers/clearHandler.js";
import { broadcastRoomUsers } from "./handlers/usersHandler.js";
import path from "path";
import { config } from "dotenv";

config({ path: path.resolve(__dirname, "../../../.env") });
assertWebSocketConfiguration();

const MAX_WEBSOCKET_MESSAGE_BYTES = 64 * 1024;

function sendError(ws: { readyState: number; send: (payload: string) => void }, message: string): void {
    if (ws.readyState === 1) ws.send(JSON.stringify({ type: "error", message }));
}

const server = createServer((req, res) => {
    const origin = req.headers.origin;
    if (origin && isAllowedOrigin(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

    if (req.method === "OPTIONS") {
        res.writeHead(isAllowedOrigin(origin) ? 204 : 403);
        res.end();
        return;
    }

    if (req.method === "GET" && req.url === "/api/active-rooms") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ activeRooms: getActiveRooms() }));
        return;
    }

    res.writeHead(404);
    res.end();
});

const wss = new WebSocketServer({
    server,
    maxPayload: MAX_WEBSOCKET_MESSAGE_BYTES,
    verifyClient: ({ origin }, done) => {
        // Browsers always send Origin. An absent origin is not implicitly trusted.
        done(isAllowedOrigin(origin), 403, "Forbidden origin");
    },
});

wss.on("connection", (ws) => {
    let authenticatedUserId: string | null = null;
    const connectionId = Math.random().toString(36).substring(2, 15);

    ws.on("error", () => {
        // Never log frames or URLs: they may contain credential material.
    });

    ws.on("message", async (data) => {
        let raw: unknown;
        try {
            raw = JSON.parse(data.toString());
        } catch {
            sendError(ws, "Invalid message");
            return;
        }

        const parsed = WebSocketInboundMessageSchema.safeParse(raw);
        if (!parsed.success) {
            sendError(ws, "Invalid message");
            return;
        }

        const message = parsed.data;
        if (message.type === "authenticate") {
            if (authenticatedUserId) {
                sendError(ws, "Already authenticated");
                return;
            }
            const userId = checkUser(message.token);
            if (!userId) {
                sendError(ws, "Unauthorized");
                ws.close(1008, "Unauthorized");
                return;
            }
            try {
                const dbUser = await prismaClient.user.findUnique({ where: { id: userId } });
                if (!dbUser) {
                    sendError(ws, "Unauthorized");
                    ws.close(1008, "Unauthorized");
                    return;
                }
                authenticatedUserId = userId;
                addUser({ ws, rooms: [], userId, name: dbUser.name, roles: {} });
                ws.send(JSON.stringify({ type: "authenticated" }));
            } catch {
                sendError(ws, "Authentication unavailable");
                ws.close(1011, "Authentication unavailable");
            }
            return;
        }

        if (!authenticatedUserId) {
            sendError(ws, "Authenticate before sending messages");
            return;
        }

        if (message.type === "join_room") {
            await handleJoinRoom(ws, message.roomId, authenticatedUserId);
        } else if (message.type === "leave_room") {
            if (findUser(ws)?.rooms.includes(message.roomId)) handleLeaveRoom(ws, message.roomId);
        } else if (message.type === "chat") {
            await handleChat(ws, message.roomId, message.message, authenticatedUserId);
        } else if (message.type === "draw") {
            await handleDraw(ws, message.roomId, message.shape, authenticatedUserId);
        } else if (message.type === "clear_board") {
            await handleClearBoard(ws, message.roomId, authenticatedUserId);
        } else if (message.type === "cursor") {
            const user = findUser(ws);
            if (!user || !user.rooms.includes(message.roomId) || user.roles[message.roomId] === "VIEWER") return;
            const payload = JSON.stringify({ type: "cursor", x: message.x, y: message.y, userId: connectionId, roomId: message.roomId });
            getUsersInRoom(message.roomId).forEach((roomUser) => {
                if (roomUser.ws !== ws && roomUser.ws.readyState === 1) roomUser.ws.send(payload);
            });
        }
    });

    ws.on("close", () => {
        const user = findUser(ws);
        if (!user) return;
        const rooms = [...user.rooms];
        removeUser(ws);
        rooms.forEach((roomId) => broadcastRoomUsers(roomId));
    });
});

server.listen(8080, () => {
    console.log("WebSocket server running on port 8080");
});

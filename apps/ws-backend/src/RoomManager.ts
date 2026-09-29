import { WebSocket } from "ws";
import { findUser } from "./UserManager.js";

export function joinRoom(ws: WebSocket, roomId: string) {
    const user = findUser(ws);
    if (user && !user.rooms.includes(roomId)) {
        user.rooms.push(roomId);
    }
}

export function leaveRoom(ws: WebSocket, roomId: string) {
    const user = findUser(ws);
    if (user) {
        user.rooms = user.rooms.filter((r) => r !== roomId);
    }
}

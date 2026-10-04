import { WebSocket } from "ws";
import { leaveRoom } from "../RoomManager.js";
import { broadcastRoomUsers } from "./usersHandler.js";

export function handleLeaveRoom(ws: WebSocket, roomId: string) {
    leaveRoom(ws, roomId);
    broadcastRoomUsers(roomId);
}

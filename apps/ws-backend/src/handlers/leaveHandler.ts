import { WebSocket } from "ws";
import { leaveRoom } from "../RoomManager";

export function handleLeaveRoom(ws: WebSocket, roomId: string) {
    leaveRoom(ws, roomId);
}

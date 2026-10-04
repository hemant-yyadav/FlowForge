import { useEffect, useRef, useState } from "react";
import { WS_URL } from "../config";

export function useWhiteboardSocket(roomId: string) {
    const wsRef = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);
    const [chats, setChats] = useState<{ message: string, userId: string, id: string }[]>([]);
    const [remoteShapes, setRemoteShapes] = useState<any[]>([]);
    const [remoteCursors, setRemoteCursors] = useState<{ [userId: string]: { x: number, y: number } }>({});
    const [clearTrigger, setClearTrigger] = useState(0);
    const [roomUsers, setRoomUsers] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        if (!roomId) return;
        let cancelled = false;
        let ws: WebSocket | null = null;
        void fetch("/api/ws-ticket", { method: "POST" })
            .then(async (response) => response.ok ? response.json() as Promise<{ ticket?: unknown }> : Promise.reject())
            .then(({ ticket }) => {
                if (cancelled || typeof ticket !== "string") return;
                ws = new WebSocket(WS_URL);
                wsRef.current = ws;
                ws.onopen = () => { setConnected(true); ws?.send(JSON.stringify({ type: "authenticate", token: ticket })); };
                ws.onmessage = onMessage;
                ws.onclose = () => setConnected(false);
            });

        const onMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);

            if (data.type === "authenticated") {
                ws?.send(JSON.stringify({ type: "join_room", roomId }));
                return;
            }
            
            if (data.type === "chat") {
                setChats((prev) => [...prev, { message: data.message, userId: data.senderName || data.userId, id: Math.random().toString() }]);
            }

            if (data.type === "draw") {
                setRemoteShapes((prev) => [...prev, data.shape]);
            }

            if (data.type === "clear_board") {
                setRemoteShapes([]);
                setClearTrigger(prev => prev + 1);
            }

            if (data.type === "room_users") {
                setRoomUsers(data.users);
            }

            if (data.type === "cursor") {
                setRemoteCursors((prev) => ({
                    ...prev,
                    [data.userId]: { x: data.x, y: data.y }
                }));
            }
        };

        return () => {
            cancelled = true;
            if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "leave_room", roomId }));
            ws?.close();
        };
    }, [roomId]);

    const sendChat = (message: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "chat", roomId, message }));
            // Locally append our own message instantly
            setChats((prev) => [...prev, { message, userId: "Me", id: Math.random().toString() }]);
        }
    };

    const sendDraw = (shape: any) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "draw", roomId, shape }));
        }
    };

    const sendCursor = (x: number, y: number) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "cursor", roomId, x, y }));
        }
    };

    const sendClearBoard = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "clear_board", roomId }));
        }
    };

    return { connected, chats, remoteShapes, remoteCursors, sendChat, sendDraw, sendCursor, sendClearBoard, clearTrigger, roomUsers };
}

import { useEffect, useRef, useState } from "react";
import { WS_URL } from "../config";

export function useWhiteboardSocket(roomId: string, token: string | null) {
    const wsRef = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);
    const [chats, setChats] = useState<{ message: string, userId: string, id: string }[]>([]);
    const [remoteShapes, setRemoteShapes] = useState<any[]>([]);
    const [remoteCursors, setRemoteCursors] = useState<{ [userId: string]: { x: number, y: number } }>({});
    const [clearTrigger, setClearTrigger] = useState(0);
    const [roomUsers, setRoomUsers] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        if (!token || !roomId) return;

        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            setConnected(true);
            // Keep the bearer token out of URLs, which are routinely logged by
            // browsers, proxies, and servers. The server requires this frame
            // before it accepts any room action.
            ws.send(JSON.stringify({ type: "authenticate", token }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "authenticated") {
                ws.send(JSON.stringify({ type: "join_room", roomId }));
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

        ws.onclose = () => {
            setConnected(false);
        };

        wsRef.current = ws;

        return () => {
            ws.send(JSON.stringify({ type: "leave_room", roomId }));
            ws.close();
        };
    }, [roomId, token]);

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

"use client";

import { useEffect, useRef, useState } from "react";
import { WS_URL } from "../lib/constants";

export interface ChatMessage {
    text: string;
    own: boolean;
}

export function useWebSocket(token: string | null, roomId: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!token || !roomId) return;

        const ws = new WebSocket(`${WS_URL}?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            ws.send(JSON.stringify({ type: "join_room", roomId }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "error") {
                setError(data.message);
                ws.close();
            } else if (data.type === "chat") {
                setMessages((prev) => [...prev, { text: data.message, own: false }]);
            }
        };

        ws.onclose = () => {
            setConnected(false);
        };

        return () => {
            ws.send(JSON.stringify({ type: "leave_room", roomId }));
            ws.close();
        };
    }, [token, roomId]);

    function sendMessage(message: string) {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        wsRef.current.send(JSON.stringify({ type: "chat", roomId, message }));
        setMessages((prev) => [...prev, { text: message, own: true }]);
    }

    return { messages, connected, error, sendMessage };
}

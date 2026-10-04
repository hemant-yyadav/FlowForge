"use client";

import { useEffect, useRef, useState } from "react";
import { WS_URL } from "../lib/constants";

export interface ChatMessage {
    text: string;
    own: boolean;
    senderName?: string;
}

export function useWebSocket(roomId: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

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
                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === "authenticated") ws?.send(JSON.stringify({ type: "join_room", roomId }));
                    else if (data.type === "error") { setError(data.message); ws?.close(); }
                    else if (data.type === "chat") setMessages((prev) => [...prev, { text: data.message, own: false, senderName: data.senderName }]);
                };
                ws.onclose = () => setConnected(false);
            })
            .catch(() => setError("Unable to authenticate realtime connection"));
        return () => {
            cancelled = true;
            if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "leave_room", roomId }));
            ws?.close();
        };
    }, [roomId]);

    function sendMessage(message: string) {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        wsRef.current.send(JSON.stringify({ type: "chat", roomId, message }));
        setMessages((prev) => [...prev, { text: message, own: true }]);
    }

    return { messages, connected, error, sendMessage };
}

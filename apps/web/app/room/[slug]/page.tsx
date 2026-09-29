"use client";

import { useRef, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import { useWebSocket } from "../../../hooks/useWebSocket";
import styles from "./room.module.css";

export default function RoomPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const { token, loading } = useAuth();
    const { messages, connected, error, sendMessage } = useWebSocket(token, slug);
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage(input.trim());
        setInput("");
    }

    if (loading || !token) return null;

    if (error) {
        return (
            <div className={styles.page} style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                <h1 style={{ color: "var(--accent-light)", marginBottom: "20px" }}>{error}</h1>
                <button className="btn-primary" onClick={() => router.push("/dashboard")}>Back to Dashboard</button>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <button
                    id="back-btn"
                    className={styles.backBtn}
                    onClick={() => router.push("/dashboard")}
                >
                    ←
                </button>
                <div>
                    <h1 className={styles.roomName}># {slug}</h1>
                    <span className={`${styles.status} ${connected ? styles.online : styles.offline}`}>
                        {connected ? "Connected" : "Connecting..."}
                    </span>
                </div>
            </header>

            <div className={styles.messages}>
                {messages.length === 0 && (
                    <div className={styles.empty}>
                        <p>No messages yet.</p>
                        <p>Start the conversation!</p>
                    </div>
                )}
                {messages.map((msg, i) => {
                    const isOwn = msg.own;
                    return (
                        <div key={i} className={`${styles.messageRow} ${isOwn ? styles.rowOwn : styles.rowOther}`}>
                            {!isOwn && (
                                <div className={styles.avatar}>
                                    {msg.senderName ? msg.senderName.charAt(0).toUpperCase() : "?"}
                                </div>
                            )}
                            <div className={`${styles.bubble} ${isOwn ? styles.own : styles.other}`}>
                                {!isOwn && (
                                    <div className={styles.senderName}>
                                        {msg.senderName || "Unknown"}
                                    </div>
                                )}
                                <div className={styles.messageText}>{msg.text}</div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <form className={styles.inputBar} onSubmit={handleSend}>
                <input
                    id="message-input"
                    type="text"
                    className="input-field"
                    placeholder={`Message #${slug}`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    autoComplete="off"
                />
                <button
                    id="send-btn"
                    type="submit"
                    className={styles.sendBtn}
                    disabled={!connected || !input.trim()}
                >
                    ➤
                </button>
            </form>
        </div>
    );
}

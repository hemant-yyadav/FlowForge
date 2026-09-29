import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Users } from "lucide-react";

interface ChatSidebarProps {
    chats: { message: string, userId: string, id: string }[];
    sendChat: (message: string) => void;
    roomUsers?: { id: string, name: string }[];
}

export function ChatSidebar({ chats, sendChat, roomUsers = [] }: ChatSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"chat" | "people">("chat");
    const [message, setMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && activeTab === "chat") {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [chats, isOpen, activeTab]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        sendChat(message);
        setMessage("");
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: "absolute",
                    bottom: 20,
                    left: 20,
                    backgroundColor: "#1e1e1e",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 50,
                    height: 50,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                    zIndex: 10
                }}
            >
                <MessageCircle size={24} />
            </button>
        );
    }

    return (
        <div style={{
            position: "absolute",
            top: 20,
            left: 20,
            bottom: 20,
            width: 320,
            backgroundColor: "rgba(30, 30, 30, 0.9)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            zIndex: 10,
            overflow: "hidden"
        }}>
            <div style={{
                padding: "16px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <div style={{ display: "flex", gap: "16px" }}>
                    <button
                        onClick={() => setActiveTab("chat")}
                        style={{ 
                            background: "transparent", 
                            border: "none", 
                            color: activeTab === "chat" ? "#fff" : "#888", 
                            cursor: "pointer",
                            fontSize: "16px",
                            fontWeight: activeTab === "chat" ? 600 : 400
                        }}
                    >
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveTab("people")}
                        style={{ 
                            background: "transparent", 
                            border: "none", 
                            color: activeTab === "people" ? "#fff" : "#888", 
                            cursor: "pointer",
                            fontSize: "16px",
                            fontWeight: activeTab === "people" ? 600 : 400
                        }}
                    >
                        People
                    </button>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer" }}
                >
                    <X size={20} />
                </button>
            </div>

            {activeTab === "chat" ? (
                <>
                    <div style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px"
                    }}>
                        {chats.map(chat => {
                            const name = (chat as any).senderName || chat.userId || "Unknown";
                            
                            return (
                                <div key={chat.id} style={{
                                    background: "rgba(255,255,255,0.05)",
                                    padding: "10px 14px",
                                    borderRadius: "12px",
                                    color: "#fff",
                                    fontSize: "14px",
                                    alignSelf: "flex-start",
                                    maxWidth: "85%",
                                    wordBreak: "break-word"
                                }}>
                                    <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>
                                        {name !== "Me" && name !== "Unknown" ? `User ${name.slice(0, 5)}` : name}
                                    </div>
                                    {chat.message}
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} style={{
                        padding: "16px",
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                        display: "flex",
                        gap: "8px"
                    }}>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            style={{
                                flex: 1,
                                background: "rgba(0,0,0,0.3)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "20px",
                                padding: "10px 16px",
                                color: "#fff",
                                outline: "none"
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                background: "#007bff",
                                border: "none",
                                borderRadius: "50%",
                                width: 40,
                                height: 40,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                cursor: "pointer"
                            }}
                        >
                            <Send size={18} style={{ marginLeft: "-2px" }} />
                        </button>
                    </form>
                </>
            ) : (
                <div style={{ flex: 1, padding: "16px", overflowY: "auto" }}>
                    <h4 style={{ color: "#888", fontSize: "12px", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "1px" }}>
                        In Room ({roomUsers.length})
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {roomUsers.map((user, idx) => (
                            <div key={`${user.id}-${idx}`} style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "10px",
                                background: "rgba(255,255,255,0.03)",
                                borderRadius: "10px"
                            }}>
                                <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    background: "#007bff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#fff",
                                    fontWeight: "bold",
                                    fontSize: "14px"
                                }}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ color: "#fff", fontSize: "14px" }}>
                                    {user.name}
                                </span>
                            </div>
                        ))}
                        {roomUsers.length === 0 && (
                            <div style={{ color: "#888", fontSize: "13px", fontStyle: "italic" }}>
                                You are the only one here.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

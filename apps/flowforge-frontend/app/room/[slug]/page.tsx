"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { HTTP_URL } from "../../../config";
import { useWhiteboardSocket } from "../../../hooks/useWhiteboardSocket";
import { useCanvas } from "../../../hooks/useCanvas";
import { Toolbar } from "../../../components/Toolbar";
import { ChatSidebar } from "../../../components/ChatSidebar";
import { CursorOverlay } from "../../../components/CursorOverlay";
import { LogOut } from "lucide-react";

import { Suspense } from "react";

function RoomCanvasInner() {
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug as string;
    
    const router = useRouter();
    const embeddedParam = searchParams.get("embedded");
    const isEmbedded = embeddedParam === "true";
    
    // Debug log to ensure client is re-evaluating
    useEffect(() => {
        console.log("RoomCanvas mount - embedded param:", embeddedParam, "isEmbedded:", isEmbedded);
    }, [embeddedParam, isEmbedded]);

    const [token, setToken] = useState<string | null>(null);
    const [initialShapes, setInitialShapes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [role, setRole] = useState<string>("VIEWER");

    useEffect(() => {
        let storedToken = localStorage.getItem("token");
        const urlToken = searchParams.get("token");

        if (urlToken) {
            localStorage.setItem("token", urlToken);
            storedToken = urlToken;
            window.history.replaceState({}, document.title, `/room/${slug}`);
        }

        if (!storedToken) {
            router.push("/signin");
            return;
        }
        setToken(storedToken);

        // Fetch initial shapes from HTTP backend
        fetch(`http://localhost:3001/room/${slug}/shapes`, {
            headers: { "Authorization": `Bearer ${storedToken}` }
        })
        .then(async (res) => {
            if (res.status === 404) {
                setError("Room not found");
                setLoading(false);
                return null;
            }
            if (!res.ok) {
                setError("Failed to load");
                setLoading(false);
                return null;
            }
            return res.json();
        })
        .then((data) => {
            if (!data) return; // Handled above
            if (data.shapes) {
                // Parse the stringified shape data from DB
                const parsedShapes = data.shapes.map((s: any) => JSON.parse(s.data));
                setInitialShapes(parsedShapes);
            }
            if (data.role) {
                setRole(data.role);
            }
            setLoading(false);
        })
        .catch(err => {
            console.error("Failed to load shapes:", err);
            setError("Failed to load");
            setLoading(false);
        });
    }, [slug, searchParams, router]);

    const { connected, chats, remoteShapes, remoteCursors, sendChat, sendDraw, sendCursor, sendClearBoard, clearTrigger, roomUsers } = useWhiteboardSocket(slug, token);
    
    useEffect(() => {
        if (clearTrigger > 0) {
            setInitialShapes([]);
        }
    }, [clearTrigger]);

    const { 
        canvasRef, 
        onMouseDown, 
        onMouseMove, 
        onMouseUp, 
        currentTool, 
        setCurrentTool, 
        color, 
        setColor,
        clearBoard
    } = useCanvas(initialShapes, remoteShapes, sendDraw, sendCursor, sendClearBoard, () => setInitialShapes([]), clearTrigger);

    if (error) {
        return (
            <div style={{ display: "flex", flexDirection: "column", height: "100vh", alignItems: "center", justifyContent: "center", background: "#111", color: "#fff", gap: "20px" }}>
                <h2 style={{ margin: 0 }}>{error === "Room not found" ? "Room Not Found" : "Connection Error"}</h2>
                <p style={{ color: "#aaa", marginTop: "-10px" }}>This room does not exist. Please create it from the dashboard.</p>
                <button 
                    onClick={() => window.location.href = "/workspaces"}
                    style={{
                        padding: "10px 20px",
                        background: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                >
                    Go to Dashboard
                </button>
            </div>
        );
    }

    if (loading) {
        return <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#111", color: "#fff" }}>Loading canvas...</div>;
    }

    if (isEmbedded) {
        return (
            <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#111" }}>
                <CursorOverlay cursors={remoteCursors} />
                <canvas
                    ref={canvasRef}
                    onMouseDown={role !== "VIEWER" ? onMouseDown : undefined}
                    onMouseMove={role !== "VIEWER" ? onMouseMove : undefined}
                    onMouseUp={role !== "VIEWER" ? onMouseUp : undefined}
                    onMouseLeave={role !== "VIEWER" ? onMouseUp : undefined}
                    style={{ display: "block", cursor: role !== "VIEWER" ? "crosshair" : "default" }}
                />
                {!connected && (
                    <div style={{ position: "absolute", bottom: 20, right: 20, background: "rgba(255,0,0,0.8)", padding: "8px 16px", borderRadius: "8px", color: "#fff", fontSize: "12px" }}>
                        Disconnected. Trying to reconnect...
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#111" }}>
            {role !== "VIEWER" && (
                <Toolbar currentTool={currentTool} setCurrentTool={setCurrentTool} color={color} setColor={setColor} clearBoard={clearBoard} />
            )}
            <ChatSidebar chats={chats} sendChat={sendChat} roomUsers={roomUsers} />
            
            <CursorOverlay cursors={remoteCursors} />
            
            <button
                onClick={() => {
                        if (window.opener) {
                            window.close();
                        }
                        // Fallback or if not opened via target=_blank
                        window.location.href = "/workspaces";
                    }}
                    style={{
                        position: "absolute",
                        top: 20,
                        right: 20,
                        background: "rgba(30, 30, 30, 0.9)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        padding: "10px 16px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        zIndex: 10,
                        fontWeight: 500,
                        transition: "all 0.2s"
                    }}
                >
                    <LogOut size={18} />
                    Exit Room
                </button>

            <canvas
                ref={canvasRef}
                onMouseDown={role !== "VIEWER" ? onMouseDown : undefined}
                onMouseMove={role !== "VIEWER" ? onMouseMove : undefined}
                onMouseUp={role !== "VIEWER" ? onMouseUp : undefined}
                onMouseLeave={role !== "VIEWER" ? onMouseUp : undefined}
                style={{
                    display: "block",
                    cursor: role !== "VIEWER" ? "crosshair" : "default"
                }}
            />
            
            {!connected && (
                <div style={{ position: "absolute", bottom: 20, right: 20, background: "rgba(255,0,0,0.8)", padding: "8px 16px", borderRadius: "8px", color: "#fff", fontSize: "12px" }}>
                    Disconnected. Trying to reconnect...
                </div>
            )}
        </div>
    );
}

export default function RoomCanvas() {
    return (
        <Suspense fallback={<div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#111", color: "#fff" }}>Loading...</div>}>
            <RoomCanvasInner />
        </Suspense>
    );
}

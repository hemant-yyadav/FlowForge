"use client";
import { useState, useEffect, useRef } from "react";
import { ExternalLink, MonitorUp } from "lucide-react";

export function WhiteboardEmbed({ slug, inline = false }: { slug: string, inline?: boolean }) {
    const [isPoppedOut, setIsPoppedOut] = useState(false);
    const externalWindow = useRef<Window | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const handleOpenInNewTab = () => {
        externalWindow.current = window.open(`/room/${slug}`, "_blank");
        setIsPoppedOut(true);

        // Check if the user closed the pop-out tab
        intervalRef.current = setInterval(() => {
            if (externalWindow.current?.closed) {
                setIsPoppedOut(false);
                externalWindow.current = null;
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        }, 500);
    };

    const handleReEmbed = () => {
        setIsPoppedOut(false);
        if (externalWindow.current && !externalWindow.current.closed) {
            externalWindow.current.close();
        }
        externalWindow.current = null;
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const height = inline ? "500px" : "calc(100vh - 120px)";

    if (isPoppedOut) {
        return (
            <div style={{ position: "relative", width: "100%", height, borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)", animation: "fadeIn 0.3s ease", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg-card)", margin: inline ? "24px 0" : 0 }}>
                <MonitorUp size={64} color="var(--accent)" style={{ marginBottom: "24px", opacity: 0.8 }} />
                <h3 style={{ margin: "0 0 12px 0", color: "var(--text-primary)" }}>Whiteboard popped out</h3>
                <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>This whiteboard is currently opened in a new tab.</p>
                <button className="btn-primary" onClick={handleReEmbed}>
                    Re-embed here
                </button>
            </div>
        );
    }

    return (
        <div style={{ position: "relative", width: "100%", height, borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)", animation: "fadeIn 0.3s ease", margin: inline ? "24px 0" : 0 }}>
            {!inline && (
                <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
                    <button 
                        onClick={handleOpenInNewTab}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "var(--bg-card)",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            fontSize: "0.85rem",
                            color: "var(--text-primary)",
                            textDecoration: "none",
                            border: "1px solid var(--border)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            transition: "all 0.2s ease",
                            cursor: "pointer"
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = "var(--bg-input)";
                            e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = "var(--bg-card)";
                            e.currentTarget.style.transform = "translateY(0)";
                        }}
                    >
                        <ExternalLink size={14} /> Open in New Tab
                    </button>
                </div>
            )}
            <iframe src={`/room/${slug}?embedded=true`} style={{ width: "100%", height: "100%", border: "none" }} />
        </div>
    );
}

"use client";
import { ExternalLink } from "lucide-react";

export function WhiteboardEmbed({ slug }: { slug: string }) {
    // Simply embed the canvas via iframe to avoid hook conflicts, as the canvas is extremely complex
    // and expects full window control (Toolbar, overlays, socket handlers).
    return (
        <div style={{ position: "relative", width: "100%", height: "calc(100vh - 120px)", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)", animation: "fadeIn 0.3s ease" }}>
            <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
                <a 
                    href={`/room/${slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
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
                        transition: "all 0.2s ease"
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
                </a>
            </div>
            <iframe src={`/room/${slug}?embedded=true`} style={{ width: "100%", height: "100%", border: "none" }} />
        </div>
    );
}

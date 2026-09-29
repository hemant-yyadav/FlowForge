import React from "react";
import { MousePointer2 } from "lucide-react";

interface CursorOverlayProps {
    cursors: { [userId: string]: { x: number, y: number } };
}

export function CursorOverlay({ cursors }: CursorOverlayProps) {
    // Generate a consistent color from userId
    const getColor = (id: string) => {
        const colors = ["#ff4b4b", "#4caf50", "#2196f3", "#ffeb3b", "#9c27b0", "#ff9800"];
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 5 }}>
            {Object.entries(cursors).map(([userId, pos]) => (
                <div
                    key={userId}
                    style={{
                        position: "absolute",
                        left: pos.x,
                        top: pos.y,
                        transform: "translate(-50%, -50%)",
                        transition: "all 0.1s linear",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}
                >
                    <MousePointer2 size={16} fill={getColor(userId)} color={getColor(userId)} style={{ transform: "rotate(-15deg)" }} />
                    <div style={{
                        background: getColor(userId),
                        color: "#fff",
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "8px",
                        marginTop: "4px",
                        fontWeight: "bold",
                        whiteSpace: "nowrap"
                    }}>
                        User {userId.slice(0, 5)}
                    </div>
                </div>
            ))}
        </div>
    );
}

import React from "react";
import { Pencil, Square, Circle, ArrowRight, Type, Eraser, MousePointer2 } from "lucide-react";
import { Tool } from "../hooks/useCanvas";

interface ToolbarProps {
    currentTool: Tool;
    setCurrentTool: (tool: Tool) => void;
    color: string;
    setColor: (color: string) => void;
    clearBoard: () => void;
}

export function Toolbar({ currentTool, setCurrentTool, color, setColor, clearBoard }: ToolbarProps) {
    const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
        { id: "pencil", icon: <Pencil size={20} />, label: "Pencil" },
        { id: "rect", icon: <Square size={20} />, label: "Rectangle" },
        { id: "circle", icon: <Circle size={20} />, label: "Circle" },
        { id: "arrow", icon: <ArrowRight size={20} />, label: "Arrow" },
        // { id: "text", icon: <Type size={20} />, label: "Text" },
        { id: "eraser", icon: <Eraser size={20} />, label: "Eraser" },
    ];

    const colors = ["#ffffff", "#ff4b4b", "#4caf50", "#2196f3", "#ffeb3b", "#9c27b0"];

    return (
        <div style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#1e1e1e",
            padding: "8px 16px",
            borderRadius: "12px",
            display: "flex",
            gap: "16px",
            alignItems: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            zIndex: 10
        }}>
            <div style={{ display: "flex", gap: "8px" }}>
                {tools.map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => setCurrentTool(tool.id)}
                        style={{
                            background: currentTool === tool.id ? "rgba(255,255,255,0.1)" : "transparent",
                            border: "none",
                            color: currentTool === tool.id ? "#fff" : "#888",
                            padding: "8px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                        title={tool.label}
                    >
                        {tool.icon}
                    </button>
                ))}
            </div>
            
            <div style={{ width: "1px", height: "24px", background: "#333" }} />
            
            <div style={{ display: "flex", gap: "8px" }}>
                {colors.map(c => (
                    <button
                        key={c}
                        onClick={() => setColor(c)}
                        style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            backgroundColor: c,
                            border: color === c ? "2px solid #fff" : "2px solid transparent",
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                    />
                ))}
            </div>

            <div style={{ width: "1px", height: "24px", background: "#333" }} />

            <button
                onClick={clearBoard}
                style={{
                    background: "rgba(255, 75, 75, 0.1)",
                    border: "1px solid rgba(255, 75, 75, 0.3)",
                    color: "#ff4b4b",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontSize: "13px",
                    fontWeight: 500
                }}
            >
                Clear Board
            </button>
        </div>
    );
}

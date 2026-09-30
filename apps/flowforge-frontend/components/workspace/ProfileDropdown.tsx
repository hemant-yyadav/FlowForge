"use client";
import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";
import styles from "./components.module.css";

interface ProfileDropdownProps {
    user: { id: string; name: string; username?: string; email?: string };
    onLogout: () => void;
}

export function ProfileDropdown({ user, onLogout }: ProfileDropdownProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setOpen(false);
        }, 150); // slight delay to prevent flickering
    };

    const initial = user.name ? user.name.charAt(0).toUpperCase() : "?";

    return (
        <div 
            ref={containerRef} 
            style={{ position: "relative", zIndex: 50 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button 
                onClick={() => setOpen(!open)}
                style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "var(--accent)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    transition: "transform 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                title="Account Settings"
            >
                {initial}
            </button>

            {open && (
                <div style={{
                    position: "absolute",
                    top: "100%",
                    right: "0",
                    marginTop: "8px",
                    width: "240px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    animation: "fadeIn 0.15s ease-out"
                }}>
                    <div style={{ padding: "16px", borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                            {user.name}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            @{user.username || "user"}
                        </div>
                        {user.email && (
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                                {user.email}
                            </div>
                        )}
                    </div>
                    <div style={{ padding: "8px" }}>
                        <button 
                            onClick={onLogout}
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "10px 12px",
                                background: "transparent",
                                border: "none",
                                borderRadius: "8px",
                                color: "var(--error)",
                                cursor: "pointer",
                                fontSize: "0.9rem",
                                fontWeight: 500,
                                textAlign: "left",
                                transition: "background 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = "rgba(255, 0, 0, 0.1)"}
                            onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

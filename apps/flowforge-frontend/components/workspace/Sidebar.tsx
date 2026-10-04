"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Menu, Home, Book, Edit3, Star, Clock, Settings, LogOut, Sun, Moon, Brain } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { useNotes, useWorkspaceRooms } from "../../hooks/useNotes";

export function Sidebar({ 
    workspaceId, 
    workspaceName, 
    collapsed, 
    onToggle 
}: { 
    workspaceId: string; 
    workspaceName: string;
    collapsed: boolean;
    onToggle: () => void;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const { signout } = useAuth();

    const searchParams = useSearchParams();

    // Fetch notes/rooms for the "Recent" section
    const { data: notesData } = useNotes(workspaceId);
    const { data: roomsData } = useWorkspaceRooms(workspaceId);

    const [recentItems, setRecentItems] = useState<Array<{id: string, title: string, type: string, date: string}>>([]);

    useEffect(() => {
        if (!notesData || !roomsData) return;
        const notes = notesData.notes || [];
        const rooms = roomsData.rooms || [];
        const combined = [
            ...notes.map((n: any) => ({ id: n.id, title: n.title, type: "note", date: n.updatedAt })),
            ...rooms.map((r: any) => ({ id: r.slug, title: r.slug, type: "whiteboard", date: r.createdAt }))
        ];
        combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecentItems(combined.slice(0, 5)); // top 5 recent
    }, [notesData, roomsData]);

    const navItems = [
        { icon: <Home size={18} />, label: "Dashboard", path: `/workspace/${workspaceId}` },
        { icon: <Book size={18} />, label: "Notes", path: `/workspace/${workspaceId}/notes` },
        { icon: <Edit3 size={18} />, label: "Whiteboards", path: `/workspace/${workspaceId}?filter=Whiteboards` },
        { icon: <Star size={18} />, label: "Favorites", path: `/workspace/${workspaceId}?filter=Favorites` },
    ];

    const isPathActive = (path: string) => {
        const urlFilter = searchParams.get("filter");
        
        if (path.includes("?filter=")) {
            const filterValue = path.split("?filter=")[1];
            return pathname === `/workspace/${workspaceId}` && urlFilter === filterValue;
        }

        if (path === `/workspace/${workspaceId}`) {
            return pathname === path && !urlFilter;
        }
        return pathname.startsWith(path);
    };

    return (
        <>
            <div
                className="glass-sidebar"
                style={{
                    position: "fixed",
                    top: "16px",
                    left: "16px",
                    height: "calc(100vh - 32px)",
                    borderRadius: "16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "20px 12px",
                    zIndex: 40,
                    transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    width: collapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-expanded-width)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)"
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto", overflowX: "hidden" }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", padding: "0 4px" }}>
                        <button
                            onClick={onToggle}
                            style={{ background: "transparent", color: "var(--text-muted)", padding: "4px", display: "flex", alignItems: "center", justifyItems: "center", borderRadius: "8px", border: "none", cursor: "pointer", flexShrink: 0 }}
                        >
                            <Menu size={20} />
                        </button>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", opacity: collapsed ? 0 : 1, transition: "opacity 0.2s", width: collapsed ? 0 : "auto", whiteSpace: "nowrap" }}>
                            <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text-primary)" }}>{workspaceName || "FlowForge"}</span>
                            <Brain size={20} style={{ color: "var(--accent)" }} strokeWidth={1.5} />
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {navItems.map((item) => {
                            const isActive = isPathActive(item.path);
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => item.path !== "#" && router.push(item.path)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: "16px", padding: "10px 12px",
                                        borderRadius: "8px", cursor: "pointer", transition: "all 0.2s ease-out",
                                        background: isActive ? "var(--bg-input)" : "transparent",
                                        color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                                        borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
                                    }}
                                    onMouseOver={e => {
                                        if (!isActive) e.currentTarget.style.background = "var(--bg-input)";
                                        e.currentTarget.style.color = "var(--text-primary)";
                                    }}
                                    onMouseOut={e => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = "transparent";
                                            e.currentTarget.style.color = "var(--text-secondary)";
                                        }
                                    }}
                                >
                                    <span style={{ flexShrink: 0 }}>{item.icon}</span>
                                    <span style={{ fontSize: "0.95rem", fontWeight: 500, opacity: collapsed ? 0 : 1, transition: "opacity 0.2s", whiteSpace: "nowrap" }}>
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Recent Items */}
                    {!collapsed && recentItems.length > 0 && (
                        <div style={{ marginTop: "32px", padding: "0 12px" }}>
                            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <Clock size={12} /> Recent
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                {recentItems.map(item => (
                                    <div 
                                        key={`${item.type}_${item.id}`}
                                        onClick={() => router.push(`/workspace/${workspaceId}?open=${item.type}_${item.id}`)}
                                        style={{ fontSize: "0.85rem", padding: "6px 8px", borderRadius: "6px", cursor: "pointer", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                                        onMouseOver={e => e.currentTarget.style.background = "var(--bg-input)"}
                                        onMouseOut={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        {item.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                    <div style={{ opacity: collapsed ? 0 : 1, transition: "opacity 0.2s", overflow: "hidden", height: collapsed ? 0 : "auto" }}>
                        <div className="theme-toggle-pill" style={{ margin: "0 8px" }}>
                            <button
                                onClick={() => theme !== "light" && toggleTheme()}
                                className={`theme-toggle-btn ${theme === "light" ? "active" : ""}`}
                                title="Light mode"
                                style={{ color: theme === "light" ? "var(--text-primary)" : "var(--text-muted)" }}
                            >
                                <Sun size={16} />
                            </button>
                            <button
                                onClick={() => theme !== "dark" && toggleTheme()}
                                className={`theme-toggle-btn ${theme === "dark" ? "active" : ""}`}
                                title="Dark mode"
                                style={{ color: theme === "dark" ? "var(--text-primary)" : "var(--text-muted)" }}
                            >
                                <Moon size={16} />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push("/workspaces")}
                        style={{ display: "flex", alignItems: "center", gap: "16px", padding: "10px 12px", borderRadius: "8px", cursor: "pointer", color: "var(--text-secondary)", background: "transparent", transition: "all 0.2s", border: "none" }}
                        onMouseOver={e => e.currentTarget.style.background = "var(--bg-input)"}
                        onMouseOut={e => e.currentTarget.style.background = "transparent"}
                    >
                        <span style={{ flexShrink: 0 }}><Settings size={18} /></span>
                        <span style={{ fontSize: "0.95rem", fontWeight: 500, opacity: collapsed ? 0 : 1, transition: "opacity 0.2s", whiteSpace: "nowrap" }}>Switch Workspace</span>
                    </button>

                    <button
                        onClick={signout}
                        style={{ display: "flex", alignItems: "center", gap: "16px", padding: "10px 12px", borderRadius: "8px", cursor: "pointer", color: "var(--error)", background: "transparent", transition: "all 0.2s", border: "none" }}
                        onMouseOver={e => e.currentTarget.style.background = "rgba(229,57,53,0.1)"}
                        onMouseOut={e => e.currentTarget.style.background = "transparent"}
                    >
                        <span style={{ flexShrink: 0 }}><LogOut size={18} /></span>
                        <span style={{ fontSize: "0.95rem", fontWeight: 500, opacity: collapsed ? 0 : 1, transition: "opacity 0.2s", whiteSpace: "nowrap" }}>Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
}

"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useWorkspace } from "../../../hooks/useWorkspaces";
import { useAuth } from "../../../hooks/useAuth";
import { Sidebar } from "../../../components/workspace/Sidebar";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
    const { workspaceId } = useParams<{workspaceId: string}>();
    const { token } = useAuth();
    const { data } = useWorkspace(workspaceId, token);
    const workspace = data?.workspace;

    const [collapsed, setCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedState = localStorage.getItem("flowforge-sidebar");
        if (storedState) {
            try {
                const parsed = JSON.parse(storedState);
                if (typeof parsed.collapsed === "boolean") {
                    setCollapsed(parsed.collapsed);
                }
            } catch {
                // Ignore parse error
            }
        }
    }, []);

    const toggleSidebar = () => {
        setCollapsed((prev) => {
            const newState = !prev;
            localStorage.setItem("flowforge-sidebar", JSON.stringify({ collapsed: newState }));
            return newState;
        });
    };

    // Keyboard shortcut support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
                e.preventDefault();
                setCollapsed((prev) => {
                    const newState = !prev;
                    localStorage.setItem("flowforge-sidebar", JSON.stringify({ collapsed: newState }));
                    return newState;
                });
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Don't render until mounted to avoid hydration mismatch with localStorage
    if (!mounted) {
        return <div style={{ background: "var(--bg-primary)", height: "100vh" }} />;
    }

    return (
        <div style={{ display: "flex", height: "100vh", background: "var(--bg-primary)", overflow: "hidden" }}>
            <Sidebar 
                workspaceId={workspaceId} 
                workspaceName={workspace?.name || "Workspace"} 
                collapsed={collapsed}
                onToggle={toggleSidebar}
            />
            <main 
                style={{ 
                    flex: 1, 
                    overflowY: "auto", 
                    marginLeft: collapsed ? "calc(var(--sidebar-collapsed-width) + 32px)" : "calc(var(--sidebar-expanded-width) + 32px)",
                    transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    height: "100vh",
                    padding: "16px 16px 16px 0"
                }}
            >
                <div style={{ 
                    background: "var(--bg-card)", 
                    borderRadius: "16px", 
                    height: "100%", 
                    overflow: "hidden", 
                    border: "1px solid var(--border)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)"
                }}>
                    {children}
                </div>
            </main>
        </div>
    );
}

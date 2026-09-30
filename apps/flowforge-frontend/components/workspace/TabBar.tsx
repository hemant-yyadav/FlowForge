"use client";
import { X, LayoutDashboard, FileText, Edit3, Settings } from "lucide-react";
import styles from "./components.module.css";
import { WorkspaceTab } from "../../hooks/useTabManager";
import { ProfileDropdown } from "./ProfileDropdown";

export function TabBar({ tabs, activeTabId, onTabClick, onTabClose, user, onLogout }: { tabs: WorkspaceTab[], activeTabId: string, onTabClick: (id: string) => void, onTabClose: (id: string) => void, user?: any, onLogout?: () => void }) {
    return (
        <div className={styles.tabBar}>
            <div className={styles.tabContainer}>
                {tabs.map(tab => (
                    <div key={tab.id} className={`${styles.tabItem} ${activeTabId === tab.id ? styles.active : ""}`} onClick={() => onTabClick(tab.id)}>
                        {tab.type === "dashboard" && <LayoutDashboard size={16} />}
                        {tab.type === "note" && <FileText size={16} />}
                        {tab.type === "whiteboard" && <Edit3 size={16} />}
                        {tab.type === "settings" && <Settings size={16} />}
                        {tab.title}
                        {tab.id !== "dashboard" && tab.id !== "settings" && (
                            <span className={styles.tabClose} onClick={(e) => { e.stopPropagation(); onTabClose(tab.id); }}>
                                <X size={14} />
                            </span>
                        )}
                    </div>
                ))}
            </div>
            {user && onLogout && (
                <div style={{ marginLeft: "16px", padding: "8px 0" }}>
                    <ProfileDropdown user={user} onLogout={onLogout} />
                </div>
            )}
        </div>
    );
}

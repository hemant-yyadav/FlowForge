"use client";
import { X, LayoutDashboard, FileText, Edit3 } from "lucide-react";
import styles from "./components.module.css";
import { WorkspaceTab } from "../../hooks/useTabManager";

export function TabBar({ tabs, activeTabId, onTabClick, onTabClose }: { tabs: WorkspaceTab[], activeTabId: string, onTabClick: (id: string) => void, onTabClose: (id: string) => void }) {
    return (
        <div className={styles.tabBar}>
            {tabs.map(tab => (
                <div key={tab.id} className={`${styles.tabItem} ${activeTabId === tab.id ? styles.active : ""}`} onClick={() => onTabClick(tab.id)}>
                    {tab.type === "dashboard" && <LayoutDashboard size={16} />}
                    {tab.type === "note" && <FileText size={16} />}
                    {tab.type === "whiteboard" && <Edit3 size={16} />}
                    {tab.title}
                    {tab.id !== "dashboard" && (
                        <span className={styles.tabClose} onClick={(e) => { e.stopPropagation(); onTabClose(tab.id); }}>
                            <X size={14} />
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}

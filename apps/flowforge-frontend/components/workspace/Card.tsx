"use client";
import styles from "./components.module.css";
import { Star, Clock, Trash2 } from "lucide-react";

export function ContentCard({ 
    type, 
    id, 
    title, 
    preview, 
    tags = [], 
    date, 
    isFavorite,
    isLive, 
    onToggleFavorite, 
    onClick,
    onDelete
}: { 
    type: "note" | "whiteboard", 
    id: string, 
    title: string, 
    preview?: string, 
    tags?: any[], 
    date: string, 
    isFavorite: boolean,
    isLive?: boolean,
    onToggleFavorite: (e: React.MouseEvent) => void, 
    onClick: () => void,
    onDelete?: (e: React.MouseEvent) => void
}) {
    return (
        <div className={styles.noteCard} onClick={onClick}>
            <div className={styles.noteTitleRow}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", minWidth: 0, overflow: "hidden" }}>
                    {type === "note" ? (
                        <span className={`${styles.badge} ${styles.badgeNote}`} style={{ flexShrink: 0 }}>
                            note
                        </span>
                    ) : isLive ? (
                        <span className={`${styles.badge} ${styles.badgeWb}`} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "6px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                            <span style={{ display: "inline-block", width: "6px", height: "6px", background: "#10b981", borderRadius: "50%", animation: "pulse 2s infinite" }} />
                            Live Meeting
                            <style>{`
                                @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
                            `}</style>
                        </span>
                    ) : (
                        <span className={`${styles.badge} ${styles.badgeWb}`} style={{ flexShrink: 0 }}>
                            whiteboard
                        </span>
                    )}
                    <h3 className={styles.noteTitle} style={{ lineHeight: "1.2", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</h3>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <span className={`${styles.noteFav} ${isFavorite ? styles.isFav : ""}`} onClick={(e) => { e.stopPropagation(); onToggleFavorite(e); }}>
                        <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
                    </span>
                    {onDelete && (
                        <span className={styles.noteFav} style={{ color: "var(--error)" }} onClick={(e) => { e.stopPropagation(); onDelete(e); }}>
                            <Trash2 size={18} />
                        </span>
                    )}
                </div>
            </div>
            
            {preview && <div className={styles.notePreview} style={{ marginTop: "12px" }}>{preview}</div>}
            
            <div className={styles.noteFooter} style={{ marginTop: "auto", paddingTop: "16px" }}>
                <div className={styles.noteTags}>
                    {tags.map((t: any) => <span key={t.id} className={styles.noteTag}>#{t.name}</span>)}
                </div>
                <span className={styles.noteDate} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={12} /> {new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
            </div>
        </div>
    );
}

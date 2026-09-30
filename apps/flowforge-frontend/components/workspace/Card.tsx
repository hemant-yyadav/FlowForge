"use client";
import styles from "./components.module.css";
import { Star, Clock } from "lucide-react";

export function ContentCard({ 
    type, 
    id, 
    title, 
    preview, 
    tags = [], 
    date, 
    isFavorite, 
    onToggleFavorite, 
    onClick 
}: { 
    type: "note" | "whiteboard", 
    id: string, 
    title: string, 
    preview?: string, 
    tags?: any[], 
    date: string, 
    isFavorite: boolean, 
    onToggleFavorite: (e: React.MouseEvent) => void, 
    onClick: () => void 
}) {
    return (
        <div className={styles.noteCard} onClick={onClick}>
            <div className={styles.noteTitleRow}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", minWidth: 0, overflow: "hidden" }}>
                    <span className={`${styles.badge} ${type === "note" ? styles.badgeNote : styles.badgeWb}`} style={{ flexShrink: 0 }}>
                        {type}
                    </span>
                    <h3 className={styles.noteTitle} style={{ lineHeight: "1.2", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</h3>
                </div>
                <span className={`${styles.noteFav} ${isFavorite ? styles.isFav : ""}`} style={{ flexShrink: 0, marginLeft: "12px" }} onClick={(e) => { e.stopPropagation(); onToggleFavorite(e); }}>
                    <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
                </span>
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

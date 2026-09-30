"use client";
import { useRouter } from "next/navigation";
import styles from "./components.module.css";

export function NoteCard({ note, workspaceId, isFavorite, onToggleFavorite }: { note: any, workspaceId: string, isFavorite: boolean, onToggleFavorite?: (e: React.MouseEvent) => void }) {
    const router = useRouter();
    const contentText = typeof note.content === "object" ? note.content?.text : note.content;
    const preview = contentText ? contentText.substring(0, 100) : "No content";

    return (
        <div className={styles.noteCard} onClick={() => router.push(`/workspace/${workspaceId}/notes/${note.id}`)}>
            <div className={styles.noteTitleRow}>
                <h3 className={styles.noteTitle}>{note.title}</h3>
                {onToggleFavorite && (
                    <span className={`${styles.noteFav} ${isFavorite ? styles.isFav : ""}`} onClick={(e) => { e.stopPropagation(); onToggleFavorite(e); }}>
                        {isFavorite ? "⭐" : "☆"}
                    </span>
                )}
            </div>
            <div className={styles.notePreview}>{preview}</div>
            <div className={styles.noteFooter}>
                <div className={styles.noteTags}>
                    {note.tags?.map((t: any) => <span key={t.id} className={styles.noteTag}>#{t.name}</span>)}
                </div>
                <span className={styles.noteDate}>{new Date(note.updatedAt).toLocaleDateString(undefined, {month: "short", day: "numeric"})}</span>
            </div>
        </div>
    );
}

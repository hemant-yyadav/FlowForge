"use client";
import { useState } from "react";
import { FileText, Edit3 } from "lucide-react";
import styles from "./components.module.css";
import { useCreateNote, useCreateWorkspaceRoom } from "../../hooks/useNotes";

export function CreateContentModal({ workspaceId, token, open, onClose, onNoteCreated }: { workspaceId: string, token: string, open: boolean, onClose: () => void, onNoteCreated: (noteId: string, title: string, type?: "note"|"whiteboard") => void }) {
    const [title, setTitle] = useState("");
    const [type, setType] = useState<"note"|"whiteboard">("note");
    const createNote = useCreateNote(workspaceId, token);
    const createRoom = useCreateWorkspaceRoom(workspaceId, token);

    if (!open) return null;

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;

        if (type === "note") {
            const res = await createNote.mutateAsync({ title: title.trim(), content: { text: "" } });
            onNoteCreated(res.note.id, res.note.title, "note");
            setTitle("");
            onClose();
        } else {
            const res = await createRoom.mutateAsync(title.trim());
            if (res.slug) {
                onNoteCreated(res.slug, res.slug, "whiteboard");
                setTitle("");
                onClose();
            }
        }
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Add Content</h2>
                    <button className={styles.modalClose} onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <div onClick={() => setType("note")} style={{ flex: 1, padding: "16px", border: `2px solid ${type === "note" ? "var(--accent)" : "var(--border)"}`, borderRadius: "8px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", background: type === "note" ? "rgba(82,136,193,0.1)" : "transparent" }}>
                            <FileText size={24} color={type === "note" ? "var(--accent)" : "var(--text-muted)"} />
                            <span style={{ fontWeight: 500 }}>Note</span>
                        </div>
                        <div onClick={() => setType("whiteboard")} style={{ flex: 1, padding: "16px", border: `2px solid ${type === "whiteboard" ? "var(--accent)" : "var(--border)"}`, borderRadius: "8px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", background: type === "whiteboard" ? "rgba(82,136,193,0.1)" : "transparent" }}>
                            <Edit3 size={24} color={type === "whiteboard" ? "var(--accent)" : "var(--text-muted)"} />
                            <span style={{ fontWeight: 500 }}>Whiteboard</span>
                        </div>
                    </div>
                    <input className="input-field" placeholder={type === "note" ? "Document Title" : "Whiteboard Name (Slug)"} value={title} onChange={e => setTitle(e.target.value)} autoFocus required />
                    <button type="submit" className="btn-primary" disabled={createNote.isPending || createRoom.isPending || !title.trim()}>
                        {createNote.isPending || createRoom.isPending ? "Creating..." : `Create ${type === "note" ? "Note" : "Whiteboard"}`}
                    </button>
                </form>
            </div>
        </div>
    );
}

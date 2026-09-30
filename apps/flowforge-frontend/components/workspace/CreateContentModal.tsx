"use client";
import { useState, useEffect } from "react";
import styles from "./components.module.css";
import { useCreateNote, useCreateWorkspaceRoom } from "../../hooks/useNotes";

export function CreateContentModal({ workspaceId, token, open, defaultType = "note", onClose, onNoteCreated }: { workspaceId: string, token: string, open: boolean, defaultType?: "note"|"whiteboard", onClose: () => void, onNoteCreated: (noteId: string, title: string, type?: "note"|"whiteboard") => void }) {
    const [title, setTitle] = useState("");
    const type = defaultType;
    
    const createNote = useCreateNote(workspaceId, token);
    const createRoom = useCreateWorkspaceRoom(workspaceId, token);

    // Reset title when opening
    useEffect(() => { 
        if (open) setTitle(""); 
    }, [open]);

    if (!open) return null;

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;

        if (type === "note") {
            const res = await createNote.mutateAsync({ title: title.trim(), content: { text: "" } });
            onNoteCreated(res.note.id, res.note.title, "note");
            onClose();
        } else {
            const res = await createRoom.mutateAsync(title.trim());
            if (res.slug) {
                onNoteCreated(res.slug, res.slug, "whiteboard");
                onClose();
            }
        }
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Create {type === "note" ? "Note" : "Room"}</h2>
                    <button className={styles.modalClose} onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ marginBottom: "8px" }}>
                        <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                            {type === "note" ? "Note Title" : "Room Name"}
                        </label>
                        <input 
                            className="input-field" 
                            placeholder={type === "note" ? "e.g. Q3 Planning Notes" : "e.g. daily-standup-123"} 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            autoFocus 
                            required 
                        />
                    </div>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={createNote.isPending || createRoom.isPending || !title.trim()}>
                            {createNote.isPending || createRoom.isPending ? "Creating..." : `Create ${type === "note" ? "Note" : "Room"}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../hooks/useAuth";
import { useNotes, useCreateNote, useDeleteNote } from "../../../../hooks/useNotes";
import { useFavorites, useToggleNoteFavorite } from "../../../../hooks/useFavorites";
import { NoteCard } from "../../../../components/workspace/NoteCard";
import styles from "./notes.module.css";

export default function NotesPage() {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const router = useRouter();
    const { token } = useAuth();
    const { data: notesData, isLoading } = useNotes(workspaceId, token);
    const { data: favData } = useFavorites(token);
    const createNote = useCreateNote(workspaceId, token);
    const toggleFav = useToggleNoteFavorite(token);

    const [search, setSearch] = useState("");
    const [title, setTitle] = useState("");

    const notes = notesData?.notes || [];
    const favorites = favData?.favorites || [];
    const favNoteIds = new Set(favorites.filter((f: any) => f.noteId).map((f: any) => f.noteId));

    const filteredNotes = notes.filter((n: any) => 
        n.title.toLowerCase().includes(search.toLowerCase()) || 
        n.tags?.some((t: any) => t.name.toLowerCase().includes(search.toLowerCase()))
    );

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;
        await createNote.mutateAsync({ title: title.trim(), content: { text: "" } });
        setTitle("");
    }

    if (isLoading) return <div style={{padding: "48px", color: "var(--text-muted)", textAlign: "center"}}>Loading...</div>;

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <h1 style={{ fontSize: "2rem", margin: 0 }}>Notes</h1>
            </div>

            <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
                <input 
                    className="input-field" 
                    placeholder="Search notes by title or #tag..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    style={{ flex: 1 }}
                />
                <form onSubmit={handleCreate} style={{ display: "flex", gap: "8px", width: "400px" }}>
                    <input className="input-field" placeholder="New note title..." value={title} onChange={e => setTitle(e.target.value)} />
                    <button type="submit" className="btn-primary" disabled={createNote.isPending || !title.trim()}>Create</button>
                </form>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                {filteredNotes.map((note: any) => (
                    <NoteCard 
                        key={note.id} 
                        note={note} 
                        workspaceId={workspaceId} 
                        isFavorite={favNoteIds.has(note.id)} 
                        onToggleFavorite={() => toggleFav.mutate(note.id)} 
                    />
                ))}
            </div>
            {filteredNotes.length === 0 && <div style={{ textAlign: "center", padding: "64px", color: "var(--text-muted)" }}>No notes found.</div>}
        </div>
    );
}

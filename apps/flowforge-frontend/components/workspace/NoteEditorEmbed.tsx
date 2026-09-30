"use client";
import { useState, useEffect } from "react";
import { useNote, useNoteRooms, useAttachRoom, useDetachRoom, useWorkspaceRooms } from "../../hooks/useNotes";
import { useAuth } from "../../hooks/useAuth";
import { ContentCard } from "./Card";
import styles from "../../app/workspace/[workspaceId]/notes/[noteId]/note-detail.module.css";

export function NoteEditorEmbed({ noteId, workspaceId }: { noteId: string, workspaceId: string }) {
    const { token } = useAuth();
    const { data: noteData, isLoading } = useNote(noteId, token);
    const { data: roomsData } = useNoteRooms(noteId, token);
    const { data: wsRoomsData } = useWorkspaceRooms(workspaceId, token);

    const attachRoom = useAttachRoom(noteId, token);
    const detachRoom = useDetachRoom(noteId, token);

    const [showAttach, setShowAttach] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

    if (isLoading) return <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>Loading Note...</div>;
    const note = noteData?.note;
    if (!note) return <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>Note not found</div>;

    const rooms = roomsData?.rooms || [];
    const allWorkspaceRooms = wsRoomsData?.rooms || [];
    const attachedRoomIds = new Set(rooms.map((r: any) => r.id));
    const availableRooms = allWorkspaceRooms.filter((r: any) => !attachedRoomIds.has(r.id));
    const contentText = typeof note.content === "object" ? note.content?.text : note.content;

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 0", animation: "fadeIn 0.3s ease" }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "8px", marginTop: 0 }}>{note.title}</h1>
            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "32px" }}>Updated {new Date(note.updatedAt).toLocaleString()}</div>
            
            <div style={{ minHeight: "300px", background: "var(--bg-card)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border)", marginBottom: "32px" }}>
                {contentText ? contentText : <span style={{ color: "var(--text-muted)" }}>Start typing...</span>}
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Referenced Whiteboards</h2>
                    <button className="btn-primary" onClick={() => setShowAttach(!showAttach)}>+ Attach Whiteboard</button>
                </div>

                {showAttach && (
                    <div style={{ background: "var(--bg-card)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border)", marginBottom: "24px", display: "flex", gap: "12px" }}>
                        <select className="input-field" onChange={e => setSelectedRoomId(parseInt(e.target.value))} defaultValue="" style={{ flex: 1 }}>
                            <option value="" disabled>Select a whiteboard from this workspace...</option>
                            {availableRooms.map((r: any) => <option key={r.id} value={r.id}>{r.slug}</option>)}
                        </select>
                        <button className="btn-primary" disabled={!selectedRoomId} onClick={() => { attachRoom.mutate(selectedRoomId!); setShowAttach(false); }}>Attach</button>
                    </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
                    {rooms.map((room: any) => (
                        <div key={room.id} style={{ position: "relative" }}>
                            <ContentCard 
                                type="whiteboard" 
                                id={room.id.toString()} 
                                title={room.slug} 
                                date={room.createdAt} 
                                isFavorite={false} 
                                onToggleFavorite={() => {}} 
                                onClick={() => window.open(`/room/${room.slug}`, "_blank")} 
                            />
                            <button onClick={() => detachRoom.mutate(room.id)} style={{ position: "absolute", top: "-10px", right: "-10px", background: "var(--error)", border: "none", color: "white", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", zIndex: 10 }}>✕</button>
                        </div>
                    ))}
                    {rooms.length === 0 && <p style={{ color: "var(--text-muted)", gridColumn: "1 / -1" }}>No whiteboards attached yet.</p>}
                </div>
            </div>
        </div>
    );
}

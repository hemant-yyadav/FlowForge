"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNote, useNoteRooms, useAttachRoom, useDetachRoom, useWorkspaceRooms, useUpdateNote } from "../../hooks/useNotes";
import { useAuth } from "../../hooks/useAuth";
import { ContentCard } from "./Card";
import { WhiteboardEmbed } from "./WhiteboardEmbed";

// BlockNote imports
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import dynamic from "next/dynamic";
import { useCreateBlockNote, createReactBlockSpec } from "@blocknote/react";
import { BlockNoteSchema, defaultBlockSpecs, PartialBlock } from "@blocknote/core";

const BlockNoteView = dynamic(() => import("@blocknote/mantine").then((mod) => mod.BlockNoteView), { ssr: false });

// Define the custom Whiteboard Block
const WhiteboardBlock = createReactBlockSpec(
  {
    type: "whiteboard",
    propSchema: {
      slug: {
        default: "default-room",
      },
    },
    content: "none",
  },
  {
    render: (props) => {
      return (
        <div style={{ margin: "24px 0", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden", background: "var(--bg-primary)", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", display: "block", width: "100%" }} contentEditable={false}>
            <div style={{ background: "var(--bg-card)", padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                    Whiteboard: {props.block.props.slug}
                </span>
                <button 
                    onClick={() => window.open(`/room/${props.block.props.slug}`, "_blank")}
                    style={{ background: "var(--accent)", border: "none", color: "white", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }}
                >
                    Open Canvas
                </button>
            </div>
            <div style={{ height: "400px", minHeight: "200px", maxHeight: "1000px", resize: "vertical", overflow: "hidden", position: "relative", paddingBottom: "10px" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 10, pointerEvents: "none" }}>
                    <WhiteboardEmbed slug={props.block.props.slug} inline={true} />
                </div>
            </div>
        </div>
      );
    },
  }
);

const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    whiteboard: WhiteboardBlock(),
  },
});

export function NoteEditorEmbed({ noteId, workspaceId }: { noteId: string, workspaceId: string }) {
    const { token } = useAuth();
    const { data: noteData, isLoading } = useNote(noteId, token);
    const { data: roomsData } = useNoteRooms(noteId, token);
    const { data: wsRoomsData } = useWorkspaceRooms(workspaceId, token);

    const attachRoom = useAttachRoom(noteId, token);
    const detachRoom = useDetachRoom(noteId, token);

    const [showAttach, setShowAttach] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

    const [localTitle, setLocalTitle] = useState("");
    const updateNote = useUpdateNote(noteId, token);

    // Creates a new editor instance.
    const editor = useCreateBlockNote({ schema });
    const [editorReady, setEditorReady] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);

    // Initialize state when note loads
    useEffect(() => {
        if (noteData?.note && !initialLoadDone) {
            setLocalTitle(noteData.note.title);
            
            // Handle loading content
            const content = noteData.note.content;
            if (content) {
                if (Array.isArray(content) && content.length > 0) {
                    // It's already BlockNote JSON
                    editor.replaceBlocks(editor.document, content as PartialBlock[]);
                } else if (typeof content === "object" && content.text) {
                    // It's legacy markdown text, convert to blocks
                    const blocks = editor.tryParseMarkdownToBlocks(content.text);
                    editor.replaceBlocks(editor.document, blocks);
                }
            }
            setInitialLoadDone(true);
            setEditorReady(true);
        }
    }, [noteData, editor, initialLoadDone]);

    // useRef for debounce timeout
    const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Handle saving
    const saveContent = useCallback(() => {
        if (!initialLoadDone) return;
        const blocks = editor.document;
        updateNote.mutate({ title: localTitle, content: blocks });
    }, [editor, localTitle, updateNote, initialLoadDone]);

    // Debounce saves for title
    useEffect(() => {
        if (!initialLoadDone) return;
        if (localTitle === noteData?.note?.title) return;
        
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            saveContent();
        }, 1000);
    }, [localTitle, saveContent, initialLoadDone, noteData]);

    if (isLoading) return <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>Loading Note...</div>;
    const note = noteData?.note;
    if (!note) return <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>Note not found</div>;

    const rooms = roomsData?.rooms || [];
    const allWorkspaceRooms = wsRoomsData?.rooms || [];
    const attachedRoomIds = new Set(rooms.map((r: any) => r.id));
    const availableRooms = allWorkspaceRooms.filter((r: any) => !attachedRoomIds.has(r.id));

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 0", animation: "fadeIn 0.3s ease", display: "flex", flexDirection: "column", minHeight: "100%" }}>
            <input 
                value={localTitle} 
                onChange={e => setLocalTitle(e.target.value)}
                placeholder="Note Title"
                style={{ fontSize: "2.5rem", marginBottom: "8px", marginTop: 0, width: "100%", background: "transparent", border: "none", color: "var(--text-primary)", fontWeight: "bold", outline: "none", paddingLeft: "54px" }}
            />
            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "32px", paddingLeft: "54px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Updated {new Date(note.updatedAt).toLocaleString()} {updateNote.isPending && <span style={{ marginLeft: "8px", color: "var(--accent)" }}>Saving...</span>}</span>
                
                <div style={{ display: "flex", gap: "8px" }}>
                    <select 
                        style={{ padding: "6px 12px", fontSize: "0.85rem", background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: "6px", outline: "none", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                        onChange={(e) => {
                            if (e.target.value) {
                                // Insert the custom whiteboard block at the current cursor position
                                editor.insertBlocks([
                                    {
                                        type: "whiteboard",
                                        props: { slug: e.target.value }
                                    }
                                ], editor.getTextCursorPosition().block, "after");
                                e.target.value = ""; // reset
                            }
                        }}
                        defaultValue=""
                    >
                        <option value="" disabled>+ Embed Whiteboard</option>
                        {allWorkspaceRooms.map((r: any) => <option key={r.id} value={r.slug}>{r.slug}</option>)}
                    </select>
                </div>
            </div>
            
            <div style={{ minHeight: "400px", marginBottom: "32px", background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border)", padding: "24px 0", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                {editorReady && (
                    <BlockNoteView 
                        editor={editor as any} 
                        theme="dark" // Changed to dark theme
                        onChange={() => {
                            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                            saveTimeoutRef.current = setTimeout(() => {
                                saveContent();
                            }, 1000);
                        }}
                    />
                )}
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Attached Whiteboards (External)</h2>
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
                    {rooms.length === 0 && <p style={{ color: "var(--text-muted)", gridColumn: "1 / -1" }}>No external whiteboards explicitly attached. Use the "+ Embed Whiteboard" button above to insert them directly into the document!</p>}
                </div>
            </div>
        </div>
    );
}

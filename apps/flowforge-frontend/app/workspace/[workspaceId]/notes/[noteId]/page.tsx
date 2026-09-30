"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function NoteDeepLinkPage() {
    const { workspaceId, noteId } = useParams<{ workspaceId: string; noteId: string }>();
    const router = useRouter();

    useEffect(() => {
        if (workspaceId && noteId) {
            router.replace(`/workspace/${workspaceId}?open=note_${noteId}`);
        }
    }, [workspaceId, noteId, router]);

    return (
        <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", color: "var(--text-muted)" }}>
            Loading Note...
        </div>
    );
}

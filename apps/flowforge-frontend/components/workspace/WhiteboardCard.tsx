"use client";
import { useRouter, useParams } from "next/navigation";
import styles from "./components.module.css";
import { Trash2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useDeleteRoom } from "../../hooks/useWorkspaces";
import toast from "react-hot-toast";

export function WhiteboardCard({ room }: { room: any }) {
    const router = useRouter();
    const params = useParams<{ workspaceId: string }>();
    const { token } = useAuth();
    const deleteRoomMutation = useDeleteRoom(params.workspaceId, token);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete whiteboard "${room.slug}"? This cannot be undone.`)) {
            const toastId = toast.loading("Deleting whiteboard...");
            deleteRoomMutation.mutate(room.id, {
                onSuccess: () => {
                    toast.success("Whiteboard deleted successfully", { id: toastId });
                },
                onError: (err) => {
                    toast.error(err.message || "Failed to delete whiteboard", { id: toastId });
                }
            });
        }
    };

    return (
        <div className={styles.wbCard} onClick={() => window.open(`/room/${room.slug}`, "_blank")} style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontSize: "0.65rem", padding: "2px 6px", borderRadius: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ display: "inline-block", width: "6px", height: "6px", background: "#10b981", borderRadius: "50%", animation: "pulse 2s infinite" }} /> Live Meeting
            </div>
            <div className={styles.wbIcon}>🎨</div>
            <div className={styles.wbInfo} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h3 className={styles.wbTitle}>{room.slug}</h3>
                    <span className={styles.wbDate}>Updated {new Date(room.createdAt).toLocaleDateString(undefined, {month: "short", day: "numeric"})}</span>
                </div>
                <button 
                    onClick={handleDelete}
                    style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.2s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                    title="Delete Whiteboard"
                >
                    <Trash2 size={16} />
                </button>
                <style>{`
                    @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
                `}</style>
            </div>
        </div>
    );
}

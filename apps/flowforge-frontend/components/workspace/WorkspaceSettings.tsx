"use client";
import { useState } from "react";
import { useWorkspace, useAddWorkspaceMember, useRemoveWorkspaceMember, useDeleteWorkspace } from "../../hooks/useWorkspaces";
import { useAuth } from "../../hooks/useAuth";
import { UserPlus, UserMinus, Trash2, Users } from "lucide-react";
import { ConfirmationModal } from "./ConfirmationModal";
import { useRouter } from "next/navigation";

export function WorkspaceSettings({ workspaceId }: { workspaceId: string }) {
    const { token } = useAuth();
    const router = useRouter();
    const { data, isLoading } = useWorkspace(workspaceId, token);
    const addMember = useAddWorkspaceMember(workspaceId, token);
    const removeMember = useRemoveWorkspaceMember(workspaceId, token);
    const deleteWorkspace = useDeleteWorkspace(token);

    const [inviteUsername, setInviteUsername] = useState("");
    const [inviteError, setInviteError] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    if (isLoading) return <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>Loading settings...</div>;

    const workspace = data?.workspace;
    if (!workspace) return <div style={{ padding: "32px", textAlign: "center", color: "var(--error)" }}>Workspace not found</div>;

    const isOwner = workspace.ownerId === (token ? JSON.parse(atob(token.split('.')[1] as string)).userId : "");

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteUsername.trim()) return;
        setInviteError("");

        try {
            await addMember.mutateAsync(inviteUsername.trim());
            setInviteUsername("");
        } catch (e: any) {
            setInviteError(e.message || "Failed to invite user. Make sure they exist.");
        }
    };

    const handleRemoveMember = async (userId: string) => {
        try {
            await removeMember.mutateAsync(userId);
        } catch (e: any) {
            alert(e.message || "Failed to remove member");
        }
    };

    const handleDeleteWorkspace = async () => {
        try {
            await deleteWorkspace.mutateAsync(workspaceId);
            setDeleteModalOpen(false);
            router.replace("/workspaces"); // redirect to workspaces list
        } catch (e: any) {
            alert(e.message || "Failed to delete workspace");
            setDeleteModalOpen(false);
        }
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px" }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "32px", color: "var(--text-primary)" }}>Workspace Settings</h1>

            <section style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "12px", padding: "24px", marginBottom: "32px", border: "1px solid var(--border)" }}>
                <h2 style={{ fontSize: "1.25rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)" }}>
                    <Users size={20} /> Members
                </h2>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--bg-primary)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                                {workspace.owner.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight: 500 }}>{workspace.owner.name}</div>
                                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>@{workspace.owner.username} • Owner</div>
                            </div>
                        </div>
                    </div>

                    {workspace.members && workspace.members.map((member: any) => (
                        <div key={member.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--bg-primary)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-secondary)", color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: "1px solid var(--border)" }}>
                                    {member.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 500 }}>{member.user.name}</div>
                                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>@{member.user.username} • {member.role}</div>
                                </div>
                            </div>
                            {isOwner && (
                                <button onClick={() => handleRemoveMember(member.user.id)} style={{ background: "transparent", border: "none", color: "var(--error)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }} disabled={removeMember.isPending}>
                                    <UserMinus size={16} /> Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {isOwner && (
                    <form onSubmit={handleInvite} style={{ display: "flex", gap: "12px" }}>
                        <div style={{ flex: 1 }}>
                            <input 
                                className="input-field" 
                                placeholder="Invite by username or email..." 
                                value={inviteUsername} 
                                onChange={e => setInviteUsername(e.target.value)} 
                                disabled={addMember.isPending}
                            />
                            {inviteError && <div style={{ color: "var(--error)", fontSize: "0.85rem", marginTop: "4px" }}>{inviteError}</div>}
                        </div>
                        <button type="submit" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px", height: "46px" }} disabled={addMember.isPending || !inviteUsername.trim()}>
                            <UserPlus size={18} /> {addMember.isPending ? "Inviting..." : "Invite"}
                        </button>
                    </form>
                )}
            </section>

            {isOwner && (
                <section style={{ backgroundColor: "rgba(239, 68, 68, 0.05)", borderRadius: "12px", padding: "24px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                    <h2 style={{ fontSize: "1.25rem", marginBottom: "8px", color: "var(--error)" }}>Danger Zone</h2>
                    <p style={{ color: "var(--text-muted)", marginBottom: "16px", fontSize: "0.9rem" }}>
                        Once you delete a workspace, there is no going back. Please be certain.
                    </p>
                    <button 
                        onClick={() => setDeleteModalOpen(true)}
                        style={{ background: "var(--error)", color: "white", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px" }}
                    >
                        <Trash2 size={18} /> Delete Workspace
                    </button>
                </section>
            )}

            <ConfirmationModal
                open={deleteModalOpen}
                title="Delete Workspace"
                message={`Are you absolutely sure you want to delete "${workspace.name}"? This action cannot be undone and will delete all notes and whiteboards inside it.`}
                onConfirm={handleDeleteWorkspace}
                onCancel={() => setDeleteModalOpen(false)}
                confirmText="Delete Workspace"
                isLoading={deleteWorkspace.isPending}
            />
        </div>
    );
}

"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { useWorkspaces } from "../../hooks/useWorkspaces";
import { User, Users } from "lucide-react";

function decodeJWT(token: string | null) {
    if (!token) return null;
    try {
        return JSON.parse(atob(token.split('.')[1] || ""));
    } catch {
        return null;
    }
}

function WorkspacesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { token, loading } = useAuth();

    useEffect(() => {
        const urlToken = searchParams.get("token");
        if (urlToken) {
            localStorage.setItem("token", urlToken);
            window.history.replaceState({}, document.title, "/workspaces");
            window.location.reload(); // Reload to let useAuth pick it up
        }
    }, [searchParams]);

    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, isLoading } = useWorkspaces(token);
    const currentUser = decodeJWT(token);

    if (loading || isLoading) return <div style={{padding: "48px", color: "var(--text-muted)", textAlign: "center"}}>Loading workspaces...</div>;

    const workspaces = data?.workspaces || [];

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const res = await fetch("http://localhost:3001/api/v1/workspaces", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() })
            });
            if (res.ok) {
                const data = await res.json();
                router.push(`/workspace/${data.workspace.id}`);
            } else {
                alert("Failed to create workspace");
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error(err);
            alert("Error creating workspace");
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "64px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Select a Workspace</h1>
                    <p style={{ color: "var(--text-muted)", margin: 0 }}>Choose a workspace to continue</p>
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                    <button 
                        className="btn-secondary" 
                        onClick={() => {
                            localStorage.removeItem("token");
                            window.location.href = "/signin";
                        }}
                        style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer" }}
                    >
                        Logout
                    </button>
                    <button className="btn-primary" onClick={() => setIsCreating(true)}>+ New Workspace</button>
                </div>
            </div>

            {isCreating && (
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--accent)", borderRadius: "12px", padding: "24px", marginBottom: "32px" }}>
                    <h3 style={{ margin: "0 0 16px 0" }}>Create New Workspace</h3>
                    <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <input className="input-field" placeholder="Workspace Name (e.g. Personal)" value={newName} onChange={e => setNewName(e.target.value)} autoFocus required />
                        <input className="input-field" placeholder="Description (Optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                            <button type="button" onClick={() => setIsCreating(false)} style={{ background: "transparent", color: "var(--text-muted)", border: "none", cursor: "pointer" }} disabled={isSubmitting}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={!newName.trim() || isSubmitting}>{isSubmitting ? "Creating..." : "Create"}</button>
                        </div>
                    </form>
                </div>
            )}
            
            <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
                {workspaces.map((ws: any) => {
                    const isOwner = currentUser?.userId === ws.ownerId;
                    return (
                        <div 
                            key={ws.id} 
                            onClick={() => router.push(`/workspace/${ws.id}`)}
                            style={{ position: "relative", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px", cursor: "pointer", transition: "all 0.2s" }}
                            onMouseOver={e => e.currentTarget.style.borderColor = "var(--accent)"}
                            onMouseOut={e => e.currentTarget.style.borderColor = "var(--border)"}
                        >
                            <div style={{ position: "absolute", top: 16, right: 16, display: "flex", alignItems: "center", gap: "6px", background: isOwner ? "rgba(99, 102, 241, 0.1)" : "rgba(16, 185, 129, 0.1)", color: isOwner ? "var(--accent)" : "#10b981", padding: "4px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600 }}>
                                {isOwner ? <User size={12} /> : <Users size={12} />}
                                {isOwner ? "Personal" : "Shared"}
                            </div>
                            <h2 style={{ fontSize: "1.2rem", margin: "0 0 8px 0", paddingRight: "70px" }}>{ws.name}</h2>
                            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: 0 }}>{ws.description || "No description"}</p>
                        </div>
                    );
                })}
            </div>
            {workspaces.length === 0 && !isCreating && (
                <div style={{ textAlign: "center", padding: "64px", border: "1px dashed var(--border)", borderRadius: "12px", color: "var(--text-muted)" }}>
                    <p style={{ marginBottom: "16px" }}>You don't have any workspaces yet.</p>
                    <button className="btn-primary" onClick={() => setIsCreating(true)}>Create Your First Workspace</button>
                </div>
            )}
        </div>
    );
}

export default function WorkspacesPage() {
    return (
        <Suspense fallback={<div style={{padding: "48px", color: "var(--text-muted)", textAlign: "center"}}>Loading...</div>}>
            <WorkspacesContent />
        </Suspense>
    );
}

"use client";
import { useState } from "react";
import { X } from "lucide-react";

export function JoinRoomModal({ 
    open, 
    onClose, 
    onJoin 
}: { 
    open: boolean, 
    onClose: () => void, 
    onJoin: (slug: string) => void 
}) {
    const [slug, setSlug] = useState("");

    if (!open) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!slug.trim()) return;
        onJoin(slug.trim());
        setSlug("");
        onClose();
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
            animation: "fadeIn 0.2s ease"
        }}>
            <div style={{
                background: "var(--bg-card)", width: "100%", maxWidth: "450px",
                borderRadius: "16px", border: "1px solid var(--border)",
                boxShadow: "0 12px 48px rgba(0,0,0,0.4)", overflow: "hidden",
                animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
                    <h2 style={{ margin: 0, fontSize: "1.25rem", color: "var(--text-primary)" }}>Join Meeting Room</h2>
                    <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex" }}>
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Room Code (Slug)</label>
                        <input 
                            className="input-field" 
                            placeholder="e.g. daily-standup-123" 
                            value={slug} 
                            onChange={e => setSlug(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>

                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "32px" }}>
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={!slug.trim()}>Join Meeting</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

"use client";
import { useEffect } from "react";
import styles from "./components.module.css";
import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
}

export function ConfirmationModal({ 
    open, 
    title, 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = "Confirm", 
    cancelText = "Cancel", 
    isDestructive = true,
    isLoading = false
}: ConfirmationModalProps) {
    
    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open && !isLoading) {
                onCancel();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, isLoading, onCancel]);

    if (!open) return null;

    return (
        <div className={styles.modalOverlay} onClick={() => !isLoading && onCancel()}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: "400px", textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px", color: isDestructive ? "var(--error)" : "var(--accent)" }}>
                    <AlertTriangle size={48} />
                </div>
                <h2 className={styles.modalTitle} style={{ marginBottom: "12px", fontSize: "1.5rem" }}>{title}</h2>
                <p style={{ color: "var(--text-muted)", marginBottom: "24px", lineHeight: "1.5" }}>{message}</p>
                
                <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                    <button 
                        className="btn-primary" 
                        style={{ flex: 1, background: "transparent", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button 
                        className="btn-primary" 
                        style={{ flex: 1, background: isDestructive ? "var(--error)" : "var(--accent)", color: "#fff", border: "none" }}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

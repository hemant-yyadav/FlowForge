"use client";
import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
    useEffect(() => {
        // Clear tokens from the web app's localStorage
        localStorage.removeItem("token");
        
        // Also sign out of NextAuth and redirect to signin
        signOut({ callbackUrl: "/signin" });
    }, []);

    return (
        <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "32px", height: "32px", border: "4px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                <p style={{ color: "#a1a1aa", fontWeight: 500, margin: 0 }}>Signing you out...</p>
                <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        </div>
    );
}

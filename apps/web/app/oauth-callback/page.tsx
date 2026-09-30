"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OAuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        // Fetch the NextAuth session to grab the custom JWT
        fetch("/api/auth/session")
            .then(res => res.json())
            .then(session => {
                if (session?.customJwt) {
                    // Store the custom JWT in localStorage for FlowForge
                    localStorage.setItem("token", session.customJwt);
                    router.push("/dashboard");
                } else {
                    console.error("No custom JWT found in session");
                    router.push("/signin");
                }
            })
            .catch(err => {
                console.error("Failed to fetch session:", err);
                router.push("/signin");
            });
    }, [router]);

    return (
        <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#111", color: "#fff" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                <div style={{ width: 40, height: 40, border: "4px solid #333", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <h2>Authenticating...</h2>
                <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        </div>
    );
}

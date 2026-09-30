"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "../_components/AuthCard";
import { apiRequest } from "../../lib/api";
import styles from "./signin.module.css";

import { signIn } from "next-auth/react";

export default function SigninPage() {
    const router = useRouter();
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        const { data, error: err } = await apiRequest<{ token: string }>("/signin", {
            method: "POST",
            body: form,
        });
        setLoading(false);
        if (err || !data) {
            setError(err ?? "Something went wrong");
            return;
        }
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
    }

    return (
        <AuthCard
            title="Welcome back"
            subtitle="Sign in to continue to FlowForge"
            footerText="Don't have an account?"
            footerLinkText="Sign up"
            footerLinkHref="/signup"
        >
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                <button
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: "/oauth-callback" })}
                    style={{
                        background: "#fff",
                        color: "#000",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px"
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/><path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"/><path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.545 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
                    Continue with Google
                </button>
                <button
                    type="button"
                    onClick={() => signIn("github", { callbackUrl: "/oauth-callback" })}
                    style={{
                        background: "#333",
                        color: "#fff",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #444",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px"
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    Continue with GitHub
                </button>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
                <span style={{ color: "#888", fontSize: "12px", fontWeight: "600" }}>OR</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <label htmlFor="username" className={styles.label}>Username</label>
                    <input
                        id="username"
                        type="text"
                        className="input-field"
                        placeholder="johndoe"
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        required
                    />
                </div>
                <div className={styles.field}>
                    <label htmlFor="password" className={styles.label}>Password</label>
                    <input
                        id="password"
                        type="password"
                        className="input-field"
                        placeholder="Your password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                    />
                </div>
                {error && <p className="error-msg">{error}</p>}
                <button
                    id="signin-btn"
                    type="submit"
                    className="btn-primary"
                    style={{ width: "100%" }}
                    disabled={loading}
                >
                    {loading ? "Signing in..." : "Sign in"}
                </button>
            </form>
        </AuthCard>
    );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "../_components/AuthCard";
import { apiRequest } from "../../lib/api";
import styles from "./signin.module.css";

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

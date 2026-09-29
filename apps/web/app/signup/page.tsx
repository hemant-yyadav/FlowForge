"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "../_components/AuthCard";
import { apiRequest } from "../../lib/api";
import styles from "./signup.module.css";

export default function SignupPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        const { error: err } = await apiRequest("/signup", { method: "POST", body: form });
        setLoading(false);
        if (err) {
            setError(err);
            return;
        }
        router.push("/signin");
    }

    return (
        <AuthCard
            title="Create an account"
            subtitle="Join FlowForge and collaborate in real time"
            footerText="Already have an account?"
            footerLinkText="Sign in"
            footerLinkHref="/signin"
        >
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <label htmlFor="name" className={styles.label}>Full Name</label>
                    <input
                        id="name"
                        type="text"
                        className="input-field"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                </div>
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
                        placeholder="Min 6 characters"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                    />
                </div>
                {error && <p className="error-msg">{error}</p>}
                <button
                    id="signup-btn"
                    type="submit"
                    className="btn-primary"
                    style={{ width: "100%" }}
                    disabled={loading}
                >
                    {loading ? "Creating account..." : "Create account"}
                </button>
            </form>
        </AuthCard>
    );
}

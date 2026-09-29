"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../_components/Navbar";
import { useAuth } from "../../hooks/useAuth";
import { apiRequest } from "../../lib/api";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
    const router = useRouter();
    const { token, loading, signout } = useAuth();
    const [roomName, setRoomName] = useState("");
    const [joinSlug, setJoinSlug] = useState("");
    const [error, setError] = useState("");
    const [creating, setCreating] = useState(false);

    async function handleCreateRoom(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setCreating(true);
        const { error: err } = await apiRequest("/room", {
            method: "POST",
            body: { name: roomName, password: "default" },
            token: token ?? "",
        });
        setCreating(false);
        if (err) {
            setError(err);
            return;
        }
        router.push(`/room/${roomName}`);
    }

    function handleJoinRoom(e: React.FormEvent) {
        e.preventDefault();
        if (!joinSlug.trim()) return;
        router.push(`/room/${joinSlug.trim()}`);
    }

    if (loading || !token) return null;

    return (
        <div className={styles.page}>
            <div className={styles.glow} />
            <Navbar onSignout={signout} />
            <main className={styles.main}>
                <h1 className={styles.heading}>Your Workspace</h1>
                <p className={styles.sub}>Create a new room or join an existing one</p>

                <div className={styles.grid}>
                    <div className={styles.card}>
                        <div className={styles.cardIcon}>✦</div>
                        <h2 className={styles.cardTitle}>Create a Room</h2>
                        <p className={styles.cardDesc}>Start a new collaborative session</p>
                        <form onSubmit={handleCreateRoom} className={styles.form}>
                            <input
                                id="room-name-input"
                                type="text"
                                className="input-field"
                                placeholder="e.g. design-sprint"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                required
                            />
                            <button
                                id="create-room-btn"
                                type="submit"
                                className="btn-primary"
                                style={{ width: "100%" }}
                                disabled={creating}
                            >
                                {creating ? "Creating..." : "Create Room"}
                            </button>
                        </form>
                    </div>

                    <div className={styles.divider}><span>or</span></div>

                    <div className={styles.card}>
                        <div className={styles.cardIcon}>→</div>
                        <h2 className={styles.cardTitle}>Join a Room</h2>
                        <p className={styles.cardDesc}>Enter the room name to join</p>
                        <form onSubmit={handleJoinRoom} className={styles.form}>
                            <input
                                id="join-slug-input"
                                type="text"
                                className="input-field"
                                placeholder="e.g. design-sprint"
                                value={joinSlug}
                                onChange={(e) => setJoinSlug(e.target.value)}
                                required
                            />
                            <button
                                id="join-room-btn"
                                type="submit"
                                className={styles.joinBtn}
                            >
                                Join Room
                            </button>
                        </form>
                    </div>
                </div>

                {error && <p className="error-msg" style={{ textAlign: "center", marginTop: "20px" }}>{error}</p>}
            </main>
        </div>
    );
}

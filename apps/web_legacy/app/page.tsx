import Link from "next/link";
import { Navbar } from "./_components/Navbar";
import styles from "./page.module.css";

export default function Home() {
    return (
        <div className={styles.hero}>
            <div className={styles.glow1} />
            <div className={styles.glow2} />
            <Navbar />

            <main className={styles.main}>
                <div className={styles.badge}>Real-time Collaboration</div>
                <h1 className={styles.heading}>
                    Build Together,<br />
                    <span className={styles.gradient}>In Real Time</span>
                </h1>
                <p className={styles.subtext}>
                    FlowForge is a collaborative workspace where teams connect, communicate,
                    and create — powered by WebSockets for instant, live interaction.
                </p>
                <div className={styles.ctas}>
                    <Link href="/signup" className="btn-primary">
                        Start for free →
                    </Link>
                    <Link href="/signin" className={styles.secondaryBtn}>
                        Sign in
                    </Link>
                </div>

                <div className={styles.features}>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>⚡</div>
                        <h3>Instant Sync</h3>
                        <p>Messages delivered in milliseconds via persistent WebSocket connections.</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🔒</div>
                        <h3>Secure Rooms</h3>
                        <p>JWT-authenticated channels keep your conversations private and safe.</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🌐</div>
                        <h3>Persistent History</h3>
                        <p>All messages stored in the cloud — never lose important conversations.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

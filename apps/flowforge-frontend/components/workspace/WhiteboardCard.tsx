"use client";
import { useRouter } from "next/navigation";
import styles from "./components.module.css";

export function WhiteboardCard({ room }: { room: any }) {
    const router = useRouter();
    return (
        <div className={styles.wbCard} onClick={() => window.open(`/room/${room.slug}`, "_blank")}>
            <div className={styles.wbIcon}>🎨</div>
            <div className={styles.wbInfo}>
                <h3 className={styles.wbTitle}>{room.slug}</h3>
                <span className={styles.wbDate}>Updated {new Date(room.createdAt).toLocaleDateString(undefined, {month: "short", day: "numeric"})}</span>
            </div>
        </div>
    );
}

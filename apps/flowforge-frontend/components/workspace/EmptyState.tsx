"use client";
import styles from "./components.module.css";
export function EmptyState({ icon, title, subtitle, action }: { icon: React.ReactNode, title: string, subtitle: string, action?: React.ReactNode }) {
    return (
        <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>{icon}</div>
            <h3 className={styles.emptyTitle}>{title}</h3>
            <p className={styles.emptySub}>{subtitle}</p>
            {action && <div style={{ marginTop: "24px" }}>{action}</div>}
        </div>
    );
}

import Link from "next/link";
import styles from "./AuthCard.module.css";

interface AuthCardProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    footerText: string;
    footerLinkText: string;
    footerLinkHref: string;
}

export function AuthCard({
    title,
    subtitle,
    children,
    footerText,
    footerLinkText,
    footerLinkHref,
}: AuthCardProps) {
    return (
        <div className={styles.page}>
            <div className={styles.glow} />
            <div className={styles.card}>
                <Link href="/" className={styles.back}>← Back</Link>
                <div className={styles.brandMark}>FF</div>
                <h1 className={styles.title}>{title}</h1>
                <p className={styles.subtitle}>{subtitle}</p>
                {children}
                <p className={styles.footer}>
                    {footerText}{" "}
                    <Link href={footerLinkHref} className={styles.link}>
                        {footerLinkText}
                    </Link>
                </p>
            </div>
        </div>
    );
}

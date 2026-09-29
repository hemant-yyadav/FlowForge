import Link from "next/link";
import styles from "./Navbar.module.css";

interface NavbarProps {
    onSignout?: () => void;
}

export function Navbar({ onSignout }: NavbarProps) {
    return (
        <nav className={styles.nav}>
            <Link href="/" className={styles.logo}>
                FlowForge
            </Link>
            {onSignout && (
                <button id="signout-btn" className={styles.signout} onClick={onSignout}>
                    Sign out
                </button>
            )}
            {!onSignout && (
                <div className={styles.links}>
                    <Link href="/signin" className={styles.link}>Sign in</Link>
                    <Link href="/signup" className={styles.btn}>Get started</Link>
                </div>
            )}
        </nav>
    );
}

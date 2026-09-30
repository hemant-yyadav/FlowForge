"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./Navbar.module.css";

interface NavbarProps {
    onSignout?: () => void;
}

export function Navbar({ onSignout }: NavbarProps) {
    const [theme, setTheme] = useState("dark");

    useEffect(() => {
        const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
        setTheme(currentTheme);
    }, []);

    function toggleTheme() {
        const newTheme = theme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        setTheme(newTheme);
    }

    return (
        <nav className={styles.nav}>
            <Link href="/" className={styles.logo}>
                FlowForge
            </Link>
            <div className={styles.actions}>
                <button className={styles.themeToggle} onClick={toggleTheme} title="Toggle Theme">
                    {theme === "dark" ? "☀️" : "🌙"}
                </button>
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
            </div>
        </nav>
    );
}

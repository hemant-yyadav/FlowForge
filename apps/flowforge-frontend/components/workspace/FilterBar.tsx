"use client";
import { Search } from "lucide-react";
import styles from "./components.module.css";

export function FilterBar({ filter, setFilter, search, setSearch }: { filter: string, setFilter: (f: string) => void, search: string, setSearch: (s: string) => void }) {
    const filters = ["All", "Notes", "Whiteboards", "Favorites"];
    return (
        <div className={styles.filterBar}>
            <div className={styles.filterGroup}>
                {filters.map(f => (
                    <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.active : ""}`} onClick={() => setFilter(f)}>
                        {f}
                    </button>
                ))}
            </div>
            <div style={{ position: "relative", width: "300px" }}>
                <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input type="text" className="input-field" placeholder="Search title or tags..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", paddingLeft: "40px" }} />
            </div>
        </div>
    );
}

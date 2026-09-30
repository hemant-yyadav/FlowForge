"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<{ id: string; name: string; username?: string; email?: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = localStorage.getItem("token");
        if (!t) {
            router.push("/signin");
            setLoading(false);
        } else {
            setToken(t);
            // Fetch user profile from backend to get name and username
            fetch("http://localhost:3001/me", {
                headers: { "Authorization": `Bearer ${t}` }
            })
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setUser(data.user);
                } else {
                    // Fallback if not successful
                    setUser(JSON.parse(atob(t.split('.')[1] || "")));
                }
            })
            .catch(() => setUser(JSON.parse(atob(t.split('.')[1] || ""))))
            .finally(() => setLoading(false));
        }
    }, [router]);

    function signout() {
        localStorage.removeItem("token");
        window.location.href = "/logout";
    }

    return { token, loading, signout, user };
}

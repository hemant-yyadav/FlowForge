"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = localStorage.getItem("token");
        if (!t) {
            router.push("/signin");
        } else {
            setToken(t);
        }
        setLoading(false);
    }, [router]);

    function signout() {
        localStorage.removeItem("token");
        window.location.href = "http://localhost:3000/logout";
    }

    return { token, loading, signout };
}

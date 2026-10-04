"use client";
import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { FLOWFORGE_WEB_URL } from "../../lib/constants";

export default function DashboardPage() {
    const { token, loading } = useAuth();
    useEffect(() => {
        if (!loading && token) {
            // Do not put bearer tokens in URLs. When this legacy app shares the
            // frontend origin, the existing localStorage session is retained.
            window.location.href = `${FLOWFORGE_WEB_URL}/workspaces`;
        }
    }, [loading, token]);
    return null;
}

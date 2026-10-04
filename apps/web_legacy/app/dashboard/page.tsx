"use client";
import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardPage() {
    const { token, loading } = useAuth();
    useEffect(() => {
        if (!loading && token) {
            // Do not put bearer tokens in URLs. When this legacy app shares the
            // frontend origin, the existing localStorage session is retained.
            window.location.href = "http://localhost:3000/workspaces";
        }
    }, [loading, token]);
    return null;
}

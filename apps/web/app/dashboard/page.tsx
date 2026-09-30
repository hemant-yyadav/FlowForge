"use client";
import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardPage() {
    const { token, loading } = useAuth();
    useEffect(() => {
        if (!loading && token) {
            window.location.href = `http://localhost:3002/workspaces?token=${token}`;
        }
    }, [loading, token]);
    return null;
}

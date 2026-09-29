"use client";
import { useEffect } from "react";

export default function Home() {
    useEffect(() => {
        window.location.href = "http://localhost:3000/dashboard";
    }, []);
    return null;
}

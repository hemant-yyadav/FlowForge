"use client";
import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
    useEffect(() => {
        // Clear tokens from the web app's localStorage
        localStorage.removeItem("token");
        
        // Also sign out of NextAuth and redirect to signin
        signOut({ callbackUrl: "/signin" });
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-zinc-400 font-medium">Signing you out...</p>
            </div>
        </div>
    );
}

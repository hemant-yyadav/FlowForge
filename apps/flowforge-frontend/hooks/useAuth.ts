"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const loading = status === "loading";
    const user = session?.user ? { id: session.user.id ?? "", name: session.user.name ?? "", email: session.user.email ?? undefined } : null;
    useEffect(() => {
        if (!loading && !session) router.replace("/signin");
    }, [loading, router, session]);
    return { loading, signout: () => signOut({ callbackUrl: "/signin" }), user, authenticated: status === "authenticated" };
}

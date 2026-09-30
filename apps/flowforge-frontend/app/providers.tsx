"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider } from "../context/ThemeContext";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30_000,
                retry: 1,
            },
        },
    }));

    return (
        <SessionProvider>
            <ThemeProvider>
                <QueryClientProvider client={queryClient}>
                    {children}
                    <Toaster position="bottom-right" />
                </QueryClientProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}

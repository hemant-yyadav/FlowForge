"use client";
import { useQuery } from "@tanstack/react-query";

export function useActiveRooms() {
    return useQuery({
        queryKey: ["activeRooms"],
        queryFn: async () => {
            try {
                const res = await fetch("http://localhost:8080/api/active-rooms");
                if (!res.ok) return [];
                const data = await res.json();
                return data.activeRooms || [];
            } catch (e) {
                return [];
            }
        },
        refetchInterval: 5000, // Poll every 5 seconds
    });
}

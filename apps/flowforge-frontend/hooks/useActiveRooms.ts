"use client";
import { useQuery } from "@tanstack/react-query";
import { ACTIVE_ROOMS_URL } from "../config";

export function useActiveRooms() {
    return useQuery({
        queryKey: ["activeRooms"],
        queryFn: async () => {
            try {
                const res = await fetch(ACTIVE_ROOMS_URL);
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

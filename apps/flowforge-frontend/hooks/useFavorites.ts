"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/favorites-api";

export function useFavorites(token: string | null) {
    return useQuery({ queryKey: ["favorites"], queryFn: () => api.fetchFavorites(token!), enabled: !!token });
}
export function useToggleNoteFavorite(token: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (noteId: string) => api.toggleNoteFavorite(noteId, token!),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["favorites"] }); qc.invalidateQueries({ queryKey: ["notes"] }); }
    });
}
export function useToggleRoomFavorite(token: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (roomId: number) => api.toggleRoomFavorite(roomId, token!),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["favorites"] }); qc.invalidateQueries({ queryKey: ["workspaceRooms"] }); }
    });
}

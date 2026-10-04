"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/favorites-api";

export function useFavorites(enabled = true) {
    return useQuery({ queryKey: ["favorites"], queryFn: api.fetchFavorites, enabled });
}
export function useToggleNoteFavorite() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: api.toggleNoteFavorite,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["favorites"] }); qc.invalidateQueries({ queryKey: ["notes"] }); }
    });
}
export function useToggleRoomFavorite() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: api.toggleRoomFavorite,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["favorites"] }); qc.invalidateQueries({ queryKey: ["workspaceRooms"] }); }
    });
}

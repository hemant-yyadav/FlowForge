"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/notes-api";

export function useNotes(workspaceId: string | null, enabled = true) {
    return useQuery({
        queryKey: ["notes", workspaceId],
        queryFn: () => api.fetchNotes(workspaceId!),
        enabled: !!workspaceId && enabled,
    });
}

export function useNote(noteId: string | null, enabled = true) {
    return useQuery({
        queryKey: ["note", noteId],
        queryFn: () => api.fetchNote(noteId!),
        enabled: !!noteId && enabled,
    });
}

export function useCreateNote(workspaceId: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { title: string; content: any }) =>
            api.createNote(workspaceId!, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["notes", workspaceId] });
        },
    });
}

export function useDeleteNote(workspaceId: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (noteId: string) => api.deleteNote(noteId),
        onMutate: async (noteId) => {
            await qc.cancelQueries({ queryKey: ["notes", workspaceId] });
            const previousNotes = qc.getQueryData(["notes", workspaceId]);
            qc.setQueryData(["notes", workspaceId], (old: any) => {
                if (!old) return old;
                return { ...old, notes: old.notes.filter((n: any) => n.id !== noteId) };
            });
            return { previousNotes };
        },
        onError: (err, noteId, context) => {
            qc.setQueryData(["notes", workspaceId], context?.previousNotes);
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: ["notes", workspaceId] });
        },
    });
}

export function useNoteRooms(noteId: string | null, enabled = true) {
    return useQuery({
        queryKey: ["noteRooms", noteId],
        queryFn: () => api.fetchNoteRooms(noteId!),
        enabled: !!noteId && enabled,
    });
}

export function useAttachRoom(noteId: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (roomId: number) => api.attachRoom(noteId!, roomId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["noteRooms", noteId] });
        },
    });
}

export function useDetachRoom(noteId: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (roomId: number) => api.detachRoom(noteId!, roomId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["noteRooms", noteId] });
        },
    });
}

export function useWorkspaceRooms(workspaceId: string | null, enabled = true) {
    return useQuery({
        queryKey: ["workspaceRooms", workspaceId],
        queryFn: () => api.fetchWorkspaceRooms(workspaceId!),
        enabled: !!workspaceId && enabled,
    });
}

export function useCreateWorkspaceRoom(workspaceId: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (name: string) => {
            const res = await fetch("/api/backend/room", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, workspaceId })
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Failed to create room");
            return json;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["workspaceRooms", workspaceId] });
        },
    });
}

export function useUpdateNote(noteId: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { title?: string; content?: any }) =>
            api.updateNote(noteId!, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["note", noteId] });
        },
    });
}

export function useDeleteWorkspaceRoom(workspaceId: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (roomId: number) => fetch(`/api/backend/room/${roomId}`, {
            method: "DELETE",
        }).then(res => {
            if (!res.ok) throw new Error("Failed to delete room");
            return res.json();
        }),
        onMutate: async (roomId) => {
            await qc.cancelQueries({ queryKey: ["workspaceRooms", workspaceId] });
            const previousRooms = qc.getQueryData(["workspaceRooms", workspaceId]);
            qc.setQueryData(["workspaceRooms", workspaceId], (old: any) => {
                if (!old) return old;
                return { ...old, rooms: old.rooms.filter((r: any) => r.id !== roomId) };
            });
            return { previousRooms };
        },
        onError: (err, roomId, context) => {
            qc.setQueryData(["workspaceRooms", workspaceId], context?.previousRooms);
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: ["workspaceRooms", workspaceId] });
        },
    });
}

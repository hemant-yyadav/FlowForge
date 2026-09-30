"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/notes-api";

export function useNotes(workspaceId: string | null, token: string | null) {
    return useQuery({
        queryKey: ["notes", workspaceId],
        queryFn: () => api.fetchNotes(workspaceId!, token!),
        enabled: !!workspaceId && !!token,
    });
}

export function useNote(noteId: string | null, token: string | null) {
    return useQuery({
        queryKey: ["note", noteId],
        queryFn: () => api.fetchNote(noteId!, token!),
        enabled: !!noteId && !!token,
    });
}

export function useCreateNote(workspaceId: string | null, token: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { title: string; content: any }) =>
            api.createNote(workspaceId!, data, token!),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["notes", workspaceId] });
        },
    });
}

export function useDeleteNote(workspaceId: string | null, token: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (noteId: string) => api.deleteNote(noteId, token!),
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

export function useNoteRooms(noteId: string | null, token: string | null) {
    return useQuery({
        queryKey: ["noteRooms", noteId],
        queryFn: () => api.fetchNoteRooms(noteId!, token!),
        enabled: !!noteId && !!token,
    });
}

export function useAttachRoom(noteId: string | null, token: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (roomId: number) => api.attachRoom(noteId!, roomId, token!),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["noteRooms", noteId] });
        },
    });
}

export function useDetachRoom(noteId: string | null, token: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (roomId: number) => api.detachRoom(noteId!, roomId, token!),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["noteRooms", noteId] });
        },
    });
}

export function useWorkspaceRooms(workspaceId: string | null, token: string | null) {
    return useQuery({
        queryKey: ["workspaceRooms", workspaceId],
        queryFn: () => api.fetchWorkspaceRooms(workspaceId!, token!),
        enabled: !!workspaceId && !!token,
    });
}

export function useCreateWorkspaceRoom(workspaceId: string | null, token: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (name: string) => fetch("http://localhost:3001/room", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name, workspaceId })
        }).then(res => res.json()),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["workspaceRooms", workspaceId] });
        },
    });
}

export function useUpdateNote(noteId: string | null, token: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { title?: string; content?: any }) =>
            api.updateNote(noteId!, data, token!),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["note", noteId] });
        },
    });
}

export function useDeleteWorkspaceRoom(workspaceId: string | null, token: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (roomId: number) => fetch(`http://localhost:3001/room/${roomId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
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

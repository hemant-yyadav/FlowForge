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
        onSuccess: () => {
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

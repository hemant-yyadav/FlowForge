"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/workspace-api";

export function useWorkspaces(token: string | null) {
    return useQuery({ queryKey: ["workspaces", token], queryFn: () => api.fetchWorkspaces(token!), enabled: !!token });
}
export function useWorkspace(workspaceId: string | null, token: string | null) {
    return useQuery({ queryKey: ["workspace", workspaceId, token], queryFn: () => api.fetchWorkspace(workspaceId!, token!), enabled: !!workspaceId && !!token });
}

export function useDeleteWorkspace(token: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (workspaceId: string) => api.deleteWorkspace(workspaceId, token!),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["workspaces", token] })
    });
}

export function useAddWorkspaceMember(workspaceId: string, token: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (username: string) => api.addWorkspaceMember(workspaceId, username, token!),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["workspace", workspaceId, token] })
    });
}

export function useRemoveWorkspaceMember(workspaceId: string, token: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => api.removeWorkspaceMember(workspaceId, userId, token!),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["workspace", workspaceId, token] })
    });
}

export function useUpdateWorkspaceMemberRole(workspaceId: string, token: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, role }: { userId: string, role: string }) => api.updateWorkspaceMemberRole(workspaceId, userId, role, token!),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["workspace", workspaceId, token] })
    });
}

export function useDeleteRoom(workspaceId: string, token: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (roomId: number) => api.deleteRoom(roomId, token!),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["workspace", workspaceId, token] })
    });
}

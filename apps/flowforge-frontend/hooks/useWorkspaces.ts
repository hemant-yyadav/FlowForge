"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/workspace-api";

export function useWorkspaces(enabled = true) {
    return useQuery({ queryKey: ["workspaces"], queryFn: api.fetchWorkspaces, enabled });
}
export function useWorkspace(workspaceId: string | null, enabled = true) {
    return useQuery({ queryKey: ["workspace", workspaceId], queryFn: () => api.fetchWorkspace(workspaceId!), enabled: !!workspaceId && enabled });
}

export function useDeleteWorkspace() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: api.deleteWorkspace,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["workspaces"] })
    });
}

export function useAddWorkspaceMember(workspaceId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (username: string) => api.addWorkspaceMember(workspaceId, username),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["workspace", workspaceId] })
    });
}

export function useRemoveWorkspaceMember(workspaceId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => api.removeWorkspaceMember(workspaceId, userId),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["workspace", workspaceId] })
    });
}

export function useUpdateWorkspaceMemberRole(workspaceId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, role }: { userId: string, role: string }) => api.updateWorkspaceMemberRole(workspaceId, userId, role),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["workspace", workspaceId] })
    });
}

export function useDeleteRoom(workspaceId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: api.deleteRoom,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["workspace", workspaceId] })
    });
}

"use client";
import { useQuery } from "@tanstack/react-query";
import * as api from "../lib/workspace-api";

export function useWorkspaces(token: string | null) {
    return useQuery({ queryKey: ["workspaces"], queryFn: () => api.fetchWorkspaces(token!), enabled: !!token });
}
export function useWorkspace(workspaceId: string | null, token: string | null) {
    return useQuery({ queryKey: ["workspace", workspaceId], queryFn: () => api.fetchWorkspace(workspaceId!, token!), enabled: !!workspaceId && !!token });
}

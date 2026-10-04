async function authFetch(path: string, options: RequestInit = {}) {
    const res = await fetch(`/api/backend${path}`, {
        cache: "no-store",
        ...options,
        headers: { "Content-Type": "application/json", ...options.headers },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const error = new Error(body.message || `Request failed with status ${res.status}`);
        (error as any).status = res.status;
        throw error;
    }
    return res.json();
}

export async function fetchWorkspaces() { return authFetch(`/api/v1/workspaces`); }
export async function fetchWorkspace(workspaceId: string) { return authFetch(`/api/v1/workspaces/${workspaceId}`); }
export async function deleteWorkspace(workspaceId: string) { return authFetch(`/api/v1/workspaces/${workspaceId}`, { method: "DELETE" }); }
export async function addWorkspaceMember(workspaceId: string, username: string) { return authFetch(`/api/v1/workspaces/${workspaceId}/members`, { method: "POST", body: JSON.stringify({ username }) }); }
export async function removeWorkspaceMember(workspaceId: string, userId: string) { return authFetch(`/api/v1/workspaces/${workspaceId}/members/${userId}`, { method: "DELETE" }); }
export async function updateWorkspaceMemberRole(workspaceId: string, userId: string, role: string) { return authFetch(`/api/v1/workspaces/${workspaceId}/members/${userId}/role`, { method: "PUT", body: JSON.stringify({ role }) }); }
export async function deleteRoom(roomId: number) { return authFetch(`/room/${roomId}`, { method: "DELETE" }); }

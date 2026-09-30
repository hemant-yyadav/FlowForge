import { HTTP_URL } from "../config";

async function authFetch(url: string, token: string, options: RequestInit = {}) {
    const res = await fetch(url, {
        cache: "no-store",
        ...options,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, ...options.headers },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const error = new Error(body.message || `Request failed with status ${res.status}`);
        (error as any).status = res.status;
        throw error;
    }
    return res.json();
}

export async function fetchWorkspaces(token: string) { return authFetch(`${HTTP_URL}/api/v1/workspaces`, token); }
export async function fetchWorkspace(workspaceId: string, token: string) { return authFetch(`${HTTP_URL}/api/v1/workspaces/${workspaceId}`, token); }
export async function deleteWorkspace(workspaceId: string, token: string) { return authFetch(`${HTTP_URL}/api/v1/workspaces/${workspaceId}`, token, { method: "DELETE" }); }
export async function addWorkspaceMember(workspaceId: string, username: string, token: string) { return authFetch(`${HTTP_URL}/api/v1/workspaces/${workspaceId}/members`, token, { method: "POST", body: JSON.stringify({ username }) }); }
export async function removeWorkspaceMember(workspaceId: string, userId: string, token: string) { return authFetch(`${HTTP_URL}/api/v1/workspaces/${workspaceId}/members/${userId}`, token, { method: "DELETE" }); }
export async function updateWorkspaceMemberRole(workspaceId: string, userId: string, role: string, token: string) { return authFetch(`${HTTP_URL}/api/v1/workspaces/${workspaceId}/members/${userId}/role`, token, { method: "PUT", body: JSON.stringify({ role }) }); }
export async function deleteRoom(roomId: number, token: string) { return authFetch(`${HTTP_URL}/room/${roomId}`, token, { method: "DELETE" }); }

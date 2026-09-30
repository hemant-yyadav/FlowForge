import { HTTP_URL } from "../config";

async function authFetch(url: string, token: string, options: RequestInit = {}) {
    const res = await fetch(url, {
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

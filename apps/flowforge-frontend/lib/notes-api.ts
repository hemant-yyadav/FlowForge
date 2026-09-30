import { HTTP_URL } from "../config";

async function authFetch(url: string, token: string, options: RequestInit = {}) {
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...options.headers,
        },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const error = new Error(body.message || `Request failed with status ${res.status}`);
        (error as any).status = res.status;
        throw error;
    }
    return res.json();
}

// Notes
export async function fetchNotes(workspaceId: string, token: string) {
    return authFetch(`${HTTP_URL}/api/v1/workspaces/${workspaceId}/notes`, token);
}

export async function fetchNote(noteId: string, token: string) {
    return authFetch(`${HTTP_URL}/api/v1/notes/${noteId}`, token);
}

export async function createNote(workspaceId: string, data: { title: string; content: any }, token: string) {
    return authFetch(`${HTTP_URL}/api/v1/workspaces/${workspaceId}/notes`, token, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateNote(noteId: string, data: { title?: string; content?: any }, token: string) {
    return authFetch(`${HTTP_URL}/api/v1/notes/${noteId}`, token, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteNote(noteId: string, token: string) {
    return authFetch(`${HTTP_URL}/api/v1/notes/${noteId}`, token, {
        method: "DELETE",
    });
}

// Whiteboard References
export async function fetchNoteRooms(noteId: string, token: string) {
    return authFetch(`${HTTP_URL}/api/v1/notes/${noteId}/rooms`, token);
}

export async function attachRoom(noteId: string, roomId: number, token: string) {
    return authFetch(`${HTTP_URL}/api/v1/notes/${noteId}/rooms`, token, {
        method: "POST",
        body: JSON.stringify({ roomId }),
    });
}

export async function detachRoom(noteId: string, roomId: number, token: string) {
    return authFetch(`${HTTP_URL}/api/v1/notes/${noteId}/rooms/${roomId}`, token, {
        method: "DELETE",
    });
}

// Workspace Rooms
export async function fetchWorkspaceRooms(workspaceId: string, token: string) {
    return authFetch(`${HTTP_URL}/api/v1/workspaces/${workspaceId}/rooms`, token);
}

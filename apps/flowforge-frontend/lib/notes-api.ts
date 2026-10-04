async function authFetch(path: string, options: RequestInit = {}) {
    const res = await fetch(`/api/backend${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
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
export async function fetchNotes(workspaceId: string) {
    return authFetch(`/api/v1/workspaces/${workspaceId}/notes`);
}

export async function fetchNote(noteId: string) {
    return authFetch(`/api/v1/notes/${noteId}`);
}

export async function createNote(workspaceId: string, data: { title: string; content: any }) {
    return authFetch(`/api/v1/workspaces/${workspaceId}/notes`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateNote(noteId: string, data: { title?: string; content?: any }) {
    return authFetch(`/api/v1/notes/${noteId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteNote(noteId: string) {
    return authFetch(`/api/v1/notes/${noteId}`, {
        method: "DELETE",
    });
}

// Whiteboard References
export async function fetchNoteRooms(noteId: string) {
    return authFetch(`/api/v1/notes/${noteId}/rooms`);
}

export async function attachRoom(noteId: string, roomId: number) {
    return authFetch(`/api/v1/notes/${noteId}/rooms`, {
        method: "POST",
        body: JSON.stringify({ roomId }),
    });
}

export async function detachRoom(noteId: string, roomId: number) {
    return authFetch(`/api/v1/notes/${noteId}/rooms/${roomId}`, {
        method: "DELETE",
    });
}

// Workspace Rooms
export async function fetchWorkspaceRooms(workspaceId: string) {
    return authFetch(`/api/v1/workspaces/${workspaceId}/rooms`);
}

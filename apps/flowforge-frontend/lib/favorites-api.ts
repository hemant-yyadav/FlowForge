async function authFetch(path: string, options: RequestInit = {}) {
    const res = await fetch(`/api/backend${path}`, {
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

export async function fetchFavorites() { return authFetch(`/api/v1/favorites`); }
export async function toggleNoteFavorite(noteId: string) { return authFetch(`/api/v1/favorites/notes/${noteId}`, { method: "POST" }); }
export async function toggleRoomFavorite(roomId: number) { return authFetch(`/api/v1/favorites/rooms/${roomId}`, { method: "POST" }); }

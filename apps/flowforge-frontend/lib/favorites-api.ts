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

export async function fetchFavorites(token: string) { return authFetch(`${HTTP_URL}/api/v1/favorites`, token); }
export async function toggleNoteFavorite(noteId: string, token: string) { return authFetch(`${HTTP_URL}/api/v1/favorites/notes/${noteId}`, token, { method: "POST" }); }
export async function toggleRoomFavorite(roomId: number, token: string) { return authFetch(`${HTTP_URL}/api/v1/favorites/rooms/${roomId}`, token, { method: "POST" }); }

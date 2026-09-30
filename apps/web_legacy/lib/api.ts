import { API_URL } from "./constants";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiOptions {
    method?: HttpMethod;
    body?: unknown;
    token?: string;
}

interface ApiResult<T> {
    data: T | null;
    error: string | null;
}

export async function apiRequest<T>(
    path: string,
    options: ApiOptions = {}
): Promise<ApiResult<T>> {
    const { method = "GET", body, token } = options;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(`${API_URL}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        const json = await res.json();

        if (!res.ok) {
            return { data: null, error: json.message ?? "Something went wrong" };
        }

        return { data: json as T, error: null };
    } catch {
        return { data: null, error: "Could not connect to server" };
    }
}

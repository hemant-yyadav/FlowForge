type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiOptions {
    method?: HttpMethod;
    body?: unknown;
}

interface ApiResult<T> {
    data: T | null;
    error: string | null;
}

export async function apiRequest<T>(
    path: string,
    options: ApiOptions = {}
): Promise<ApiResult<T>> {
    const { method = "GET", body } = options;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    try {
        const res = await fetch(`/api/backend${path}`, {
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

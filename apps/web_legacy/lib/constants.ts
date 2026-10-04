function endpoint(name: string, fallback: string, protocols: string[]): string {
    const value = process.env[name] || fallback;
    try {
        const url = new URL(value);
        if (!protocols.includes(url.protocol)) throw new Error();
        return url.toString().replace(/\/$/, "");
    } catch {
        throw new Error(`${name} must be an absolute ${protocols.join(" or ")} URL`);
    }
}

export const API_URL = endpoint("NEXT_PUBLIC_HTTP_URL", "http://localhost:3001", ["http:", "https:"]);
export const WS_URL = endpoint("NEXT_PUBLIC_WS_URL", "ws://localhost:8080", ["ws:", "wss:"]);
export const FLOWFORGE_WEB_URL = endpoint("NEXT_PUBLIC_FLOWFORGE_WEB_URL", "http://localhost:3000", ["http:", "https:"]);

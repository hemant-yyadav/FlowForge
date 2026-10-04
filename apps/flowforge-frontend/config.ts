function endpoint(name: "NEXT_PUBLIC_HTTP_URL" | "NEXT_PUBLIC_WS_URL", fallback: string, protocols: string[]): string {
    const value = process.env[name] || fallback;
    try {
        const url = new URL(value);
        if (!protocols.includes(url.protocol)) throw new Error();
        return url.toString().replace(/\/$/, "");
    } catch {
        throw new Error(`${name} must be an absolute ${protocols.join(" or ")} URL`);
    }
}

// Localhost values are intentional development defaults. Deployments override
// them at build time with NEXT_PUBLIC_HTTP_URL and NEXT_PUBLIC_WS_URL.
export const HTTP_URL = endpoint("NEXT_PUBLIC_HTTP_URL", "http://localhost:3001", ["http:", "https:"]);
export const WS_URL = endpoint("NEXT_PUBLIC_WS_URL", "ws://localhost:8080", ["ws:", "wss:"]);
export const ACTIVE_ROOMS_URL = `${WS_URL.replace(/^ws/, "http")}/api/active-rooms`;

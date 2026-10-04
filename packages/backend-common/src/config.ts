const MIN_SECRET_LENGTH = 32;

function requiredSecret(name: "JWT_SECRET" | "OAUTH_BACKEND_SHARED_SECRET"): string {
    const value = process.env[name];
    if (!value || value.length < MIN_SECRET_LENGTH) {
        throw new Error(`${name} must be set to a secret of at least ${MIN_SECRET_LENGTH} characters`);
    }
    return value;
}

/**
 * Access tokens are deliberately short lived.  This application currently has
 * no refresh-token store, so users sign in again when the 15 minute token
 * expires.  Rotating JWT_SECRET invalidates every active access token.
 */
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const OAUTH_ASSERTION_TTL_SECONDS = 60;

export function getJwtSecret(): string {
    return requiredSecret("JWT_SECRET");
}

export function getOAuthBackendSharedSecret(): string {
    return requiredSecret("OAUTH_BACKEND_SHARED_SECRET");
}

export function getAllowedOrigins(): string[] {
    const raw = process.env["ALLOWED_ORIGINS"];
    if (!raw) {
        throw new Error("ALLOWED_ORIGINS must contain at least one allowed origin");
    }

    const origins = raw.split(",").map((origin) => origin.trim()).filter(Boolean);
    if (origins.length === 0 || origins.some((origin) => {
        try {
            return new URL(origin).origin !== origin;
        } catch {
            return true;
        }
    })) {
        throw new Error("ALLOWED_ORIGINS must be a comma-separated list of absolute origins");
    }
    return origins;
}

export function isAllowedOrigin(origin: string | undefined): boolean {
    return typeof origin === "string" && getAllowedOrigins().includes(origin);
}

export function assertHttpConfiguration(): void {
    getJwtSecret();
    getOAuthBackendSharedSecret();
    getAllowedOrigins();
}

export function assertWebSocketConfiguration(): void {
    getJwtSecret();
    getAllowedOrigins();
}

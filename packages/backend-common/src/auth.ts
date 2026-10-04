import jwt, { JwtPayload } from "jsonwebtoken";
import {
    ACCESS_TOKEN_TTL_SECONDS,
    getJwtSecret,
    getOAuthBackendSharedSecret,
    OAUTH_ASSERTION_TTL_SECONDS,
    getWebSocketTicketSecret,
    WS_TICKET_TTL_SECONDS,
} from "./config.js";

export type OAuthProvider = "google" | "github";

export interface OAuthAssertion {
    email: string | null;
    name: string | null;
    provider: OAuthProvider;
    providerId: string;
}

export interface WebSocketTicket {
    userId: string;
    ticketId: string;
}

export function signAccessToken(userId: string): string {
    return jwt.sign({ userId }, getJwtSecret(), { expiresIn: ACCESS_TOKEN_TTL_SECONDS });
}

export function checkUser(token: string): string | null {
    try {
        const decoded = jwt.verify(token, getJwtSecret());
        if (!decoded || !(decoded as JwtPayload).userId) {
            return null;
        }
        return (decoded as JwtPayload).userId as string;
    } catch {
        return null;
    }
}

/** A short-lived assertion created only after NextAuth has verified the provider callback. */
export function createOAuthAssertion(assertion: OAuthAssertion): string {
    return jwt.sign(assertion, getOAuthBackendSharedSecret(), {
        expiresIn: OAUTH_ASSERTION_TTL_SECONDS,
        issuer: "flowforge-nextauth",
        audience: "flowforge-http-backend",
    });
}

export function verifyOAuthAssertion(token: string): OAuthAssertion | null {
    try {
        const decoded = jwt.verify(token, getOAuthBackendSharedSecret(), {
            issuer: "flowforge-nextauth",
            audience: "flowforge-http-backend",
        });
        if (!decoded || typeof decoded === "string") return null;
        const { provider, providerId, email, name } = decoded as JwtPayload;
        if ((provider !== "google" && provider !== "github") || typeof providerId !== "string" || providerId.length === 0) {
            return null;
        }
        return {
            provider,
            providerId,
            email: typeof email === "string" ? email : null,
            name: typeof name === "string" ? name : null,
        };
    } catch {
        return null;
    }
}

/**
 * Tickets are intentionally short lived and audience-bound. They are stateless:
 * enforcing strict single use would require a shared ticket store (for example Redis).
 */
export function createWebSocketTicket(userId: string): string {
    return jwt.sign({ userId, ticketId: crypto.randomUUID() }, getWebSocketTicketSecret(), {
        expiresIn: WS_TICKET_TTL_SECONDS,
        audience: "websocket",
        issuer: "flowforge-nextauth",
    });
}

export function verifyWebSocketTicket(token: string): WebSocketTicket | null {
    try {
        const decoded = jwt.verify(token, getWebSocketTicketSecret(), {
            audience: "websocket",
            issuer: "flowforge-nextauth",
        });
        if (!decoded || typeof decoded === "string") return null;
        const { userId, ticketId } = decoded as JwtPayload;
        if (typeof userId !== "string" || userId.length === 0 || typeof ticketId !== "string" || ticketId.length === 0) return null;
        return { userId, ticketId };
    } catch {
        return null;
    }
}

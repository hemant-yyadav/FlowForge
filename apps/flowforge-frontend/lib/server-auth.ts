import "server-only";

const MIN_SECRET_LENGTH = 32;

export function getNextAuthSecret(): string {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret || secret.length < MIN_SECRET_LENGTH) {
        throw new Error(`NEXTAUTH_SECRET must be set to a secret of at least ${MIN_SECRET_LENGTH} characters`);
    }
    return secret;
}

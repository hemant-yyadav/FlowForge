import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { createOAuthAssertion } from "@repo/backend-common/auth";
import { getHttpBackendUrl } from "@repo/backend-common/config";
import { getNextAuthSecret } from "../../../../lib/server-auth";

const handler = NextAuth({
    secret: getNextAuthSecret(),
    session: { strategy: "jwt", maxAge: 15 * 60 },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: { username: { label: "Username", type: "text" }, password: { label: "Password", type: "password" } },
            async authorize(credentials) {
                if (typeof credentials?.username !== "string" || typeof credentials.password !== "string") return null;
                try {
                    const response = await fetch(`${getHttpBackendUrl()}/signin`, {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username: credentials.username, password: credentials.password }),
                    });
                    if (!response.ok) return null;
                    const data = await response.json() as { token?: unknown; userId?: unknown };
                    if (typeof data.token !== "string" || !data.token || typeof data.userId !== "string" || !data.userId) return null;
                    return { id: data.userId, name: credentials.username, backendAccessToken: data.token, backendUserId: data.userId };
                } catch { return null; }
            },
        }),
        GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID || "", clientSecret: process.env.GOOGLE_CLIENT_SECRET || "" }),
        GithubProvider({ clientId: process.env.GITHUB_CLIENT_ID || "", clientSecret: process.env.GITHUB_CLIENT_SECRET || "" }),
    ],
    callbacks: {
        async jwt({ token, account, user }) {
            if (user && "backendAccessToken" in user && typeof user.backendAccessToken === "string") token.backendAccessToken = user.backendAccessToken;
            if (user && "backendUserId" in user && typeof user.backendUserId === "string") token.backendUserId = user.backendUserId;
            if (account && user && account.provider !== "credentials") {
                if (account.provider !== "google" && account.provider !== "github") throw new Error("Unsupported OAuth provider");
                const assertion = createOAuthAssertion({ email: user.email ?? null, name: user.name ?? null, provider: account.provider, providerId: account.providerAccountId });
                const response = await fetch(`${getHttpBackendUrl()}/oauth`, {
                    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assertion }),
                });
                if (!response.ok) throw new Error("OAuth sign-in could not be completed");
                const data = await response.json() as { token?: unknown; userId?: unknown };
                if (typeof data.token !== "string" || !data.token || typeof data.userId !== "string" || !data.userId) throw new Error("OAuth sign-in could not be completed");
                // Stored only in NextAuth's encrypted server-side JWT cookie.
                token.backendAccessToken = data.token;
                token.backendUserId = data.userId;
            }
            return token;
        },
        async session({ session, token }) {
            // Do not expose backendAccessToken or another backend credential here.
            if (session.user && typeof token.backendUserId === "string") session.user.id = token.backendUserId;
            return session;
        },
    },
});

export { handler as GET, handler as POST };

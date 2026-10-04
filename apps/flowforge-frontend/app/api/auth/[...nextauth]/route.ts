import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { createOAuthAssertion } from "@repo/backend-common/auth";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, account, user }) {
            // Initial sign in
            if (account && user) {
                try {
                    if (account.provider !== "google" && account.provider !== "github") {
                        throw new Error("Unsupported OAuth provider");
                    }
                    // Exchange OAuth profile for our custom backend JWT
                    const assertion = createOAuthAssertion({
                        email: user.email ?? null,
                        name: user.name ?? null,
                        provider: account.provider,
                        providerId: account.providerAccountId,
                    });
                    const backendUrl = process.env.HTTP_BACKEND_URL || "http://localhost:3001";
                    const res = await fetch(`${backendUrl}/oauth`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ assertion }),
                    });

                    if (res.ok) {
                        const data = await res.json();
                        token.customJwt = data.token;
                    } else {
                        const errText = await res.text();
                        console.error("Failed to authenticate with custom backend:", res.status, errText);
                    }
                } catch (error) {
                    console.error("Error during OAuth exchange:", error);
                }
            }
            return token;
        },
        async session({ session, token }) {
            // Send the custom JWT to the client
            const customSession = session as typeof session & { customJwt?: string | unknown };
            customSession.customJwt = token.customJwt;
            return customSession;
        },
    },
});

export { handler as GET, handler as POST };

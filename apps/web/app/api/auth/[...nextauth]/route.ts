import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

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
                    // Exchange OAuth profile for our custom backend JWT
                    const res = await fetch("http://localhost:3001/oauth", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name,
                            provider: account.provider,
                            providerId: account.providerAccountId,
                        }),
                    });

                    if (res.ok) {
                        const data = await res.json();
                        token.customJwt = data.token;
                    } else {
                        console.error("Failed to authenticate with custom backend");
                    }
                } catch (error) {
                    console.error("Error during OAuth exchange:", error);
                }
            }
            return token;
        },
        async session({ session, token }) {
            // Send the custom JWT to the client
            (session as any).customJwt = token.customJwt;
            return session;
        },
    },
});

export { handler as GET, handler as POST };

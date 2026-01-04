import NextAuthLib from "next-auth";
// const NextAuth = NextAuthLib.default || NextAuthLib; // Not needed here, only authOptions
import CredentialsProviderLib from "next-auth/providers/credentials";
const CredentialsProvider = CredentialsProviderLib.default || CredentialsProviderLib;
import GoogleProviderLib from "next-auth/providers/google";
const GoogleProvider = GoogleProviderLib.default || GoogleProviderLib;
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "mock-id",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-secret",
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                role: { label: "Role", type: "text" }
            },
            async authorize(credentials) {
                console.log("LOGIN DEBUG: Starting auth for:", credentials.email);

                // 1. Find User by Email
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                console.log("LOGIN DEBUG: DB Result:", user);

                if (!user) {
                    console.log("LOGIN DEBUG: No user found! Throwing error.");
                    throw new Error("No user found with this email");
                }

                // 2. Password Check (Simple)
                // if (credentials.password !== user.password) {
                //     throw new Error("Invalid password");
                // }

                // 4. Return User
                return { id: user.id, name: user.name, email: user.email, role: user.role };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "super-secret-key-1234",
};

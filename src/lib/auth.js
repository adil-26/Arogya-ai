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
            // Remove dangerous email linking - each account should be separate
            allowDangerousEmailAccountLinking: false,
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
        async signIn({ user, account, profile }) {
            // For Google OAuth, ensure user is created/updated with patient role
            if (account.provider === "google") {
                console.log("Google Sign-In:", user.email);

                // Check if user exists
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email }
                });

                // If user exists but doesn't have a role, set it to patient
                if (existingUser && !existingUser.role) {
                    await prisma.user.update({
                        where: { email: user.email },
                        data: { role: 'patient' }
                    });
                }

                // For brand new users, the PrismaAdapter will create them
                // but we need to ensure they have the patient role
                // This is handled in the jwt callback below
            }
            return true;
        },
        async jwt({ token, user, account }) {
            // Initial sign in - user object is available
            if (user) {
                token.role = user.role || 'patient'; // Default to patient if no role
                token.id = user.id;
            }
            // Subsequent requests - fetch fresh data from database
            if (token.email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: token.email },
                    select: { id: true, role: true, name: true, email: true }
                });
                if (dbUser) {
                    // If user has no role, set it to patient
                    if (!dbUser.role) {
                        await prisma.user.update({
                            where: { email: token.email },
                            data: { role: 'patient' }
                        });
                        token.role = 'patient';
                    } else {
                        token.role = dbUser.role;
                    }
                    token.id = dbUser.id;
                    token.name = dbUser.name;
                }
            }
            return token;
        },
        async session({ session, token }) {
            // Add user info to session from token
            if (session?.user) {
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.name = token.name;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET || "super-secret-key-1234",
    // Enable debug for troubleshooting (remove in production)
    debug: process.env.NODE_ENV === 'development',
};

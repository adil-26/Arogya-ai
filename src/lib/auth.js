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
            // Allow linking if user exists with same email (needed for smooth UX)
            allowDangerousEmailAccountLinking: true,
            // Force account selection every time
            authorization: {
                params: {
                    prompt: "select_account",
                    access_type: "offline",
                    response_type: "code"
                }
            }
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

                // 4. Return User with role
                return { id: user.id, name: user.name, email: user.email, role: user.role || 'patient' };
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // For Google OAuth, ensure user has patient role
            if (account?.provider === "google") {
                console.log("Google Sign-In callback for:", user.email);

                try {
                    // Check if user already exists in database
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email }
                    });

                    if (existingUser) {
                        // User exists - update role if missing
                        if (!existingUser.role) {
                            await prisma.user.update({
                                where: { email: user.email },
                                data: { role: 'patient' }
                            });
                            console.log("Updated existing user role to patient");
                        }
                    }
                    // If user doesn't exist, PrismaAdapter will create them
                    // The role default in schema should set it to 'patient'
                } catch (error) {
                    console.error("Error in signIn callback:", error);
                }
            }
            return true;
        },
        async jwt({ token, user, account, trigger }) {
            console.log("JWT callback - user:", user?.email, "trigger:", trigger);

            // Initial sign in - user object is available
            if (user) {
                token.role = user.role || 'patient';
                token.id = user.id;
                token.email = user.email;
            }

            // Fetch fresh data from database on every request
            if (token.email) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: token.email },
                        select: { id: true, role: true, name: true, email: true }
                    });

                    if (dbUser) {
                        token.id = dbUser.id;
                        token.role = dbUser.role || 'patient';
                        token.name = dbUser.name;

                        // Ensure role is set in database
                        if (!dbUser.role) {
                            await prisma.user.update({
                                where: { email: token.email },
                                data: { role: 'patient' }
                            });
                        }
                    }
                } catch (error) {
                    console.error("JWT callback database error:", error);
                }
            }

            return token;
        },
        async session({ session, token }) {
            // Add user info to session from token
            if (session?.user) {
                session.user.role = token.role || 'patient';
                session.user.id = token.id;
                session.user.name = token.name;
            }
            console.log("Session callback - role:", session?.user?.role);
            return session;
        }
    },
    pages: {
        signIn: '/login',
        error: '/login', // Redirect to login on error
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET || "super-secret-key-1234",
    debug: true, // Enable debug logs always for now
};


// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  // Recommended: explicitly wire env
  secret: process.env.BETTER_AUTH_SECRET!,      // required to sign cookies
  baseURL: process.env.BETTER_AUTH_URL,         // optional, helpful for callbacks

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Unless you're using DB-generated IDs (INTEGER/SERIAL, etc.), leave this out.
  advanced: { database: { generateId: false } },

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },

  // Keep this LAST so cookies are applied in Next.js handlers/actions
  plugins: [nextCookies()],
  socialProviders: {
        google: { 
            prompt: "select_account",
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
});

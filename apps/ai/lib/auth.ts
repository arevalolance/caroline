import { convexAdapter } from "@better-auth-kit/convex";
import { betterAuth } from "better-auth";
import { ConvexHttpClient } from "convex/browser";

const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export const auth = betterAuth({
    database: convexAdapter(convexClient),
    plugins: [],
    emailAndPassword: {
        enabled: true,
        async sendResetPassword(data, request) {
            // Send an email to the user with a link to reset their password
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!
        }
    },
});
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Table to store user information
    // Useful if you have authentication and want to associate chats with users
    // user: defineTable({
    //     // If you're using Clerk, Auth0, or another auth provider,
    //     // store their unique user ID here.
    //     // externalId: v.string(), // e.g., Clerk User ID
    //     name: v.optional(v.string()),
    //     email: v.optional(v.string()),
    //     emailVerified: v.boolean(),
    //     image: v.optional(v.string()),
    //     updatedAt: v.number(),
    //     // You can add other user-specific preferences or data here
    // }),

    // Table to store conversations/chat sessions
    chat: defineTable({
        chatId: v.string(), // UUID from frontend
        userId: v.optional(v.id("user")), // Link to the user who owns this conversation
        title: v.optional(v.string()), // A title for the conversation (e.g., AI generated, or first user message)
        visibility: v.union(v.literal("public"), v.literal("private")),
    })
        .index("by_userId_creationTime", ["userId", "_creationTime"])
        .index("by_uuid_creationTime", ["chatId", "_creationTime"]), // For fetching user's chats sorted by time

    // Table to store individual messages within a conversation
    messages: defineTable({
        chatId: v.id("chat"), // Link to the parent conversation
        role: v.string(),
        parts: v.any(),
        attachments: v.any(),
    })
        .index("by_chatId_creationTime", ["chatId", "_creationTime"]), // Crucial for fetching messages for a chat, sorted
});

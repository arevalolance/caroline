// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Table to store user information
    // Useful if you have authentication and want to associate chats with users
    users: defineTable({
        // If you're using Clerk, Auth0, or another auth provider,
        // store their unique user ID here.
        externalId: v.string(), // e.g., Clerk User ID
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        // You can add other user-specific preferences or data here
    }).index("by_externalId", ["externalId"]), // Index for quick lookup by external ID

    // Table to store conversations/chat sessions
    conversations: defineTable({
        userId: v.optional(v.id("users")), // Link to the user who owns this conversation
        title: v.optional(v.string()), // A title for the conversation (e.g., AI generated, or first user message)
        createdAt: v.number(), // Timestamp of creation (Date.now())
        // You could add metadata like the AI model used, etc.
        // vercelConversationId: v.optional(v.string()), // If Vercel AI SDK provides a persistent ID for the stream
    })
        .index("by_userId_createdAt", ["userId", "createdAt"]) // For fetching user's chats sorted by time
        .index("by_createdAt", ["createdAt"]), // For fetching recent chats across all users (admin view)

    // Table to store individual messages within a conversation
    messages: defineTable({
        conversationId: v.id("conversations"), // Link to the parent conversation
        // The 'role' aligns with OpenAI and Vercel AI SDK's Message type
        role: v.union(
            v.literal("user"),
            v.literal("assistant"),
            v.literal("system"),
            v.literal("tool"), // For tool/function call results
            // v.literal("function") // Vercel AI SDK sometimes uses 'function' for the invocation part
        ),
        content: v.string(), // The text content of the message
        createdAt: v.number(), // Timestamp of creation (Date.now())
    })
        .index("by_conversationId_createdAt", ["conversationId", "createdAt"]), // Crucial for fetching messages for a chat, sorted
});

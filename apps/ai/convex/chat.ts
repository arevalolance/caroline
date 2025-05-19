import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createChat = mutation({
	args: {
		userId: v.id("user"),
		chatId: v.string(),
		title: v.string(),
	},
	handler: async (ctx, args) => {
		const chat = await ctx.db.insert("chat", {
			chatId: args.chatId,
			userId: args.userId,
			title: args.title,
			visibility: "private",
		});

		return chat;
	},
})

export const getChatByUuid = query({
	args: {
		chatId: v.string(), // Expect the frontend-generated UUID
	},
	handler: async (ctx, args) => {
		const chat = await ctx.db
			.query("chat")
			.withIndex("by_uuid_creationTime", (q) => q.eq("chatId", args.chatId))
			.unique();

		return chat;
	},
});

export const updateChatVisibility = mutation({
	args: {
		id: v.id("chat"),
		visibility: v.union(v.literal("private"), v.literal("public")),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, { visibility: args.visibility });
	},
})
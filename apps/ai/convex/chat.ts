import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createChat = mutation({
	args: {
		userId: v.id("user"),
		title: v.string(),
	},
	handler: async (ctx, args) => {
		const chat = await ctx.db.insert("chat", {
			userId: args.userId,
			title: args.title,
			visibility: "private",
		});

		return chat;
	},
})

export const getChatById = query({
	args: {
		id: v.id("chat"),
	},
	handler: async (ctx, args) => {
		const chat = await ctx.db.get(args.id);
		return chat;
	},
})

export const updateChatVisibility = mutation({
	args: {
		id: v.id("chat"),
		visibility: v.union(v.literal("private"), v.literal("public")),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, { visibility: args.visibility });
	},
})
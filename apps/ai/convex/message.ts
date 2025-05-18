import { ExpressionOrValue } from "convex/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveMessage = mutation({
	args: {
		chatId: v.id("chat"),
		role: v.string(),
		parts: v.any(),
		attachments: v.any(),
	},
	handler: async (ctx, args) => {
		const message = await ctx.db.insert("messages", {
			chatId: args.chatId,
			role: args.role,
			parts: args.parts,
			attachments: args.attachments,
		});

		return message;
	},
})

export const getMessagesByChatId = query({
	args: {
		chatId: v.id("chat"),
	},
	handler: async (ctx, args) => {
		const messages = await ctx.db.query("messages").withIndex("by_chatId_createdAt", (q) => q.eq("chatId", args.chatId)).collect();
		return messages;
	},
})

export const getMessageById = query({
	args: {
		id: v.id("messages"),
	},
	handler: async (ctx, args) => {
		const message = await ctx.db.get(args.id);
		return message;
	},
})

export const deleteTrailingMessages = mutation({
	args: {
		messageId: v.id("messages"),
	},
	handler: async (ctx, args) => {
		const message = await ctx.db.get(args.messageId);

		if (!message) {
			throw new Error("Message not found");
		}

		const messagesToDelete = await ctx.db
			.query("messages")
			.withIndex("by_chatId_createdAt", (q) => q.eq("chatId", message.chatId))
			.filter((q) => q.gt(q.field("_creationTime"), message._creationTime))
			.collect();

		for (const message of messagesToDelete) {
			await ctx.db.delete(message._id);
		}
	},
})
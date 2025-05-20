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
			.withIndex("by_uuid", (q) => q.eq("chatId", args.chatId))
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

export const getChatsByUserId = query({
	args: {
		userId: v.id("user"),
		limit: v.number(),
		startingAfterId: v.optional(v.id("chat")),
		endingBeforeId: v.optional(v.id("chat")),
	},
	handler: async (ctx, args) => {
		const { userId, limit, startingAfterId, endingBeforeId } = args;
		const extendedLimit = limit + 1;

		let query = ctx.db
			.query("chat")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.order("desc"); // Orders by _creationTime descending

		if (startingAfterId) {
			const startingChat = await ctx.db.get(startingAfterId);
			if (!startingChat) {
				throw new Error(
					`Chat with id ${startingAfterId} not found for 'startingAfterId' cursor.`,
				);
			}
			query = query.filter((q) =>
				q.gt(q.field("_creationTime"), startingChat._creationTime),
			);
		} else if (endingBeforeId) {
			const endingChat = await ctx.db.get(endingBeforeId);
			if (!endingChat) {
				throw new Error(
					`Chat with id ${endingBeforeId} not found for 'endingBeforeId' cursor.`,
				);
			}
			query = query.filter((q) =>
				q.lt(q.field("_creationTime"), endingChat._creationTime),
			);
		}

		// const fetchedChats = await query.limit(extendedLimit).collect();
		const paginationResult = await query.paginate({ numItems: extendedLimit, cursor: null });
		const fetchedChats = paginationResult.page;

		const hasMore = fetchedChats.length > limit;
		const chatsToReturn = hasMore
			? fetchedChats.slice(0, limit)
			: fetchedChats;

		return {
			chats: chatsToReturn,
			hasMore,
		};
	},
});
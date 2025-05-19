import { appendClientMessage, appendResponseMessages, streamText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { z } from "zod";
import { getSession } from "@/lib/auth-client";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { geolocation } from "@vercel/functions";
import { RequestHints, systemPrompt } from "@/lib/ai/prompt";
import { generateUUID, getTrailingMessageId } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { Session, User } from "better-auth/types";

export const maxDuration = 30;

const lmstudio = createOpenAICompatible({
	name: "lmstudio",
	baseURL: process.env.LMSTUDIO_BASE_URL!,
})

export async function POST(req: Request) {
	const { id, message } = await req.json();

	const session = await auth.api.getSession({
		headers: req.headers,
	}) as { session: Session, user: User };

	console.log({ session })

	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	const chat = await fetchQuery(api.chat.getChatByUuid, {
		chatId: id,
	})

	let newChatId: unknown;
	if (!chat) {
		const title = message.parts.at(0)?.text ?? "New chat";

		newChatId = await fetchMutation(api.chat.createChat, {
			userId: session.user?.id as Id<"user">,
			chatId: id,
			title,
		})
	}

	const previousMessages = await fetchQuery(api.message.getMessagesByChatId, {
		chatId: (newChatId || chat?._id) as Id<"chat">,
	});

	const messages = appendClientMessage({
		// @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
		messages: previousMessages,
		message,
	});


	const { longitude, latitude, city, country } = geolocation(req);

	const requestHints: RequestHints = {
		longitude,
		latitude,
		city,
		country,
	};

	await fetchMutation(api.message.saveMessages, {
		messages: [
			{
				chatId: (newChatId || chat?._id) as Id<"chat">,
				role: 'user',
				parts: message.parts,
				attachments: [],
			},
		],
	});

	const result = streamText({
		model: lmstudio(process.env.LMSTUDIO_MODEL!),
		system: systemPrompt({
			selectedChatModel: 'chat-model-reasoning',
			requestHints,
		}),
		messages,
		maxSteps: 5,
		tools: {
			getWeather: {
				description: "Get the weather in a given location",
				parameters: z.object({
					location: z.string(),
				}),
				execute: async ({ location }) => {
					console.log("getWeather", location);
					return {
						type: "text",
						text: `The weather in ${location} is sunny`,
					}
				},
			},
		},
		onFinish: async ({ response }) => {
			if (session.user?.id) {
				try {
					const assistantId = getTrailingMessageId({
						messages: response.messages.filter(
							(message) => message.role === 'assistant',
						),
					});

					if (!assistantId) {
						throw new Error('No assistant message found!');
					}

					const [, assistantMessage] = appendResponseMessages({
						messages: [message],
						responseMessages: response.messages,
					});

					await fetchMutation(api.message.saveMessages, {
						messages: [
							{
								chatId: (newChatId || chat?._id) as Id<"chat">,
								role: assistantMessage?.role!,
								parts: assistantMessage?.parts,
								attachments:
									assistantMessage?.experimental_attachments ?? [],
							},
						],
					});
				} catch (err) {
					console.error('Failed to save chat', err);
				}
			}
		}
	})

	return result.toDataStreamResponse();
}
import { streamText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { z } from "zod";

export const maxDuration = 30;

const lmstudio = createOpenAICompatible({
	name: "lmstudio",
	baseURL: process.env.LMSTUDIO_BASE_URL!,
})

export async function POST(req: Request) {
	const { messages } = await req.json();

	const result = streamText({
		model: lmstudio(process.env.LMSTUDIO_MODEL!),
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
		}
	})

	return result.toDataStreamResponse();
}
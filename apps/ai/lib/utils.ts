import { CoreAssistantMessage } from "ai";
import { CoreToolMessage } from "ai";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function generateUUID(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export function sanitizeText(text: string) {
	return text.replace('<has_function_call>', '');
}

export const fetcher = async (url: string) => {
	const response = await fetch(url);

	if (!response.ok) {
		const { code, cause } = await response.json();
		// throw new ChatSDKError(code as ErrorCode, cause);
		throw new Error(cause);
	}

	return response.json();
};


type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export function getTrailingMessageId({
	messages,
}: {
	messages: Array<ResponseMessage>;
}): string | null {
	const trailingMessage = messages.at(-1);

	if (!trailingMessage) return null;

	return trailingMessage.id;
}

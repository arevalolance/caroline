"use client";

import { generateUUID } from '@/lib/utils';
import { useChat } from '@ai-sdk/react';
import { UIMessage } from 'ai';
import { Session } from 'better-auth/types';
import { toast } from 'sonner';
import { Messages } from './messages';
import { Textarea } from '@workspace/ui/components/textarea';
import { ArrowUp } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { VisibilityType } from './visibility-selector';
import { useSWRConfig } from 'swr';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from './sidebar-history';

export default function Chat({
	id,
	initialMessages,
	initialChatModel,
	initialVisibilityType,
	isReadonly,
	session,
	autoResume,
}: {
	id: string;
	initialMessages: Array<UIMessage>;
	initialChatModel: string;
	initialVisibilityType: VisibilityType;
	isReadonly: boolean;
	session: Session;
	autoResume: boolean;
}) {
	const { mutate } = useSWRConfig();

	const { visibilityType } = useChatVisibility({
		chatId: id,
		initialVisibilityType,
	});

	const { messages, input, status, handleInputChange, handleSubmit, setMessages, reload, append } = useChat({
		id,
		initialMessages,
		experimental_throttle: 100,
		sendExtraMessageFields: true,
		onFinish: () => {
			mutate(unstable_serialize(getChatHistoryPaginationKey));
		  },
		generateId: generateUUID,
		experimental_prepareRequestBody: (body) => ({
			id,
			uuid: id,
			message: body.messages.at(-1),
		}),
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return (
		<div className="flex flex-col min-w-0 h-[calc(100dvh-100px)] bg-background">
			<Messages
				chatId={id}
				status={status}
				messages={messages}
				setMessages={setMessages}
				reload={reload}
				isReadonly={isReadonly}
				isArtifactVisible={false}
				append={append}
				visibilityType={visibilityType}
			/>

			<div className="flex flex-1 w-full md:max-w-3xl mx-auto">
				<form className="bg-background fixed bottom-2 w-full items-stretch gap-2 rounded-t-xl border border-b-0 border-slate/30 px-3 py-3 text-secondary-foreground max-sm:pb-6 sm:max-w-3xl" onSubmit={handleSubmit}>
					<Textarea
						className="resize-none h-18 border-none shadow-none active:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
						value={input}
						placeholder="Say something..."
						onChange={handleInputChange}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								handleSubmit(e as any);
							}
						}}
					/>
					<div className="flex items-center justify-end">
						<Button size="icon" type="submit" disabled={!input.trim()}>
							<ArrowUp />
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
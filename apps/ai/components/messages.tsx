import type { UIMessage } from 'ai';
import { memo } from 'react';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
// import { ThinkingMessage } from './message';
import { PreviewMessage } from './message';
import { Greeting } from './greeting';
import { useMessages } from '@/hooks/use-messages';
import { VisibilityType } from './visibility-selector';

interface MessagesProps {
	chatId: string;
	status: UseChatHelpers['status'];
	// votes: Array<Vote> | undefined;
	messages: Array<UIMessage>;
	setMessages: UseChatHelpers['setMessages'];
	reload: UseChatHelpers['reload'];
	isReadonly: boolean;
	isArtifactVisible: boolean;
	append: UseChatHelpers['append'];
	visibilityType: VisibilityType;
}

function PureMessages({
	chatId,
	status,
	// votes,
	messages,
	setMessages,
	reload,
	isReadonly,
	append,
	visibilityType,
}: MessagesProps) {
	const {
		containerRef: messagesContainerRef,
		endRef: messagesEndRef,
		onViewportEnter,
		onViewportLeave,
		hasSentMessage,
	} = useMessages({
		chatId,
		status,
	});

	return (
		<div
			ref={messagesContainerRef}
			className="flex flex-col min-w-0 gap-6 flex-1 pt-4 relative"
		>
			{messages.length === 0 && <Greeting
				messages={messages}
				append={append}
				id={chatId}
				visibilityType={visibilityType}
			/>}

			{messages.map((message, index) => (
				<PreviewMessage
					key={message.id}
					chatId={chatId}
					message={message}
					isLoading={status === 'streaming' && messages.length - 1 === index}
					setMessages={setMessages}
					reload={reload}
					isReadonly={isReadonly}
					requiresScrollPadding={
						hasSentMessage && index === messages.length - 1
					}
				/>
			))}

			{/* {status === 'submitted' &&
				messages.length > 0 &&
				messages[messages.length - 1]?.role === 'user' && <ThinkingMessage />} */}

			<div
				ref={messagesEndRef}
				className="shrink-0 min-w-[24px] min-h-[24px]"
			/>
		</div>
	);
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
	if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) return true;

	if (prevProps.status !== nextProps.status) return false;
	if (prevProps.status && nextProps.status) return false;
	if (prevProps.messages.length !== nextProps.messages.length) return false;
	if (!equal(prevProps.messages, nextProps.messages)) return false;
	// if (!equal(prevProps.votes, nextProps.votes)) return false;

	return true;
});
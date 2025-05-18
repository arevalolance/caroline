'use client';

import type { UIMessage } from 'ai';
import { AnimatePresence, motion } from 'motion/react';
import { memo, useState } from 'react';
import equal from 'fast-deep-equal';
import { cn, sanitizeText } from '@/lib/utils'; // Assuming sanitizeText is robust
import { Button } from '@workspace/ui/components/button';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import type { UseChatHelpers } from '@ai-sdk/react';
import { Pencil, SparklesIcon, MessageSquareText } from 'lucide-react'; // Added MessageSquareText for think block
import { Markdown } from './markdown';
import { MessageEditor } from './message-editor';
import { MessageActions } from './message-actions';

const PurePreviewMessage = ({
	chatId,
	message,
	isLoading,
	setMessages,
	reload,
	isReadonly,
	requiresScrollPadding,
}: {
	chatId: string;
	message: UIMessage;
	isLoading: boolean;
	setMessages: UseChatHelpers['setMessages'];
	reload: UseChatHelpers['reload'];
	isReadonly: boolean;
	requiresScrollPadding: boolean;
}) => {
	const [mode, setMode] = useState<'view' | 'edit'>('view');
	const [showThinkBlock, setShowThinkBlock] = useState(false); // Optional: for collapsibility

	return (
		<AnimatePresence>
			<motion.div
				data-testid={`message-${message.role}`}
				className="w-full mx-auto max-w-3xl px-4 group/message"
				initial={{ y: 5, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				data-role={message.role}
			>
				<div
					className={cn(
						'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
						{
							'w-full': mode === 'edit',
							'group-data-[role=user]/message:w-fit': mode !== 'edit',
						},
					)}
				>
					{message.role === 'assistant' && (
						<div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
							<div className="translate-y-px">
								<SparklesIcon size={14} />
							</div>
						</div>
					)}

					<div
						className={cn('flex flex-col gap-4 w-full', { // Reduced gap for tighter think/message block
							'min-h-96':
								message.role === 'assistant' && requiresScrollPadding,
						})}
					>
						{message.parts?.map((part, index) => {
							const { type } = part;
							const key = `message-${message.id}-part-${index}`;

							if (type === 'text') {
								if (mode === 'view') {
									const textContent = part.text;
									// Regex to capture think content and the rest of the message
									// It captures content within <think>...</think> (non-greedy)
									// and then captures everything after the </think> tag.
									const thinkRegex = /<think>([\s\S]*?)<\/think>\s*([\s\S]*)/;
									const match = textContent.match(thinkRegex);

									let thinkBlockContent: string | null = null;
									let actualMessageContent: string = textContent;

									if (match && match[1] && match[2] !== undefined) {
										thinkBlockContent = match[1].trim();
										actualMessageContent = match[2].trim();
									} else if (match && match[1]) {
										// Case where there might be only a think block and no subsequent message
										thinkBlockContent = match[1].trim();
										actualMessageContent = ""; // Or handle as an error/empty message
									}


									return (
										<div key={key} className="flex flex-col items-start"> {/* Changed to flex-col for think block */}
											{message.role === 'user' && !isReadonly && (
												<div className="self-start mb-1"> {/* Position edit button */}
													<Tooltip>
														<TooltipTrigger asChild>
															<Button
																data-testid="message-edit-button"
																variant="ghost"
																className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
																onClick={() => {
																	setMode('edit');
																}}
															>
																<Pencil size={14} />
															</Button>
														</TooltipTrigger>
														<TooltipContent>Edit message</TooltipContent>
													</Tooltip>
												</div>
											)}

											{/* Render Think Block if present - used for models that support <think>...</think> tags (qwen3-0.6b:2) */}
											{thinkBlockContent && message.role === 'assistant' && (
												<div className="w-full mb-2">
													<Button
														variant="outline"
														size="sm"
														className="w-full justify-start text-xs text-muted-foreground h-auto py-1.5 px-2"
														onClick={() => setShowThinkBlock(!showThinkBlock)}
													>
														<MessageSquareText size={14} className="mr-2" />
														{showThinkBlock ? 'Hide Thoughts' : 'Show Thoughts'}
													</Button>
													{showThinkBlock && (
														<div
															data-testid="message-think-block"
															className="mt-1 p-2 bg-secondary/30 border border-border rounded-md text-sm text-secondary-foreground"
														>
															<pre className="whitespace-pre-wrap font-sans text-xs">
																{sanitizeText(thinkBlockContent)}
															</pre>
														</div>
													)}
												</div>
											)}

											{/* Render Actual Message Content */}
											{actualMessageContent && (
												<div
													data-testid="message-content"
													className={cn('flex flex-col gap-4', { // This div now only wraps the markdown
														'bg-primary text-primary-foreground px-3 py-2 rounded-xl':
															message.role === 'user',
														'w-full': message.role === 'assistant', // Ensure assistant messages take full width available
													})}
												>
													<Markdown>{sanitizeText(actualMessageContent)}</Markdown>
												</div>
											)}
										</div>
									);
								}

								if (mode === 'edit') {
									// When editing, you likely want to edit the original full text,
									// or decide if you want to allow editing only the 'actualMessageContent'.
									// For simplicity, this example keeps editing the full original message part.
									return (
										<div key={key} className="flex flex-row gap-2 items-start">
											<div className="size-8 shrink-0" /> {/* Spacer for assistant icon */}
											<MessageEditor
												key={message.id}
												message={{ ...message, content: part.text }} // Pass the full text for editing
												setMode={setMode}
												setMessages={setMessages}
												reload={reload}
											/>
										</div>
									);
								}
							}

							if (type === 'tool-invocation') {
								// ... your existing tool-invocation rendering logic ...
								const { toolInvocation } = part;
								const { toolName, toolCallId, state } = toolInvocation;

								if (state === 'call') {
									// const { args } = toolInvocation; // args might not be used here
									return (
										<div
											key={toolCallId}
											className={cn('text-xs text-muted-foreground p-2 border rounded-md bg-muted/50', {
												// skeleton: ['getWeather'].includes(toolName), // Example, adjust as needed
											})}
										>
											Tool call: <code>{toolName}</code>
											{/* You might want to show args here if needed */}
										</div>
									);
								}

								if (state === 'result') {
									const { result } = toolInvocation;
									return (
										<div key={toolCallId} className="text-xs p-2 border rounded-md bg-muted/50">
											<p className="font-medium">Tool result: <code>{toolName}</code></p>
											<pre className="whitespace-pre-wrap text-muted-foreground">
												{JSON.stringify(result, null, 2)}
											</pre>
										</div>
									);
								}
							}
							return null; // Fallback for unhandled part types
						})}

						{!isReadonly && (
							<MessageActions
								key={`action-${message.id}`}
								chatId={chatId}
								message={message}
								isLoading={isLoading}
							/>
						)}
					</div>
				</div>
			</motion.div>
		</AnimatePresence>
	);
};

export const PreviewMessage = memo(
	PurePreviewMessage,
	(prevProps, nextProps) => {
		if (prevProps.isLoading !== nextProps.isLoading) return false;
		if (prevProps.message.id !== nextProps.message.id) return false;
		if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding)
			return false;
		// Consider if showThinkBlock state changes should affect memoization,
		// but since it's internal state, it shouldn't directly.
		// The parts content itself is the primary driver.
		if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;

		return true;
	},
);

// // ThinkingMessage remains for the general loading state
// export const ThinkingMessage = () => {
// 	// ... (your existing ThinkingMessage component)
// };

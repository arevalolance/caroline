"use client";

import { useChat } from '@ai-sdk/react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { useSession } from '@/lib/auth-client';
import Chat from '@/components/chat';
import { Attachment, UIMessage } from 'ai';

export default function ChatPage() {
	const { id } = useParams<{ id: string }>();
	const sessionHookData = useSession();
	const router = useRouter();

	// Handle session loading state
	if (sessionHookData.isPending) {
		return <div>Loading...</div>;
	}

	// If no session data, redirect to sign in
	if (!sessionHookData.data) {
		router.push('/auth/sign-in');
		return null;
	}

	const { user, session } = sessionHookData.data;

	const chat = useQuery(api.chat.getChatById, { id: id as Id<"chat"> });

	if (!chat) {
		return notFound();
	}

	if (!session) {
		return notFound();
	}

	if (chat.visibility === 'private') {
		if (user?.id !== chat.userId) {
			return notFound();
		}
	}

	const messagesFromDb = useQuery(api.message.getMessagesByChatId, { chatId: id as Id<"chat"> });

	function convertToUIMessages(messages: Array<Doc<"messages">>): Array<UIMessage> {
		return messages.map((message) => ({
			id: message._id,
			parts: message.parts as UIMessage['parts'],
			role: message.role as UIMessage['role'],
			content: '',
			createdAt: new Date(message._creationTime),
			experimental_attachments:
				(message.attachments as Array<Attachment>) ?? [],
		}));
	}

	return (
		<Chat
			id={id}
			initialMessages={convertToUIMessages(messagesFromDb ?? [])}
			initialChatModel={""}
			initialVisibilityType={chat.visibility}
			isReadonly={user?.id !== chat.userId}
			session={session}
			autoResume={true}
		/>
	);
}
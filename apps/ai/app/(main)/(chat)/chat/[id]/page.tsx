import { notFound, redirect } from 'next/navigation';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { getSession } from '@/lib/auth-client';
import Chat from '@/components/chat';
import { Attachment, UIMessage } from 'ai';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Session, User } from 'better-auth/types';

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const sessionHookData = await auth.api.getSession({
		headers: await headers()
	}) as { session: Session, user: User };

	if (!sessionHookData) {
		return (<div>no auth</div>);
	}

	const { session, user } = sessionHookData;

	console.log({ id })
	const chat = await fetchQuery(api.chat.getChatByUuid, { chatId: id });

	if (!chat) {
		return notFound();
	}

	if (chat.visibility === 'private') {
		if (user?.id !== chat.userId) {
			return notFound();
		}
	}

	const messagesFromDb = await fetchQuery(api.message.getMessagesByChatId, { chatId: chat?._id as Id<"chat"> });


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
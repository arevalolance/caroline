import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { User } from 'better-auth';
import { Session } from 'better-auth';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;

    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const startingAfter = searchParams.get('starting_after');
    const endingBefore = searchParams.get('ending_before');

    if (startingAfter && endingBefore) {
        return new Response("Only one of starting_after or ending_before can be provided.", { status: 400 });
    }

    const session = await auth.api.getSession({
        headers: request.headers,
    }) as { session: Session, user: User };

    if (!session?.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const chats = await fetchQuery(api.chat.getChatsByUserId, {
        userId: session.user.id as Id<"user">,
        limit,
        startingAfterId: startingAfter ? (startingAfter as Id<"chat">) : undefined,
        endingBeforeId: endingBefore ? (endingBefore as Id<"chat">) : undefined,
    });

    return Response.json(chats);
}
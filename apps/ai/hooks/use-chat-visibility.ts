'use client';

import { useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { unstable_serialize } from 'swr/infinite';
import {
    getChatHistoryPaginationKey,
    type ChatHistory,
} from '@/components/sidebar-history';
import type { VisibilityType } from '@/components/visibility-selector';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export function useChatVisibility({
    chatId,
    initialVisibilityType,
}: {
    chatId: string;
    initialVisibilityType: VisibilityType;
}) {
    const { mutate, cache } = useSWRConfig();
    const history: ChatHistory = cache.get('/api/history')?.data;
    const updateChatVisibility = useMutation(api.chat.updateChatVisibility);

    const { data: localVisibility, mutate: setLocalVisibility } = useSWR(
        `${chatId}-visibility`,
        null,
        {
            fallbackData: initialVisibilityType,
        },
    );

    const visibilityType = useMemo(() => {
        if (!history) return localVisibility;
        const chat = history.chats.find((chat) => chat.document._id === chatId);
        if (!chat) return 'private';
        return chat.document.visibility;
    }, [history, chatId, localVisibility]);

    const setVisibilityType = (updatedVisibilityType: VisibilityType) => {
        setLocalVisibility(updatedVisibilityType);
        mutate(unstable_serialize(getChatHistoryPaginationKey));

        updateChatVisibility({
            id: chatId as Id<"chat">,
            visibility: updatedVisibilityType,
        });
    };

    return { visibilityType, setVisibilityType };
}
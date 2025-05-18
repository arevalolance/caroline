import { UIMessage } from 'ai';
import { motion } from 'motion/react';
import { VisibilityType } from './visibility-selector';
import { SuggestedActions } from './suggested-actions';
import { UseChatHelpers } from '@ai-sdk/react';

export const Greeting = ({
    messages,
    append,
    id,
    visibilityType,
}: {
    messages: UIMessage[];
    append: UseChatHelpers['append'];
    id: string;
    visibilityType: VisibilityType;
}) => {
    return (
        <div
            key="overview"
            className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col justify-center"
        >
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-semibold"
            >
                Hello there!
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.6 }}
                className="text-2xl text-zinc-500"
            >
                How can I help you today?
            </motion.div>


            {messages.length === 0 &&
                // attachments.length === 0 &&
                // uploadQueue.length === 0 && (
                (
                <div className='mt-4'>
                    <SuggestedActions
                        append={append}
                        chatId={id}
                        selectedVisibilityType={visibilityType}
                    />
                </div>
                )}
        </div>
    );
};
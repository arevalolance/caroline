import Chat from "@/components/chat";
import { auth } from "@/lib/auth";
import { generateUUID } from "@/lib/utils";
import { Session } from "better-auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export default async function ChatPage() {
    const id = generateUUID();
    const authData = await auth.api.getSession({
        headers: await headers()
    });

    if (!authData?.session) {
        return notFound();
    }

    return (
        <Chat
            key={id}
            id={id}
            initialMessages={[]}
            initialChatModel={""}
            initialVisibilityType="private"
            isReadonly={false}
            session={authData.session as Session}
            autoResume={false}
        />
    )
}
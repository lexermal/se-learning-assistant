import React from "react";
import { usePlugin } from "shared-components";

interface Message {
    role: string;
    content: string;
    id: string | number;
    toolInvocations?: any[];
}

export function useChat() {
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const { getAIResponseStream } = usePlugin();

    const append = (appendMessages: Message[]) => {
        getAIResponseStream([...messages, ...appendMessages], (id, message, finished: boolean) => {
            const lastMessage = messages[messages.length - 1];
            setIsLoading(!finished);

            if (lastMessage?.id === id) {
                lastMessage.content = message;
                setMessages([...messages, lastMessage]);
            } else {
                setMessages([...messages, ...appendMessages, { id, role: 'assistant', content: message }]);
            }
        }
        );
    };

    return { messages, append, isLoading, setMessages, lastMessage: messages[messages.length - 1] as Message | undefined };
}

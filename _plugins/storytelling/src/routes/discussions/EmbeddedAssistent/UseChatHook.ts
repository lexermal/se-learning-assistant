import React from "react";
import { usePlugin } from "shared-components";

export function useChat() {
    const [messages, setMessages] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const { getAIResponseStream } = usePlugin();

    const append = (appendMessages: { role: string, content: string }[]) => {
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

    return { messages, append, isLoading, setMessages };
}

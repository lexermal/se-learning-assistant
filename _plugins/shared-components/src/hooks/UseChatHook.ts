import React from "react";
import { ToolInvocation, Tool } from "../utils/plugin/PluginController";
import { usePlugin } from "../utils/plugin/providers/PluginProvider";

export interface Message {
    role: string;
    content: string;
    id: string | number;
    toolInvocations?: ToolInvocation[];
}

export function useChat(tools?: Tool[]) {
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const { getAIResponseStream } = usePlugin();

    const append = (appendMessages: Message[]) => {
        getAIResponseStream([...messages, ...appendMessages], (id, message, finished: boolean, toolInvocations?: ToolInvocation[]) => {
            const lastMessage = messages[messages.length - 1];
            setIsLoading(!finished);

            if (lastMessage?.id === id) {
                lastMessage.content = message;
                setMessages([...messages, lastMessage]);
            } else {
                setMessages([...messages, ...appendMessages, { id, role: 'assistant', content: message, toolInvocations }]);
            }
        }, tools);
    };

    return { messages, append, isLoading, setMessages, lastMessage: messages[messages.length - 1] as Message | undefined };
}

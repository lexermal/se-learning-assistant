import React, { useEffect } from 'react';
import CircleAudioAvatar from './EmbeddedAssistent/CircleAudioAvatar';
import AudioInputField from './EmbeddedAssistent/AudioInputField';
// import { useChat } from 'ai/react';
import MessageSender from './EmbeddedAssistent/TTS/MessageSender';
import { VoiceId } from './EmbeddedAssistent/TTS/TTS';
// import { useEnv } from '@/providers/EnvProvider';
// import EmitterSingleton from '@/utils/Emitter';
import Markdown from 'react-markdown';
import { usePlugin } from 'shared-components';

// const emitter = EmitterSingleton;
const kickedOffConversation = false;

interface FirstMessages {
    instructions?: string;
    userMessage: string;
    assistantMessage?: string;
}

interface Props {
    voiceId: VoiceId;
    endpoint: string;
    body?: any;
    avatarImageUrl: string;
    onComplete: (result: any) => void;
    autoStartConversation?: FirstMessages;
}

const sender = new MessageSender();

function Assistentv2({ avatarImageUrl, voiceId, onComplete, body, endpoint, autoStartConversation }: Props) {
    sender.setVoiceId(voiceId);
    // sender.setElevenLabsApiKey(useEnv().ELEVENLABS_API_KEY);
    const [oralCommunication, setOralCommunication] = React.useState(true);
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

    // const { messages, append, isLoading, setMessages } = useChat({
    //     // maxToolRoundtrips: 5,
    //     api: endpoint,
    //     body
    // });

    const lastAssistantMessage = [...messages].filter((m) => m.role === 'assistant').pop()?.content;
    console.log("messages", messages);

    useEffect(() => {
        if (!autoStartConversation) {
            return;
        }

        setMessages(getFirstMessages(autoStartConversation));
        append([{ role: 'user', content: autoStartConversation.userMessage }]);

        if (autoStartConversation.assistantMessage && !kickedOffConversation) {
            sender.steamFullMessage(autoStartConversation.assistantMessage);
        }
    }, []);

    useEffect(() => {
        let message = lastAssistantMessage;
        if (message != messages[messages.length - 1]?.content) {
            message = undefined;
        }
        sender.streamOngoingMessage(isLoading, message);
    }, [messages, isLoading]);

    const lastMessage = messages[messages.length - 1];

    useEffect(() => {
        const toolInvocations = lastMessage?.toolInvocations;
        if (toolInvocations) {
            onComplete(toolInvocations[0].args);
        }
    }, [lastMessage]);

    // if (lastMessage?.toolInvocations) {
    //     const args = lastMessage.toolInvocations[0].args;

    //     const success = args.explanationUnderstood === "TRUE" || args.studentKnowsTopic === "TRUE";

    //     return <div className="px-5 pt-5 overflow-y-auto text-center" style={{ height: "478px" }}>
    //         <h1 className='text-center mt-5 mb-5'>
    //             {success ? "Great job!" : "You failed"}
    //         </h1>
    //         <p>{args.improvementHints}</p>
    //     </div>
    // }

    return (
        <div>
            {oralCommunication && <CircleAudioAvatar imageUrl={avatarImageUrl} className='mx-auto my-16' />}
            <div className="w-full">
                {lastAssistantMessage && <div className="text-gray-700 px-5 pt-5 overflow-y-auto remirror-theme" style={{ height: "4k78px" }}>
                    <Markdown>{lastAssistantMessage}</Markdown>
                </div>}
            </div>
            <AudioInputField
                onSubmit={message => {
                    append([{ role: 'user', content: message }]);
                    // EmitterSingleton.emit("analytics-event", {
                    //     category: "opposition",
                    //     action: "send-message: " + message,
                    // });
                }}
                onAudioControl={voice => {
                    setOralCommunication(voice);
                    sender.setVoiceEnabled(voice);
                    // emitter.emit('enableAudio', voice);
                    // EmitterSingleton.emit("analytics-event", {
                    //     category: "opposition",
                    //     action: "turn-audio-on: " + voice,
                    // });
                }} />
        </div>
    );
};

function getFirstMessages(instructions: FirstMessages): any[] {
    const messages = [];

    if (instructions.instructions) {
        messages.push({ id: '1', role: 'system', content: instructions.instructions });
    }
    if (instructions.userMessage) {
        messages.push({ id: '2', role: 'user', content: instructions.userMessage });
    }
    if (instructions.assistantMessage) {
        messages.push({ id: '3', role: 'assistant', content: instructions.assistantMessage });
    }

    console.log("getFirstMessages", messages);

    return messages;
}

export default Assistentv2;
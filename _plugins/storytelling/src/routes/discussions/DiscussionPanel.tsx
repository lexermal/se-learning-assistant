import { useEffect, useMemo } from 'react';
import CircleAudioAvatar from './EmbeddedAssistent/CircleAudioAvatar';
import MessageSender from './EmbeddedAssistent/TTS/MessageSender';
import { usePlugin, EmitterSingleton, Tool } from 'shared-components';
import VoiceRecorder from './EmbeddedAssistent/VoiceRecoder';
import { useChat } from './EmbeddedAssistent/UseChatHook';

interface Props {
    task: string;
    voiceId: any;
    avatarImageUrl: string;
    agentInstructions: string;
    agentTools: Tool[];
    onComplete: (result: Record<string, string>) => void;
}

function DiscussionPanel({ avatarImageUrl, voiceId, onComplete, task, agentInstructions, agentTools }: Props) {
    const { getVoiceResponse } = usePlugin();
    const sender = useMemo(() => new MessageSender(getVoiceResponse, voiceId), []);
    const { messages, append, isLoading, lastMessage, setMessages } = useChat(agentTools);

    useEffect(() => {
        console.log("messages", messages);
    }, [messages]);

    useEffect(() => {
        sender.setOnLoudnessChange((value: number) => EmitterSingleton.emit('loudness', value));
        setMessages([{ role: 'system', content: agentInstructions, id: 0 }]);
    }, []);

    useEffect(() => {
        if (lastMessage?.role === 'assistant') {
            sender.handleNewText(lastMessage.content, isLoading);
        }
    }, [lastMessage, isLoading]);

    const invocation = lastMessage?.toolInvocations?.[0];

    useEffect(() => {
        invocation && onComplete(invocation.args);
    }, [lastMessage]);

    if (invocation) {
        const args = invocation.args;

        return <div className="px-5 pt-5 overflow-y-auto text-center" style={{ height: "478px" }}>
            <h1 className='text-center mt-5 mb-5'>
                {args.understoodTask === "TRUE" ? "Great job!" : "Try again!"}
            </h1>
            <p className='mt-4 text-lg font-bold'>🎉{args.positiveFeedback}🎉</p>
            <p className='mt-4 text-md font-bold'>💡{args.improvementHints}💡</p>
            <p className='mt-4'>Recommended words to learn: {args.vocabularyToLearn}</p>
        </div>
    }

    return (
        <div className='pb-8'>
            <p className="text-center mt-5 w-3/4 mx-auto rounded-lg text-gray-100">
                {task}
            </p>
            <CircleAudioAvatar imageUrl={avatarImageUrl} width={"250px"} className='mx-auto' />
            <div className='w-16 h-16 flex text-4xl shadow-lg flex-row justify-center items-center rounded-full mx-auto bg-gray-800'>
                <VoiceRecorder className='w-7' iconSize='300' onVoiceRecorded={(message) => {
                    append([{ role: 'user', content: "Message("+Math.floor((messages.length+1)/2)+"): "+message, id: messages.length }]);
                }} />
            </div>
        </div>
    );
};

export default DiscussionPanel;

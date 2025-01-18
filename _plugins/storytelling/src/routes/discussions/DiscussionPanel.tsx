import { useEffect, useMemo } from 'react';
import CircleAudioAvatar from './EmbeddedAssistent/CircleAudioAvatar';
import MessageSender from './EmbeddedAssistent/TTS/MessageSender';
import { usePlugin, EmitterSingleton } from 'shared-components';
import VoiceRecorder from './EmbeddedAssistent/VoiceRecoder';
import { useChat } from './EmbeddedAssistent/UseChatHook';

interface Props {
    task: string;
    voiceId: any;
    avatarImageUrl: string;
    onComplete: (result: any) => void;
}

function DiscussionPanel({ avatarImageUrl, voiceId, onComplete, task }: Props) {
    const { getVoiceResponse } = usePlugin();
    const sender = useMemo(() => new MessageSender(getVoiceResponse, voiceId), []);
    const { messages, append, isLoading, lastMessage } = useChat();

    useEffect(() => {
        sender.setOnLoudnessChange((value: number) => EmitterSingleton.emit('loudness', value));
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

        const success = args.explanationUnderstood === "TRUE" || args.studentKnowsTopic === "TRUE";

        return <div className="px-5 pt-5 overflow-y-auto text-center" style={{ height: "478px" }}>
            <h1 className='text-center mt-5 mb-5'>
                {success ? "Great job!" : "You failed"}
            </h1>
            <p>{args.improvementHints}</p>
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
                    append([{ role: 'user', content: message, id: messages.length }]);
                }} />
            </div>
        </div>
    );
};

export default DiscussionPanel;

import React, { useState } from 'react';
import { BiSolidRightArrow } from "react-icons/bi";
import { HiMiniSpeakerXMark, HiMiniSpeakerWave } from "react-icons/hi2";
// import EmitterSingleton from '@/utils/Emitter';
import VoiceRecorder from './VoiceRecoder';

interface AudioInputFieldProps {
    onSubmit: (text: string) => void;
    onAudioControl?: (voice: boolean) => void;
}

const AudioInputField: React.FC<AudioInputFieldProps> = ({ onSubmit, onAudioControl }) => {
    const [text, setText] = useState('');
    const [audioEnabled, setAudioEnabled] = useState(true);

    const handleSubmit = (manualText?: string) => {
        const sendableText = manualText || text;
        if (sendableText.trim()) {
            onSubmit(sendableText);
            setTimeout(() => {
                setText('');
            }, 100);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            setText(text + '\n');
        } else if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="flex items-center bg-gray-300 pt-2 pb-2 p-2">
            {onAudioControl && <button
                onClick={() => {
                    onAudioControl(!audioEnabled);
                    setAudioEnabled(!audioEnabled);
                }}
                className="cursor-default">
                {audioEnabled ? <HiMiniSpeakerWave className='w-9 h-9 cursor-pointer' /> : <HiMiniSpeakerXMark className='w-9 h-9 cursor-pointer' />}
            </button>}
            <VoiceRecorder onVoiceRecorded={(m: string) => {
                console.log('onVoiceRecorded', m);
                // EmitterSingleton.emit("analytics-event", {
                //     catorgoryy: "voice",
                //     event: "voice-recorded",
                // });
                handleSubmit(m);
            }}
            />
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 border-none rounded-lg p-2"
                placeholder='Type a message...'
            />
            <button onClick={() => handleSubmit()} className="cursor-default">
                <BiSolidRightArrow className='w-9 h-10 cursor-pointer' />
            </button>
        </div>
    );
};

export default AudioInputField;
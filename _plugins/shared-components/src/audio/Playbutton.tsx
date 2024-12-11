import { Spinner } from "flowbite-react";
import React, { useState, useEffect } from 'react';
import { FaPlayCircle, FaStopCircle } from "react-icons/fa";
import { usePlugin } from "../utils/plugin/providers/PluginProvider";

type AudioPlayerProps = {
    text: string;
    voice?: string;
    enableSpeedAdjustment?: boolean;
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ text, voice = 'alloy', enableSpeedAdjustment = false }) => {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [speed, setSpeed] = useState(1.0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { getVoiceResponse } = usePlugin();

    // Function to generate audio from text using API
    const generateAudio = async () => {
        setIsLoading(true);

        const blob = await getVoiceResponse(text, voice);
        setAudioUrl(URL.createObjectURL(blob));
        setIsLoading(false);
    };

    // Effect to play audio when audioUrl changes and play state is true
    useEffect(() => {
        if (!audioUrl || !isPlaying) return;

        const audio = new Audio(audioUrl);
        audio.playbackRate = speed;
        audio.play().then(() => {
            audio.onended = () => setIsPlaying(false);
        });

        return () => {
            audio.pause();
            URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl, isPlaying, speed]);

    const togglePlayback = () => {
        if (!isPlaying && !audioUrl) {
            generateAudio().then(() => setIsPlaying(true));
        } else {
            setIsPlaying((prev) => !prev);
        }
    };

    const speedOptions = [0.8, 0.9, 1.0, 1.1, 1.2, 1.5];

    return (
        <div className="group relative">
            <div className='flex flex-row items-end'>
                <button className="text-gray-500" onClick={togglePlayback} disabled={isLoading}>
                    {isLoading ? <Spinner /> : isPlaying ? <FaStopCircle size={"25px"} /> : <FaPlayCircle size={"25px"} />}
                </button>
                {enableSpeedAdjustment && (
                    <div className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-row text-sm text-gray-500">
                        <span className='pr-1'>Speed: </span>
                        <select
                            value={speed}
                            className='appearance-none cursor-pointer pr-0 p-0 rounded shadow leading-tight focus:outline-none focus:bg-gray-800 focus:ring bg-transparent border-0'
                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            disabled={isLoading}>
                            {speedOptions.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

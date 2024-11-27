import React, { useState, useEffect } from 'react';

type AudioPlayerProps = {
    text: string;
    voice?: string;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text, voice = 'alloy' }) => {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [speed, setSpeed] = useState(1.0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Function to generate audio from text using API
    const generateAudio = async () => {
        setIsLoading(true);
        const response = await fetch('http://localhost:3000/api/speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: text, voice, speed }),
        });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
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

    const speedOptions = [0.5, 0.75, 0.9, 1.0, 1.1, 1.25, 1.5];

    return (
        <div className="group relative">
            <div className='flex flex-row items-end'>
                <button onClick={togglePlayback} disabled={isLoading}>
                    {isLoading ? 'Loading' : isPlaying ? 'Pause' : 'Play'}
                </button>
                <div className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-row text-sm text-gray-400">
                    <span className='pr-1'>Speed: </span>
                    <select
                        value={speed}
                        className='appearance-none cursor-pointer pr-0 rounded shadow leading-tight focus:outline-none focus:ring'
                        onChange={(e) => setSpeed(parseFloat(e.target.value))}
                        disabled={isLoading}>
                        {speedOptions.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;
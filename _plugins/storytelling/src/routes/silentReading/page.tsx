import { useEffect } from 'react';
import { useState } from 'react';
import Markdown from 'react-markdown'
import { AudioPlayer, AudioPlayOptionType, useChat, usePlugin } from '@rimori/client';
import getSilentReadingPrompt from './ReadingPromptProvider';
import { StartScreen } from './StartScreen';
import { FlashcardPluginSettings } from '../settings/SettingsPage';

export default function SilentReading() {
    const [isFinalChapter, setIsFinalChapter] = useState(false);
    const { messages, append, isLoading, lastMessage, setMessages } = useChat();
    const { getSettings } = usePlugin();
    const [readingSpeed, setReadingSpeed] = useState<AudioPlayOptionType | null>(null);

    useEffect(() => {
        getSettings<FlashcardPluginSettings>({ readingSpeed: 1 }).then(settings => {
            setReadingSpeed(settings.readingSpeed);
        });
    }, []);

    useEffect(() => {
        if (messages.length === 0) return;

        if (lastMessage?.role === "assistant" && lastMessage?.content?.includes("Hur det slutar")) {
            setIsFinalChapter(true);
        }
    }, [messages]);

    if (messages.length === 0) {
        return <StartScreen onStart={instructions => {
            append([
                { id: "1", role: 'system', content: getSilentReadingPrompt(instructions) },
                { id: "2", role: 'assistant', content: "Let's start" }
            ]);
        }} />;
    }

    return (
        <div className="flex flex-col w-full max-w-2xl py-8 pb-20 mx-auto stretch pl-1">
            {messages.filter((m, i) => i > 1 && m.role === "assistant").map((m, i, ms) => (
                <Markdown key={m.id} components={{
                    h1: ({ node, ...props }) => (
                        <div className='border-b dark:border-gray-600 mt-8 pb-1 mb-2 flex-row flex flex-wrap items-end'>
                            <h1 className="text-3xl font-bold dark:text-gray-500 min-w-fit mr-1" {...props} />
                            <AudioPlayer hide={isLoading && i === ms.length - 1} text={m.content} initialSpeed={readingSpeed ?? 1} />
                        </div>
                    ),
                    p: ({ node, ...props }) => (
                        <p className="text-lg text-gray-[370] mb-4" {...props} />
                    ),
                }}>{m.content.replace(/\n\n+/g, '\n\n')}</Markdown>
            ))}

            {!isLoading && !isFinalChapter && <button className="p-2 mt-4 bg-blue-500 dark:bg-blue-950 dark:text-gray-300 rounded w-fit px-5"
                onClick={() => append([{ role: 'user', content: "Next chapter", id: (messages.length + 1).toString() }])}
            >Next chapter</button>}

            {!isLoading && isFinalChapter && <button className="p-2 mt-4 bg-blue-500 dark:bg-blue-950 dark:text-gray-300 rounded"
                onClick={() => setMessages([])}
            >New story</button>}
        </div>
    );
}

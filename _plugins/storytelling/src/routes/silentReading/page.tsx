import { useEffect } from 'react';
import { useState } from 'react';
import Markdown from 'react-markdown'
import { AudioPlayer, AudioPlayOptionType, usePlugin } from 'shared-components';
import getSilentReadingPrompt from './ReadingPromptProvider';
import { StartScreen } from './StartScreen';
import { FlashcardPluginSettings } from '../settings/SettingsPage';

export default function SilentReading() {
    const [isFinalChapter, setIsFinalChapter] = useState(false);
    const { getAIResponseStream } = usePlugin();
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { getSettings } = usePlugin();
    const [readingSpeed, setReadingSpeed] = useState<AudioPlayOptionType | null>(null);

    useEffect(() => {
        getSettings<FlashcardPluginSettings>({ readingSpeed: 1 }).then(settings => {
            setReadingSpeed(settings.readingSpeed);
        });
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === "assistant" && lastMessage.content.includes("Hur det slutar")) {
                setIsFinalChapter(true);
            }
        }
    }, [messages]);

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

    if (messages.length === 0) {
        return <StartScreen onStart={instructions => {
            const initMessages = [
                { id: "1", role: 'system', content: getSilentReadingPrompt(instructions) },
                { id: "2", role: 'assistant', content: "Let's start" }
            ];

            append(initMessages);
        }} />;
    }

    return (
        <div className="flex flex-col w-full max-w-xl py-8 pb-20 mx-auto stretch pl-1">
            {messages.filter((m, i) => i > 1 && m.role === "assistant").map((m, i, ms) => (
                <Markdown key={m.id} components={{
                    h1: ({ node, ...props }) => (
                        <div className='border-b dark:border-gray-600 mt-8 pb-1 mb-2 flex-row flex flex-wrap items-end'>
                            <h1 className="text-3xl font-bold dark:text-gray-500 min-w-fit mr-1" {...props} />
                            {!(isLoading && i === ms.length - 1) && <AudioPlayer text={m.content} initialSpeed={readingSpeed ?? 1} />}
                        </div>
                    ),
                    p: ({ node, ...props }) => (
                        <p className="text-lg text-gray-[370] mb-4" {...props} />
                    ),
                }}>{m.content.replace(/\n\n+/g, '\n\n')}</Markdown>
            ))}

            {!isLoading && !isFinalChapter && <button className="p-2 mt-4 bg-blue-500 dark:bg-blue-950 dark:text-gray-300 rounded w-fit px-5"
                onClick={() => append([{ role: 'user', content: "Next chapter" }])}
            >Next chapter</button>}

            {!isLoading && isFinalChapter && <button className="p-2 mt-4 bg-blue-500 dark:bg-blue-950 dark:text-gray-300 rounded"
                onClick={() => setMessages([])}
            >New story</button>}
        </div>
    );
}

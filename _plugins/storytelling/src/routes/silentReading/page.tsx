import { useEffect } from 'react';
import { useState } from 'react';
import Markdown from 'react-markdown'
import { AudioPlayer, usePlugin } from 'shared-components';
import getSilentReadingPrompt, { Instructions } from './ReadingPromptProvider';
import { FaGear } from "react-icons/fa6";

export default function SilentReading() {
    const [isFinalChapter, setIsFinalChapter] = useState(false);
    const { getAIResponseStream } = usePlugin();
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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
        <div className="flex flex-col w-full max-w-xl py-8 mx-auto stretch">
            {messages.filter((m, i) => i > 1 && m.role === "assistant").map((m, i, ms) => (
                <Markdown key={m.id} components={{
                    h1: ({ node, ...props }) => (
                        <div className='border-b bg-gray-300 dark:border-gray-600 mt-8 pb-1 mb-2 flex-row flex items-end'>
                            <h1 className="text-3xl font-bold dark:text-gray-500 min-w-fit mr-1" {...props} />
                            {!(isLoading && i === ms.length - 1) && <AudioPlayer text={m.content} />}
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

function StartScreen(props: { onStart: (i: Instructions) => void }) {
    const [topic, setTopic] = useState("");
    const [length, setLength] = useState<5 | 8 | 15>(5);
    const [difficulty, setDifficulty] = useState(1);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
            <p className="text-4xl text-center mb-8 flex flex-row justify-center items-end group">Storytelling
                <div className="text-xs ml-1 opacity-0 group-hover:opacity-75 cursor-pointer" onClick={() => setIsOpen(!isOpen)}><FaGear /></div>
            </p>
            <textarea
                className="w-full max-w-md p-2 min-h-32 rounded bg-gray-300 dark:bg-gray-800 dark:text-gray-100 border-0"
                placeholder="What should the story be about?"
                onChange={e => setTopic(e.target.value)} />

            <div className="flex flex-col w-full mt-2">
                <div className={"flex flex-col bg-gray-400 dark:bg-gray-800 p-4 rounded mt-2 " + (isOpen ? "" : "hidden")}>
                    <StoryLength length={length} setLength={setLength} />
                    <DifficultySlider difficulty={difficulty} setDifficulty={setDifficulty} />
                </div>
            </div>

            <button className="right-0 p-3 mt-4 bg-blue-500 rounded text-xl"
                onClick={() => props.onStart({ topic, length, difficulty })}
            >Start</button>
        </div>
    );
}

function StoryLength(props: { length: 5 | 8 | 15, setLength: (l: 5 | 8 | 15) => void }) {
    return (
        <div className="flex flex-row text-center items-end w-full opacity-80">
            <p className='text-xl w-1/2 text-left py-1'>Story length</p>
            <div className="flex w-1/2 rounded text-white bg-gray-500 dark:border-gray-600">
                <button className={`py-1 grow px-3 rounded-r-none ${props.length === 5 ? 'bg-gray-600' : ''} rounded`}
                    onClick={() => props.setLength(5)}
                >Short</button>
                <button className={`py-1 px-3 border-x border-gray-600 ${props.length === 8 ? 'bg-gray-600' : ''} `}
                    onClick={() => props.setLength(8)}
                >Normal</button>
                <button className={`py-1 grow px-3 rounded-l-none ${props.length === 15 ? 'bg-gray-600' : ''} rounded`}
                    onClick={() => props.setLength(15)}
                >Long</button>
            </div>
        </div>
    );
}

function DifficultySlider(props: { difficulty: number, setDifficulty: (d: number) => void }) {
    return (
        <div className="flex flex-row items-center mt-4 opacity-80">
            <label className="text-xl w-1/2">Difficulty</label>
            <input
                type="range"
                min="1"
                max="10"
                value={props.difficulty}
                onChange={e => props.setDifficulty(Number(e.target.value))}
                className="w-1/2"
            />
        </div>
    );
}
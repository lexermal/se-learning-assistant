import { useEffect } from 'react';
import { useState } from 'react';
import { useChat } from 'ai/react';
import Markdown from 'react-markdown'

export default function SilentReading() {
    const [isFinalChapter, setIsFinalChapter] = useState(false);
    const { messages, append, setMessages, isLoading } = useChat({
        api: "http://localhost:3000/api/chat/stream",
    });

    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === "assistant" && lastMessage.content.includes("Hur det slutar")) {
                setIsFinalChapter(true);
            }
        }
    }, [messages]);

    if (messages.length === 0) {
        return <StartScreen onStart={topic => {
            setMessages([{ id: "1", role: 'system', content: getPrompt(topic, 5) }]);
            append({ role: 'user', content: "Lets go!" });
        }} />;
    }

    return (
        <div className="flex flex-col w-full max-w-xl py-24 mx-auto stretch">
            {messages.filter((m, i) => i > 1 && m.role === "assistant").map(m => (
                <Markdown key={m.id} components={{
                    h1: ({ node, ...props }) => (
                        <h1 className="text-3xl font-bold text-gray-800 border-b mb-2 pb-1" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                        <p className="text-lg text-gray-600 mb-4" {...props} />
                    ),
                }}>{m.content.replace(/\n\n+/g, '\n\n')}</Markdown>
            ))}

            {!isLoading && !isFinalChapter && <button className="p-2 mt-4 bg-blue-300 rounded"
                onClick={() => append({ role: 'user', content: "Next chapter" })}
            >Next chapter</button>}

            {!isLoading && isFinalChapter && <button className="p-2 mt-4 bg-blue-300 rounded"
                onClick={() => setMessages([])}
            >New story</button>}
        </div>
    );
}

function StartScreen(props: { onStart: (topic: string) => void }) {
    const [topic, setTopic] = useState("");
    return (
        <div className="flex flex-col w-full max-w-md py-24 mx-auto stre7tch">
            <p className="text-4xl text-center mb-8">Storytelling</p>
            <textarea
                className="w-full max-w-md p-2 min-h-24 border border-gray-300 rounded shadow-xl"
                placeholder="What should the story be about?"
                onChange={e => setTopic(e.target.value)} />
            <button className="right-0 p-2 mt-4 bg-blue-300 rounded"
                onClick={() => props.onStart(topic)}
            >Start</button>
        </div>
    );
}

function getPrompt(storyTopic: string, storyLength: number) {
    return `
  Write a short chapter of an adventure story in Swedish using extremely simple vocabulary and present tense. 
  The text should be suitable for beginners learning Swedish. Avoid complex grammar or idiomatic expressions. 
  Keep sentences short and direct. The chapter should focus on basic verbs, nouns, and adjectives. 
  The goal is to create engaging content that helps learners build vocabulary and understand basic sentence structure in Swedish.
  Include only the text of the chapter, without explanations or translations.

  Example of a chapter:
  \`\`\`
  # Chapter 1: The Forest
  The text of this chapter.
  \`\`\`

  The chapter should be written in Markdown format. Make use of italic for direct speech.
  The last chapter has the title: "Hur det slutar" and the final text of the story.
  Per message, only one chapter should be submitted.
  The story consists of ${storyLength} chapers in total.
  After the last chapter, the story is considered finished.

  The story topic is: 
  ${storyTopic}
  `;
}
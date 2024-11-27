import { useChat } from 'ai/react';
import { useEffect, useState } from 'react';
import { usePlugin } from '../../utils/PluginProvider';
import TranslationEntry, { Translation } from './components/TranslationEntry';

export default function TranslationSidebar() {
    const [translation, setTranslation] = useState<Translation | null>(null);
    const [word, setWord] = useState("");
    const plugin = usePlugin();

    const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
        api: "http://localhost:3000/api/chat/stream",
        initialMessages: [
            { id: '1', role: "system", content: supportPrompt },
            { id: '2', role: "assistant", content: "The word that gets currently discussed:" + JSON.stringify(translation) }
        ]
    });

    useEffect(() => {
        plugin.subscribe("toolAction", (data: { action: string, text: string }) => {
            if (data.action === 'translate') {
                // console.log('translate', data.text);
                setWord(data.text);
            }
        });
    }, []);

    const reset = () => {
        setWord("");
        setTranslation(null);
        setMessages([]);
        setTimeout(() => document.getElementById("word-lookup")?.focus(), 100);
    }

    return (
        <div className='p-1'>
            {word.length > 0 && <div>
                <button className="absolute top-1 right-1 p-2 bg-blue-300 rounded" onClick={() => reset()}>N</button>
                <TranslationEntry word={word} onTranslationComplete={setTranslation} onAddedToFlashcard={() => reset()} />
            </div>}
            {word.length === 0 &&
                <div className='mx-auto w-full max-w-96 mt-48'>
                    <p className='text-4xl text-center mb-3'>Look up a word</p>
                    <input
                        id="word-lookup"
                        className='w-full p-2 border rounded shadow-xl text-center border-gray-500'
                        placeholder='snö, fog, Baum,....'
                        onKeyDown={(e: any) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                setWord(e.target.value);
                            }
                        }} />
                </div>
            }
            <div className={"flex flex-col w-full max-w-md py-3 mx-auto pb-24 " + (!translation ? "hidden" : "")}>
                {messages.length > 2 && <div className="border-b mb-2 mt-1"></div>}
                {messages.filter((_, i) => i > 1).map(m => (
                    <div key={m.id} className="whitespace-pre-wrap flex flex-row">
                        <div className="font-bold mr-1">{m.role === 'user' ? 'User' : 'AI'}: </div>
                        {m.content}
                    </div>
                ))}

                <form onSubmit={handleSubmit}>
                    <input
                        value={input}
                        className="fixed bottom-0 w-full max-w-md p-2 mb-4 border border-gray-300 rounded shadow-xl"
                        placeholder="Ask questions..."
                        onChange={handleInputChange} />
                </form>
            </div>
        </div>
    );
}

const supportPrompt = `
            You are a language processing assistant specialized in Swedish vocabulary. The user will ask you questions about Swedish words, and you need to provide the correct translation and explanation in English.
            The user just looked up this word.`;

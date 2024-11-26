import { useChat } from 'ai/react';
import { useEffect, useState } from 'react';
import { usePlugin } from '../../utils/PluginProvider';
import TranslationEntry, { Translation } from './components/TranslationEntry';

export default function TranslationSidebar() {
    const [translation, setTranslation] = useState<Translation | null>(null);
    const plugin = usePlugin();
    // const [isLoading, setIsLoading] = useState(false);
    const [word, setWord] = useState("");

    const { messages, input, handleInputChange, handleSubmit } = useChat({
        api: "http://localhost:3000/api/chat/stream",
        initialMessages: [
            { id: '1', role: "system", content: supportPrompt },
            { id: '2', role: "assistant", content: "The word that gets currently discussed:" + JSON.stringify(translation) }
        ]
    });

    useEffect(() => {
        plugin.subscribe("toolAction", (data: { action: string, text: string }) => {
            if (data.action === 'translate') {
                // setIsLoading(true);
                console.log('translate', data.text);
                setWord(data.text);
            }
        });
    }, []);


    return (
        <div className='p-1'>
            {word.length > 0 && <TranslationEntry word={word} onTranslationComplete={setTranslation} />}
            {word.length === 0 && <div>
                <p>Look up a word</p>
                <input placeholder='snö, fog, Baum,....' onSubmit={(e: any) => setWord(e.target.value)} />
            </div>}
            <div className="flex flex-col w-full max-w-md py-3 mx-auto">
                {messages.length > 2 && <div className="border-b mb-2 mt-1"></div>}
                {messages.filter((_, i) => i > 1).map(m => (
                    <div key={m.id} className="whitespace-pre-wrap flex flex-row">
                        <div className="font-bold mr-1">{m.role === 'user' ? 'User' : 'AI'}: </div>
                        {m.content}
                    </div>
                ))}

                <form onSubmit={handleSubmit}>
                    <input
                        className="fixed bottom-0 w-full max-w-md p-2 mb-4 border border-gray-300 rounded shadow-xl"
                        value={input}
                        placeholder="Ask questions..."
                        onChange={handleInputChange}
                    />
                </form>
            </div>
        </div>
    );
}

const supportPrompt = `
            You are a language processing assistant specialized in Swedish vocabulary. The user will ask you questions about Swedish words, and you need to provide the correct translation and explanation in English.
            The user just looked up this word.`;



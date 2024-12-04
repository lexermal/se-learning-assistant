import { useChat } from 'ai/react';
import { useEffect, useState } from 'react';
import { RiRobot3Fill } from "react-icons/ri";
import { FaUserCircle } from "react-icons/fa";
import { usePlugin } from '../../utils/plugin/providers/PluginProvider';
import { getBackendDomain } from '../../utils/plugin/PluginUtils';
import TranslationEntry, { Translation } from './TranslationEntry';
import MarkdownEditor from '../../components/form/MarkdownEditor';

export default function TranslationSidebar() {
    const [translation, setTranslation] = useState<Translation | null>(null);
    const [word, setWord] = useState("");
    const plugin = usePlugin();

    const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
        api: getBackendDomain() + "/api/chat/stream",
        initialMessages: [
            { id: '1', role: "system", content: supportPrompt },
            { id: '2', role: "assistant", content: "The word that gets currently discussed:" + JSON.stringify(translation) }
        ]
    });

    useEffect(() => {
        plugin.subscribe("toolAction", (data: { action: string, text: string }) => {
            if (data.action === 'translate') {
                console.log('translate', data.text);
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
                <TranslationEntry word={word} onTranslationComplete={setTranslation} onAddedToFlashcard={() => reset()} />
            </div>}
            {word.length === 0 &&
                <div className='mx-auto w-full max-w-96 mt-40'>
                    <p className='text-4xl text-center mb-3'>Look up a word</p>
                    <input
                        id="word-lookup"
                        className='w-full p-2 rounded-xl shadow-xl text-center bg-gray-600 placeholder-gray-400 mt-1'
                        placeholder='snö, fog, Baum,....'
                        onKeyDown={(e: any) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                setWord(e.target.value);
                            }
                        }} />
                </div>
            }
            <div className={"flex flex-col w-full max-w-3xl py-3 mx-auto pb-16 " + (!translation ? "hidden" : "")}>
                {messages.length > 2 && <div className="border-b mb-2 mt-1 border-gray-500"></div>}
                {messages.filter((_, i) => i > 1).map(m => (
                    <div key={m.id} className="whitespace-pre-wrap flex flex-row">
                        <div className="font-bold mr-1 mt-2">{m.role === 'user' ? <FaUserCircle /> : <RiRobot3Fill />}</div>
                        <div className='bg-gray-800 mb-1 rounded-lg p-1 px-2'>
                            <MarkdownEditor content={m.content} editable={false} />
                        </div>
                    </div>
                ))}

                <form onSubmit={handleSubmit}>
                    <input
                        value={input}
                        className="fixed bottom-0 w-full max-w-3xl p-2 py-4 bg-gray-800 placeholder-gray-300 rounded shadow-xl outline-none"
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

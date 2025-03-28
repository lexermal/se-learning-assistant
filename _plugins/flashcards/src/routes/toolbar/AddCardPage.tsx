import { Deck } from '../DeckOverviewPage';
import { useState, useEffect } from 'react';
import { usePlugin } from '@rimori/client';
import { CRUDModal } from '@rimori/client';
import { MarkdownEditor } from '@rimori/client';
import FlashcardController from '../deck/FlashcardController';

export default function AddCard() {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [selectedDeck, setSelectedDeck] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [initValue, setInitValue] = useState<string | undefined>("");
    const [initValueBack, setInitValueBack] = useState<string | undefined>("");
    const plugin = usePlugin();

    useEffect(() => {
        // Fetch decks from an API or other source
        // plugin.dbFetch('deck').then(setDecks);
        plugin.from("deck").select("name").then(({ data }) => {
            setDecks(data as Deck[]);
        });
        plugin.subscribe("toolAction", (_id, data: { action: string, text: string }) => {
            // console.log("data received from parent:", data);
            setInitValue(data.text);
        });
    }, []);

    const handleAddCard = () => {
        // console.log('Adding card:', { selectedDeck, question, answer });
        const controller = new FlashcardController(plugin);
        controller.add({
            front: question.trim(),
            back: answer.trim(),
            deckId: selectedDeck,
            frontTags: [],
            backTags: []
        });
        setAnswer('');
        setQuestion('');
        const value = initValue === undefined ? "" : undefined;
        setInitValue(value);
        setInitValueBack(value);
    };

    const DeckModal = () => {
        const [deckName, setDeckName] = useState('');
        return <CRUDModal title="Add Deck" show={true} actionbuttons={[{
            text: "Submit",
            onClick: () => plugin.from("decks").insert({ name: deckName }).select("id,name").single().then(({ data }) => {
                setDecks([...decks, data as Deck]);
                setSelectedDeck(data!.id as string);
            })
        }]}>
            <input className='w-full border-0 border-b p-0 border-gray-400' placeholder="Name..." onChange={e => setDeckName(e.target.value)} />
        </CRUDModal>
    }

    return (
        <div className="p-1 w-full">
            <h1 className="text-xl font-bold my-5 text-center">Flashcard - Quick Add</h1>
            {selectedDeck === 'new' && <DeckModal />}
            <select
                value={selectedDeck}
                className="w-full p-2 mb-4 border-0 rounded bg-gray-300 dark:bg-gray-800"
                onChange={e => setSelectedDeck(e.target.value)}>

                {decks.map(deck => (
                    <option key={deck.id} value={deck.id}>
                        {deck.name}
                    </option>
                ))}
                <option value="new">Create new deck</option>
            </select>
            <p className="dark:text-gray-400">Front</p>
            <MarkdownEditor
                className="w-full mb-3 bg-gray-300 dark:bg-gray-900 rounded"
                content={initValue} editable={true} onUpdate={setQuestion} />
            <p className="dark:text-gray-400">Back</p>
            <MarkdownEditor
                className="w-full mb-3 bg-gray-300 dark:bg-gray-900 rounded"
                content={initValueBack} editable={true} onUpdate={setAnswer} />
            <button
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleAddCard}>
                Add Card
            </button>
        </div>
    );
}


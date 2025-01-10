import { useState, useEffect } from 'react';
import { usePlugin } from 'shared-components';
import FlashcardController from '../deck/FlashcardController';
// import { Deck } from '../App';
import { CRUDModal } from 'shared-components';

export default function AddCard() {
    const [decks, setDecks] = useState<any[]>([]);
    const [selectedDeck, setSelectedDeck] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const plugin = usePlugin();

    useEffect(() => {
        // Fetch decks from an API or other source
        plugin.dbFetch('deck').then(setDecks);
        plugin.subscribe("toolAction", (_id, data: { action: string, text: string }) => {
            // console.log("data received from parent:", data);
            setQuestion(data.text);
        });
    }, []);

    const handleAddCard = () => {
        console.log('Adding card:', { selectedDeck, question, answer });

        const controller = new FlashcardController(plugin);
        controller.add(question, answer, selectedDeck);
        setQuestion('');
        setAnswer('');
    };

    const DeckModal = () => {
        const [deckName, setDeckName] = useState('');
        return <CRUDModal title="Add Deck" show={true} actionbuttons={[{
            text: "Submit",
            onClick: () => plugin.dbInsert('deck', { name: deckName }, "id,name").then(([newDeck]: any[]) => {
                setDecks([...decks, newDeck]);
                setSelectedDeck(newDeck.id);
            })
        }]}>
            <input className='w-full border-0 border-b p-0 border-gray-400' placeholder="Name..." onChange={e => setDeckName(e.target.value)} />
        </CRUDModal>
    }

    return (
        <div className="p-1 w-full">
            <h1 className="text-xl font-bold my-5 text-center">Add flashcard</h1>
            {selectedDeck === 'new' && <DeckModal />}
            <select
                value={selectedDeck}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                onChange={e => setSelectedDeck(e.target.value)}>

                {decks.map(deck => (
                    <option key={deck.id} value={deck.id}>
                        {deck.name}
                    </option>
                ))}
                <option value="new">Create new deck</option>
            </select>
            <textarea
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                placeholder="front"
                value={question}
                onChange={e => setQuestion(e.target.value)}
            />
            <textarea
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                placeholder="back"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
            />
            <button
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleAddCard}>
                Add Card
            </button>
        </div>
    );
}


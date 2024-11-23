import React, { useState, useEffect } from 'react';
import { usePlugin } from '../../utils/PluginProvider';
import FlashcardController from '../deck/FlashcardController';
import { Deck } from '../App';

export default function AddCard() {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [selectedDeck, setSelectedDeck] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const plugin = usePlugin();


    useEffect(() => {
        // Fetch decks from an API or other source
        plugin.dbFetch('decks').then(data => setDecks(data));
        plugin.on("toolAction", (data: { action: string, text: string }) => {
            console.log("text:", data.text);
            setQuestion(data.text);
        });
    }, []);

    const handleAddCard = () => {
        console.log('Adding card:', { selectedDeck, question, answer });

        const controller = new FlashcardController(plugin);
        controller.add(question, answer, selectedDeck);
    };

    return (
        <div className="p-4 w-64 bg-gray-100 rounded-lg shadow-md">
            <select
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                value={selectedDeck}
                onChange={e => setSelectedDeck(e.target.value)}
            >
                <option value="">Select a deck</option>
                {decks.map(deck => (
                    <option key={deck.id} value={deck.id}>
                        {deck.name}
                    </option>
                ))}
                <option value="new">Create new deck</option>
            </select>
            <input
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                type="text"
                placeholder="Question"
                value={question}
                onChange={e => setQuestion(e.target.value)}
            />
            <input
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                type="text"
                placeholder="Answer"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
            />
            <button
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleAddCard}
            >
                Add Card
            </button>
        </div>
    );
}



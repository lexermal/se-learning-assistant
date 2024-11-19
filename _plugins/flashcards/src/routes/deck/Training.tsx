import React from "react";
import { Grade, Rating } from "ts-fsrs";
import FlashcardController, { Flashcard } from "./FlashcardController";
import { usePlugin } from "../../utils/PluginProvider";
import { useNavigate } from "react-router-dom";

export default function Training() {
    const plugin = usePlugin();
    const [showAnswer, setShowAnswer] = React.useState(false);
    const [cardController, setCardController] = React.useState(new FlashcardController(plugin));
    const [card, setCard] = React.useState<Flashcard | undefined>(undefined);
    const [remaining, setRemaining] = React.useState({ new: 0, learning: 0, due: 0 });
    const [finished, setFinished] = React.useState(false);
    const navigate = useNavigate();
    const trainingRef = React.useRef<HTMLDivElement>(null);

    const cards = [
        {
            front: 'front1',
            back: 'back1',
        },
        {
            front: 'front2',
            back: 'back2',
        },
        {
            front: 'front3',
            back: 'back3',
        },
    ];

    function getNext() {
        const { card, remaining } = cardController.getNext();
        setCard(card);
        setRemaining(remaining);

        if (!card) {
            setFinished(true);
        }
    }

    React.useEffect(() => {
        const { pathname } = new URL(window.location.href);
        cardController.init(pathname.replace('/deck/', ''));

        console.log('cards', cards);
        cards.forEach(card => cardController.add(card.front, card.back));

        getNext();
    }, []);

    return (
        <div className="pb-40" ref={trainingRef}>
            <div className="flex flex-row border-b-2 border-gray-800">
                <span className="text-4xl mr-2">Deck xxxx</span>
                <div className="flex items-end">
                    <span className="mr-2 font-bold text-blue-500">{remaining.new}</span>+
                    <span className="mx-1 font-bold text-red-500">{remaining.learning}</span>+
                    <span className="ml-1 font-bold text-green-600">{remaining.due}</span>
                </div>
                <div className="ml-auto gap-1 flex font-normal">
                    <button className="ml-auto bg-blue-500 text-white p-2 rounded-lg">Add</button>
                    <button className="ml-auto bg-blue-500 text-white p-2 rounded-lg">Edit</button>
                    <button className="ml-auto bg-blue-500 text-white p-2 rounded-lg" onClick={_ => {
                        // @ts-ignore
                        trainingRef.current?.requestFullscreen() || trainingRef.current?.webkitRequestFullscreen();
                    }}>Fullscreen</button>
                    <button className="ml-auto bg-blue-500 text-white p-2 rounded-lg"
                        onClick={_ => navigate("/")}>Exit</button>
                </div>
            </div>
            <div className="text-center p-5 text-lg">{card?.front}</div>
            {finished && <div className="text-center text-2xl text-green-500">
                You learned all flashcards for today, well done!
            </div>}
            {showAnswer && (
                <div className="border-t border-gray-500 text-center pt-5 text-lg">
                    <span>{card?.back}</span>
                </div>)}
            <div className="fixed bottom-0 w-full ebg-white p-4">
                {(!finished && !showAnswer) && renderShowAnswerButton(() => setShowAnswer(true))}
                {(!finished && showAnswer) && renderKnowledgButtons(action => {
                    setShowAnswer(false);
                    if (!card) return;
                    cardController.validate(card.id, action);
                    getNext();
                }
                )}

            </div>
        </div>
    );
}

function renderShowAnswerButton(onClick: () => void) {
    return <button
        onClick={onClick}
        className="w-full bg-blue-500 text-white p-2 rounded-lg">
        Show answer
    </button>
}

function renderKnowledgButtons(onClick: (action: Grade) => void) {
    return (
        <div className="flex flex-row justify-evenly gap-2">
            <button onClick={_ => onClick(Rating.Again)} className="w-1/2 bg-purple-900 text-white p-2 rounded-lg">Again</button>
            <button onClick={_ => onClick(Rating.Hard)} className="w-1/2 bg-red-900 text-white p-2 rounded-lg">Hard</button>
            <button onClick={_ => onClick(Rating.Good)} className="w-1/2 bg-orange-800 text-white p-2 rounded-lg">Good</button>
            <button onClick={_ => onClick(Rating.Easy)} className="w-1/2 bg-green-800 text-white p-2 rounded-lg">Easy</button>
        </div>
    );
}
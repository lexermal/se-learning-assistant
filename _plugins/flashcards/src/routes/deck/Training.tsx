import { Grade, Rating } from "ts-fsrs";
import React, { useEffect } from "react";
import { usePlugin } from "../../utils/PluginProvider";
import { CRUDModal } from "../../components/CRUDModal";
import FlashcardController, { Flashcard } from "./FlashcardController";

export default function Training() {
    const plugin = usePlugin();
    const [showAnswer, setShowAnswer] = React.useState(false);
    const [cardController, setCardController] = React.useState(new FlashcardController(plugin));
    const [card, setCard] = React.useState<Flashcard | undefined>(undefined);
    const [remaining, setRemaining] = React.useState({ new: 0, learning: 0, review: 0 });
    const [finished, setFinished] = React.useState(false);
    const [deckName, setDeckName] = React.useState("");

    function getNext() {
        const { card, remaining } = cardController.getNext();
        setCard(card);
        setRemaining(remaining);

        if (!card) {
            setFinished(true);
        }
    }

    React.useEffect(() => {
        const deckId = window.location.hash.replace('#/deck/', '')
        cardController.init(deckId).then(() => {
            getNext();
            cardController.getDeckName().then(setDeckName);
        });
    }, []);

    React.useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (finished) return;

            if (event.key === ' ') {
                setShowAnswer(true);
            } else if (showAnswer) {
                switch (event.key) {
                    case '1':
                        handleKnowledgeButtonClick(Rating.Again);
                        break;
                    case '2':
                        handleKnowledgeButtonClick(Rating.Hard);
                        break;
                    case '3':
                        handleKnowledgeButtonClick(Rating.Good);
                        break;
                    case '4':
                        handleKnowledgeButtonClick(Rating.Easy);
                        break;
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [showAnswer, finished]);

    function handleKnowledgeButtonClick(action: Grade) {
        setShowAnswer(false);
        if (!card) return;
        cardController.validate(card.id, action);
        getNext();
    }

    return (
        <div className="pb-40">
            <TrainingNavbar deckName={deckName} card={card} remaining={remaining} cardController={cardController} getNext={() => getNext()} />
            <div className="text-center p-5 text-3xl">{card?.front}</div>
            {finished && <div className="text-center text-2xl text-green-500">
                You learned all flashcards for today, well done!
            </div>}
            {showAnswer && (
                <div className="border-t border-gray-500 text-center pt-5 text-3xl">
                    <span>{card?.back}</span>
                </div>)}
            <div className="fixed bottom-0 w-full ebg-white p-4">
                {(!finished && !showAnswer) && renderShowAnswerButton(() => setShowAnswer(true))}
                {(!finished && showAnswer) && renderKnowledgButtons(handleKnowledgeButtonClick)}
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
            <button onClick={_ => onClick(Rating.Again)} className="w-1/2 bg-purple-600 text-white p-2 rounded-lg">Again</button>
            <button onClick={_ => onClick(Rating.Hard)} className="w-1/2 bg-red-500 text-white p-2 rounded-lg">Hard</button>
            <button onClick={_ => onClick(Rating.Good)} className="w-1/2 bg-orange-500 text-white p-2 rounded-lg">Good</button>
            <button onClick={_ => onClick(Rating.Easy)} className="w-1/2 bg-green-500 text-white p-2 rounded-lg">Easy</button>
        </div>
    );
}

function TrainingNavbar({ deckName, remaining, cardController, card, getNext }: { deckName: string, card?: Flashcard, remaining: { new: number, learning: number, review: number }, cardController: FlashcardController, getNext: () => void }) {
    const plugin = usePlugin();
    const [fullscreen, setFullscreen] = React.useState(false);

    return (
        <div className="flex flex-row border-b-2 border-gray-800 items-end">
            <span className="text-4xl mr-2">{deckName}</span>
            <div className="flex items-end">
                <span className="mr-2 font-bold text-blue-500">{remaining.new}</span>+
                <span className="mx-1 font-bold text-red-500">{remaining.learning}</span>+
                <span className="ml-1 font-bold text-green-600">{remaining.review}</span>
            </div>
            <div className="ml-auto gap-1 flex font-normal p-1">
                <div className="flex flex-row">
                    <CardCRUDModal className="ml-auto bg-blue-500 text-white p-2 rounded-l-lg" buttonText="Add" onComplete={(front, back) => {
                        cardController.add(front, back);
                    }} />
                    <CardCRUDModal className=" bg-blue-500 text-white p-2 border-l border-r border-blue-700" buttonText="Edit" card={card} onComplete={(front, back) => {
                        cardController.edit(front, back);
                        getNext();
                    }} />
                    <button className="bg-blue-500 text-white p-2 rounded-r-lg" onClick={() => {
                        cardController.delete();
                        getNext();
                    }}>Delete</button>
                </div>
                <button className="ml-auto bg-blue-500 text-white p-2 rounded-lg" onClick={() => {
                    plugin.emitAndWaitResponse("triggerFullscreen", !fullscreen)
                        .then(({ fullscreen }: any) => setFullscreen(fullscreen));
                }}>Fullscreen</button>
            </div>
        </div>
    );
}

function CardCRUDModal(props: { onComplete: (front: string, back: string) => void, card?: Flashcard, buttonText: string, className?: string }) {
    const [front, setFront] = React.useState(props.card?.front || "");
    const [back, setBack] = React.useState(props.card?.back || "");

    useEffect(() => {
        setFront(props.card?.front || "");
        setBack(props.card?.back || "");
    }, [props.card]);

    return <CRUDModal
        buttonText={props.buttonText}
        title={props.card ? "Edit card" : "Add card"}
        className={props.className}
        actionbuttons={[
            {
                text: "Save", onClick: () => {
                    props.onComplete(front, back);
                    setFront("");
                    setBack("");
                }
            },
            {
                text: "Cancel", onClick: () => {
                    setFront("");
                    setBack("");
                }
            },
        ]}>
        <div className="flex flex-col gap-4">
            <input type="text" placeholder="Front" defaultValue={front} onChange={e => setFront(e.target.value)} />
            <input type="text" placeholder="Back" defaultValue={back} onChange={e => setBack(e.target.value)} />
        </div>
    </CRUDModal>
}

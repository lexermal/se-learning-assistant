import { Grade, Rating } from "ts-fsrs";
import React, { useEffect } from "react";
import { IoAddCircleOutline } from "react-icons/io5";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { usePlugin } from "../../utils/PluginProvider";
import { CRUDModal } from "../../components/CRUDModal";
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from "react-icons/ai";
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
            <TrainingNavbar deckName={deckName} remaining={remaining} />
            <div className="text-center p-5 text-3xl pt-40 pb-10 text-white">{card?.front}</div>
            {finished && <div className="text-center text-2xl text-green-500 mt-24">
                You learned all flashcards for today!🎉
            </div>}
            {showAnswer && (
                <div className="border-t border-gray-700 text-center pt-5 text-3xl w-fit mx-auto px-24 pt-10 text-white">
                    <span>{card?.back}</span>
                </div>)}
            <div className="fixed bottom-0 w-full p-4 flex flex-row justify-between">
                <CardCRUDModal className="text-2xl rounded-l-lg" buttonText={<IoAddCircleOutline />} onComplete={(front, back) => {
                    cardController.add(front, back);
                }} />
                {(!finished && !showAnswer) && renderShowAnswerButton(() => setShowAnswer(true))}
                {(!finished && showAnswer) && renderKnowledgButtons(handleKnowledgeButtonClick)}
                <div className="flex flex-row">
                    <CardCRUDModal className="text-2xl" buttonText={<MdModeEdit />} card={card} onComplete={(front, back) => {
                        cardController.edit(front, back);
                        getNext();
                    }} />
                    <button className="text-2xl" onClick={() => {
                        cardController.delete();
                        getNext();
                    }}><MdDelete /></button>
                </div>
            </div>
        </div>
    );
}

function renderShowAnswerButton(onClick: () => void) {
    return <button
        onClick={onClick}
        className="mx-auto w-1/4 border-2 border-gray-800 p-2 rounded-lg text-gray-300">
        Show answer
    </button>
}

function renderKnowledgButtons(onClick: (action: Grade) => void) {
    return (
        <div className="flex flex-row justify-evenly gap-2 w-1/3 mx-auto">
            <button onClick={_ => onClick(Rating.Again)} className="w-1/2 text-purple-700 border border-gray-800 p-2 rounded-lg">Again</button>
            <button onClick={_ => onClick(Rating.Hard)} className="w-1/2 text-red-600 border border-gray-800 p-2 rounded-lg">Hard</button>
            <button onClick={_ => onClick(Rating.Good)} className="w-1/2 text-orange-600 border border-gray-800 p-2 rounded-lg">Good</button>
            <button onClick={_ => onClick(Rating.Easy)} className="w-1/2 text-green-600 border border-gray-800 p-2 rounded-lg">Easy</button>
        </div>
    );
}

function TrainingNavbar({ deckName, remaining}: { deckName: string, remaining: { new: number, learning: number, review: number }}) {
    const plugin = usePlugin();
    const [fullscreen, setFullscreen] = React.useState(false);

    return (
        <div className="flex flex-row border-b-2 border-gray-700 items-end">
            <span className="text-4xl mr-2 pl-2 pt-1 text-gray-300">{deckName}</span>
            <div className="flex items-end">
                <span className="mr-2 font-bold text-blue-500">{remaining.new}</span>+
                <span className="mx-1 font-bold text-red-500">{remaining.learning}</span>+
                <span className="ml-1 font-bold text-green-600">{remaining.review}</span>
            </div>
            <div className="ml-auto gap-1 flex font-normal p-1">
                <button className="mr-1 text-3xl" onClick={() => {
                    plugin.emitAndWaitResponse("triggerFullscreen", !fullscreen)
                        .then(({ fullscreen }: any) => setFullscreen(fullscreen));
                }}>{fullscreen ? <AiOutlineFullscreenExit /> : <AiOutlineFullscreen />}</button>
            </div>
        </div>
    );
}

interface ModelProps {
    card?: Flashcard,
    className?: string
    buttonText: string | React.ReactNode,
    onComplete: (front: string, back: string) => void,
}

function CardCRUDModal(props: ModelProps) {
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
            <input 
            className="bg-gray-500 rounded p-2 text-white"
             placeholder="Front" 
             defaultValue={front} 
             onChange={e => setFront(e.target.value)} />
            <input 
            className="bg-gray-500 rounded p-2 text-white"
             placeholder="Back"
              defaultValue={back}
               onChange={e => setBack(e.target.value)} />
        </div>
    </CRUDModal>
}

import React, { useEffect } from "react";
import { Grade, Rating } from "ts-fsrs";
import { IoAddCircleOutline } from "react-icons/io5";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { usePlugin } from "../../utils/PluginProvider";
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from "react-icons/ai";
import FlashcardController, { Flashcard } from "./FlashcardController";
import MarkdownEditor from "../toolbar/components/MarkdownEditor";
import { FaSave } from "react-icons/fa";
import Pomodoro from "./Polodoro";
import { useEventEmitter } from "../../utils/providers/EventEmitterContext";
import AudioPlayer from "../../components/audio/Playbutton";

interface FlashcardEdit {
    front: string,
    back: string,
    new: boolean
}

export default function Training() {
    const plugin = usePlugin();
    const [showAnswer, setShowAnswer] = React.useState(false);
    const [cardController, setCardController] = React.useState(new FlashcardController(plugin));
    const [card, setCard] = React.useState<Flashcard | undefined>(undefined);
    const [remaining, setRemaining] = React.useState({ new: 0, learning: 0, review: 0 });
    const [finished, setFinished] = React.useState(false);
    const [deckName, setDeckName] = React.useState("");
    const [editedCard, setEditedCard] = React.useState<FlashcardEdit | undefined>(undefined);
    const { emit } = useEventEmitter();

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


    useEffect(() => {
        emit("pomodoro_start", "");
    }, [showAnswer]);

    function handleKnowledgeButtonClick(action: Grade) {
        setShowAnswer(false);
        if (!card) return;
        cardController.validate(card.id, action);
        getNext();
    }

    return (
        <div className="pb-40">
            <TrainingNavbar deckName={deckName} remaining={remaining} />
            {finished && <div className="text-center text-3xl text-green-500 mt-[25vh]">
                You learned all flashcards for today!🎉
            </div>}
            {!finished && card && <RenderFlashcard
                card={card}
                showAnswer={showAnswer}
                editedCard={editedCard}
                setEditedCard={setEditedCard} />}
            <div className="fixed bottom-0 w-full p-4 flex flex-row justify-between items-center">
                <div className="text-2xl p-2 cursor-pointer" onClick={() => {
                    setEditedCard({ front: "", back: "", new: true });
                    setShowAnswer(true);
                }
                }><IoAddCircleOutline /></div>
                {(!finished && !showAnswer) && renderShowAnswerButton(() => setShowAnswer(true))}
                {(!finished && showAnswer && !editedCard) && renderKnowledgButtons(handleKnowledgeButtonClick)}
                <div className="flex flex-row items-end">
                    <div className="text-2xl mr-1 cursor-pointer" onClick={() => {
                        if (!editedCard) {
                            setEditedCard({ front: card?.front || "", back: card?.back || "", new: false });
                            return;
                        }
                        if (editedCard.new) {
                            cardController.add(editedCard.front, editedCard.back);
                        } else {
                            cardController.edit(editedCard.front, editedCard.back);
                        }
                        getNext();
                        setEditedCard(undefined);
                    }}>
                        {!!editedCard ? <FaSave /> : <MdModeEdit />}
                    </div>
                    <div className="text-2xl cursor-pointer" onClick={() => {
                        cardController.delete();
                        setShowAnswer(false);
                        getNext();
                    }}><MdDelete /></div>
                </div>
            </div>
        </div>
    );
}

function RenderFlashcard(props: { card: Flashcard, showAnswer: boolean, editedCard?: FlashcardEdit, setEditedCard: (editedCard: FlashcardEdit) => void }) {
    const { card, showAnswer, editedCard, setEditedCard } = props;

    return <div className="pt-[25vh] w-full px-[29%]">
        <div className={"border-l-2 py-4 text-white text-3xl border-gray-700"}>
            <div className="flex flex-row items-center ml-4 group">
                <MarkdownEditor content={editedCard?.new ? "" : card.front} editable={!!editedCard} onUpdate={text => {
                    setEditedCard({ ...editedCard!, front: text });
                }} />
                {!editedCard && <div className="ml-2 opacity-0 group-hover:opacity-100"><AudioPlayer text={card.front} /></div>}
            </div>
            {showAnswer && (
                <div className="border-t text-3xl pt-1 text-white w-full pl-4 border-gray-800 group flex flex-row items-center">
                    <MarkdownEditor content={editedCard?.new ? "" : card.back} editable={!!editedCard} onUpdate={text => {
                        setEditedCard({ ...editedCard!, back: text });
                    }} />
                    {!editedCard && <div className="ml-2 opacity-0 group-hover:opacity-100"><AudioPlayer text={card.back} /></div>}

                    {/* {card?.back && <MarkdownEditor content={editedCard?.new ? "" : card.back} editable={!!editedCard} onUpdate={text => {
                        setEditedCard({ ...editedCard!, back: text });
                    }} />} */}
                </div>)}
        </div>
    </div>
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
        <div className="flex flex-row justify-evenly gap-2 w-1/3 mx-auto" style={{ padding: "1px 0" }}>
            <button onClick={_ => onClick(Rating.Again)} className="w-1/2 text-purple-700 border border-gray-800 p-2 rounded-lg">Again</button>
            <button onClick={_ => onClick(Rating.Hard)} className="w-1/2 text-red-600 border border-gray-800 p-2 rounded-lg">Hard</button>
            <button onClick={_ => onClick(Rating.Good)} className="w-1/2 text-yellow-600 border border-gray-800 p-2 rounded-lg">Good</button>
            <button onClick={_ => onClick(Rating.Easy)} className="w-1/2 text-green-600 border border-gray-800 p-2 rounded-lg">Easy</button>
        </div>
    );
}

function TrainingNavbar({ deckName, remaining }: { deckName: string, remaining: { new: number, learning: number, review: number } }) {
    const plugin = usePlugin();
    const [fullscreen, setFullscreen] = React.useState(false);

    return (
        <div className="flex flex-row border-b-2 border-gray-700 items-end justify-between">
            <div className="flex flex-row max-w-1/3 w-1/3">
                <span className="text-4xl mr-2 pl-2 pt-1 text-gray-300">{deckName}</span>
                <div className="flex items-end">
                    <span className="mr-2 font-bold text-blue-500">{remaining.new}</span>+
                    <span className="mx-1 font-bold text-red-500">{remaining.learning}</span>+
                    <span className="ml-1 font-bold text-green-600">{remaining.review}</span>
                </div>
            </div>
            <div>
                <Pomodoro />
            </div>
            <div className="gap-1 flex font-normal p-1 w-1/3 flex-row-reverse">
                <div className="mr-1 text-3xl cursor-pointer" onClick={() => {
                    plugin.emitAndWaitResponse("triggerFullscreen", !fullscreen)
                        .then(({ fullscreen }: any) => setFullscreen(fullscreen));
                }}>{fullscreen ? <AiOutlineFullscreenExit /> : <AiOutlineFullscreen />}</div>
            </div>
        </div>
    );
}
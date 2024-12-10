import React, { useEffect } from "react";
import { Grade, Rating } from "ts-fsrs";
import { IoAddCircleOutline } from "react-icons/io5";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { usePlugin } from "shared-components";
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from "react-icons/ai";
import FlashcardController, { Flashcard } from "./FlashcardController";
import {MarkdownEditor} from "shared-components";
import { FaSave } from "react-icons/fa";
import Pomodoro from "../../components/Polodoro";
import { useEventEmitter } from "shared-components";
import {AudioPlayer} from "shared-components";
import TagInput from "../../components/form/TagInput";

interface FlashcardEdit {
    front: string,
    back: string,
    new: boolean,
    frontTags: string[],
    backTags: string[]
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
        <div className="pb-40 bg-white dark:bg-transparent">
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
                    setEditedCard({ front: "", back: "", new: true, frontTags: [], backTags: [] });
                    setShowAnswer(true);
                }
                }><IoAddCircleOutline /></div>
                {(!finished && !showAnswer) && renderShowAnswerButton(() => setShowAnswer(true))}
                {(!finished && showAnswer && !editedCard) && renderKnowledgButtons(handleKnowledgeButtonClick)}
                <div className="flex flex-row items-end">
                    <div className="text-2xl mr-1 cursor-pointer" onClick={() => {
                        if (!editedCard) {
                            setEditedCard({
                                front: card?.front || "",
                                back: card?.back || "",
                                new: false,
                                frontTags: card?.front_tags || [],
                                backTags: card?.back_tags || []
                            });
                            return;
                        }
                        if (editedCard.new) {
                            cardController.add(editedCard);
                        } else {
                            cardController.edit(editedCard);
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
    const frontTtsEnabled = card.front_tags?.includes("lang")
    const backTtsEnabled = card.back_tags?.includes("lang");

    return <div className="pt-[25vh] w-full px-[29%]">
        <div className={"border-l-2 py-4 dark:text-white text-3xl border-gray-700"}>
            <div className="flex flex-row items-center ml-4 group">
                <div className="flex flex-col">
                    <MarkdownEditor className="rounded" content={editedCard?.new ? "" : card.front} editable={!!editedCard} onUpdate={text => {
                        setEditedCard({ ...editedCard!, front: text });
                    }} />
                    {editedCard && <TagInput className="mb-3 mt-2" initialTags={editedCard.frontTags} onTagsChange={tags => setEditedCard({ ...editedCard, frontTags: tags })} />}
                </div>
                {!editedCard && frontTtsEnabled && <div className="ml-2 opacity-0 group-hover:opacity-100">
                    <AudioPlayer text={getTTSText(card.front, card.front_tags)} />
                </div>}
            </div>
            {showAnswer && (
                <div className="border-t text-3xl pt-1 dark:text-white w-full pl-4 border-gray-800 group flex flex-row items-center">
                    <div className="flex flex-col mt-3">
                        <MarkdownEditor className="rounded mb-1 max-w-1/2" content={editedCard?.new ? "" : card.back} editable={!!editedCard} onUpdate={text => {
                            setEditedCard({ ...editedCard!, back: text });
                        }} />
                        {editedCard && <TagInput initialTags={editedCard.backTags} onTagsChange={tags => setEditedCard({ ...editedCard, backTags: tags })} />}
                    </div>
                    {!editedCard && backTtsEnabled && <div className="ml-2 opacity-0 group-hover:opacity-100">
                        <AudioPlayer text={getTTSText(card.back, card.back_tags)} />
                    </div>}
                </div>)}
        </div>
    </div>
}

function getTTSText(text: string, tags?: string[]) {
    const languageTag = tags?.find(tag => tag.startsWith("lang:"));

    return (languageTag ? `(${languageTag.replace("lang:", "")}:) ` : "") + text.replace(/\(.*?\)/g, "");
}

function renderShowAnswerButton(onClick: () => void) {
    return <button
        onClick={onClick}
        className="mx-auto w-1/4 border-2 border-gray-800 p-2 rounded-lg dark:text-gray-300">
        Show answer
    </button>
}

function renderKnowledgButtons(onClick: (action: Grade) => void) {
    return (
        <div className="flex flex-row justify-evenly gap-2 w-1/3 mx-auto" style={{ padding: "1px 0" }}>
            <button onClick={_ => onClick(Rating.Again)} className="w-1/2 text-purple-700 border border-gray-800 p-2 rounded-lg">Again</button>
            <button onClick={_ => onClick(Rating.Hard)} className="w-1/2 text-red-600 border border-gray-800 p-2 rounded-lg">Hard</button>
            <button onClick={_ => onClick(Rating.Good)} className="w-1/2 text-yellow-500 border border-gray-800 p-2 rounded-lg">Good</button>
            <button onClick={_ => onClick(Rating.Easy)} className="w-1/2 text-green-600 border border-gray-800 p-2 rounded-lg">Easy</button>
        </div>
    );
}

function TrainingNavbar({ deckName, remaining }: { deckName: string, remaining: { new: number, learning: number, review: number } }) {
    const plugin = usePlugin();
    const [fullscreen, setFullscreen] = React.useState(false);

    useEffect(() => {
        plugin.subscribe("triggerFullscreen", setFullscreen);
    }, []);

    return (
        <div className="flex flex-row border-b-2 border-gray-700 items-end justify-between">
            <div className="flex flex-row max-w-1/3 w-1/3">
                <span className="text-4xl mr-2 pl-2 pt-1 dark:text-gray-300">{deckName}</span>
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
                    // .then(() => setFullscreen(!fullscreen));
                }}>{fullscreen ? <AiOutlineFullscreenExit /> : <AiOutlineFullscreen />}</div>
            </div>
        </div>
    );
}
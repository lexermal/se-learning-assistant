import React, { useEffect } from "react";
import { Grade, Rating } from "ts-fsrs";
import { IoAddCircleOutline } from "react-icons/io5";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { isFullscreen, triggerFullscreen, usePlugin, UserSettings } from "shared-components";
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from "react-icons/ai";
import FlashcardController, { Flashcard } from "./FlashcardController";
import { FaSave } from "react-icons/fa";
import Pomodoro from "../../components/Polodoro";
import { useEventEmitter } from "shared-components";
import { useNavigate } from "react-router-dom";
import { RenderFlashcard } from "./Flashcard";
import { FlashcardPluginSettings } from "../settings/SettingsPage";

export interface FlashcardEdit {
    front: string,
    back: string,
    new: boolean,
    frontTags: string[],
    backTags: string[]
}

export default function Training() {
    const [showAnswer, setShowAnswer] = React.useState(false);
    const [cardController] = React.useState(new FlashcardController(usePlugin()));
    const [card, setCard] = React.useState<Flashcard | undefined>(undefined);
    const [remaining, setRemaining] = React.useState({ new: 0, learning: 0, review: 0 });
    const [finished, setFinished] = React.useState(false);
    const [deckName, setDeckName] = React.useState("");
    const [editedCard, setEditedCard] = React.useState<FlashcardEdit | undefined>(undefined);
    const { emit } = useEventEmitter();
    const navigate = useNavigate();
    const { getSettings } = usePlugin();
    const [motherTongue, setMotherTongue] = React.useState("");

    React.useEffect(() => {
        getSettings<FlashcardPluginSettings>({
            autoPlayForeignNewFlashcards: true,
        }).then(settings => {
            if (!settings.autoPlayForeignNewFlashcards) return;
            getSettings<UserSettings>({ languageLevel: "A1", motherTongue: "English" }, "user").then(settings => {
                setMotherTongue(settings.motherTongue);
            });
        });
    }, []);

    function getNext() {
        const { card, remaining } = cardController.getNext();
        setCard(card);
        setRemaining(remaining);

        if (!card) {
            setFinished(true);
            emit("pomodoro_stop");
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
        function handleKeyDown({ key }: KeyboardEvent) {
            console.log("handleKeyDown", finished);
            if (finished) return;

            if (key === ' ') {
                setShowAnswer(true);
            } else if (showAnswer) {
                switch (key) {
                    case '1':
                    case 'z':
                        handleKnowledgeButtonClick(Rating.Again);
                        break;
                    case '2':
                    case '7':
                        handleKnowledgeButtonClick(Rating.Hard);
                        break;
                    case '3':
                    case '8':
                        handleKnowledgeButtonClick(Rating.Good);
                        break;
                    case '4':
                    case '9':
                        handleKnowledgeButtonClick(Rating.Easy);
                        break;
                }
            }
            if (["5", "t"].includes(key)) {
                emit("flashcard_play_front");
            } else if (["h", "r"].includes(key)) {
                emit("flashcard_play_back");
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [showAnswer, finished]);


    useEffect(() => {
        emit("pomodoro_start");
    }, [showAnswer]);

    function handleKnowledgeButtonClick(action: Grade) {
        setShowAnswer(false);
        if (!card) return;
        cardController.validate(card.id, action);
        getNext();
    }

    if (finished) {
        return <div className="pb-40 bg-white dark:bg-transparent">
            <TrainingNavbar deckName={deckName} remaining={remaining} />
            <div className="text-center mt-[25vh]">
                <p className="text-3xl text-green-500">You learned all flashcards for today!🎉</p>
                <button
                    className="text-blue-600 border border-blue-600 p-2 rounded-lg mt-4"
                    onClick={() => navigate("/")}>
                    Back to the decks
                </button>
            </div>
        </div>
    }

    return (
        <div className="pb-40 bg-white dark:bg-transparent">
            <TrainingNavbar deckName={deckName} remaining={remaining} />
            {card && <RenderFlashcard
                card={card}
                showAnswer={showAnswer}
                editedCard={editedCard}
                setEditedCard={setEditedCard}
                motherTongue={motherTongue}
                autoPlayForeignNewFlashcards={!!motherTongue} />}
            <div className="fixed bottom-0 w-full p-4 flex flex-row justify-between items-center flex-wrap">
                <div className="text-2xl p-2 cursor-pointer" onClick={() => {
                    setEditedCard({ front: "", back: "", new: true, frontTags: [], backTags: [] });
                    setShowAnswer(true);
                }
                }><IoAddCircleOutline /></div>
                {(!showAnswer) && renderShowAnswerButton(() => setShowAnswer(true))}
                {(showAnswer && !editedCard) && renderKnowledgButtons(handleKnowledgeButtonClick)}
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

function renderShowAnswerButton(onClick: () => void) {
    return <button
        onClick={onClick}
        className="mx-auto w-1/4 border-2 border-gray-800 p-2 rounded-lg dark:text-gray-300">
        Show answer
    </button>
}

function renderKnowledgButtons(onClick: (action: Grade) => void) {
    return (
        <div className="flex flex-row flex-wrap justify-evenly gap-1 md:gap-2 md:w-1/3 mx-auto text-sm md:text-base" style={{ padding: "1px 0" }}>
            <button onClick={_ => onClick(Rating.Again)} className="text-purple-700 border border-gray-800 p-1 md:p-2 rounded-lg">Again</button>
            <button onClick={_ => onClick(Rating.Hard)} className="text-red-600 border border-gray-800 p-1 md:p-2 rounded-lg">Hard</button>
            <button onClick={_ => onClick(Rating.Good)} className="text-yellow-500 border border-gray-800 p-1 md:p-2 rounded-lg">Good</button>
            <button onClick={_ => onClick(Rating.Easy)} className="text-green-600 border border-gray-800 p-1 md:p-2 rounded-lg">Easy</button>
        </div>
    );
}

function TrainingNavbar({ deckName, remaining }: { deckName: string, remaining: { new: number, learning: number, review: number } }) {
    const [fullscreen, setFullscreen] = React.useState(isFullscreen());
    const navigate = useNavigate();
    return (
        <div className="flex flex-row border-b-2 border-gray-700 items-end justify-between">
            <div className="flex flex-row max-w-1/3 w-1/3">
                <span className="text-4xl mr-2 pl-2 pt-1 hidden md:block dark:text-gray-300 cursor-pointer"
                    onClick={() => navigate("/")}>{deckName}</span>
                <div className="flex items-end text-sm md:text-base">
                    <span className="mr-2 font-bold text-blue-500">{remaining.new}</span>+
                    <span className="mx-1 font-bold text-red-500">{remaining.learning}</span>+
                    <span className="ml-1 font-bold text-green-600">{remaining.review}</span>
                </div>
            </div>
            <div>
                <Pomodoro />
            </div>
            <div className="gap-1 flex font-normal p-1 w-1/3 flex-row-reverse flex-grow-0">
                <div className="mr-1 text-3xl cursor-pointer" onClick={() => {
                    triggerFullscreen(setFullscreen);
                }}>{fullscreen ? <AiOutlineFullscreenExit /> : <AiOutlineFullscreen />}</div>
            </div>
        </div>
    );
}
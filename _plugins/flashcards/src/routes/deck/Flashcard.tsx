import { State } from "ts-fsrs";
import { Flashcard } from "./FlashcardController";
import TagInput from "../../components/form/TagInput";
import { FlashcardEdit } from "./FlashcardTrainingPage";
import { MarkdownEditor, AudioPlayer } from "shared-components";

interface FlashcardProps {
    card: Flashcard,
    showAnswer: boolean,
    editedCard?: FlashcardEdit,
    setEditedCard: (editedCard: FlashcardEdit) => void,
    motherTongue: string,
    autoPlayForeignNewFlashcards: boolean
}

export function RenderFlashcard(props: FlashcardProps) {
    // console.log("props", props);
    const { card, showAnswer, editedCard, setEditedCard, motherTongue, autoPlayForeignNewFlashcards } = props;
    const frontTtsEnabled = card.front_tags?.includes("lang")
    const backTtsEnabled = card.back_tags?.includes("lang");
    const frontLanguage = card.front_tags?.find(tag => tag.startsWith("lang:"))?.replace("lang:", "");
    const backLanguage = card.back_tags?.find(tag => tag.startsWith("lang:"))?.replace("lang:", "");
    const autoPlayFront = card.state === State.New && !!motherTongue && motherTongue !== frontLanguage && autoPlayForeignNewFlashcards;
    const autoPlayBack = card.state === State.New && !!motherTongue && motherTongue !== backLanguage && autoPlayForeignNewFlashcards;

    // console.log("card lang", { frontLanguage, backLanguage, autoPlayFront, autoPlayBack, card, motherTongue, autoPlayForeignNewFlashcards, });
    // console.log("front play audio", autoPlayFront)
    // console.log("why not front play audio", { 
    //     cardstate: card.state === State.New,
    //      motherTongueIsDefined: !!motherTongue, 
    //      motherTongueIsNotFrontLanguage: motherTongue !== frontLanguage,
    //      autoPlayForeignNewFlashcards
    //      });

    return <div className="pt-8 md:pt-[25vh] w-full md:px-[29%]">
        <div className={"md:border-l-2 py-4 dark:text-white text-3xl border-gray-700"}>
            <div className="flex flex-row items-center md:ml-4 group">
                <div className="flex flex-col">
                    <MarkdownEditor
                        className="rounded"
                        content={editedCard?.new ? "" : card.front}
                        editable={!!editedCard}
                        onUpdate={text => {
                            setEditedCard({ ...editedCard!, front: text });
                        }} />
                    {editedCard && <TagInput
                        className="mb-3 mt-2"
                        initialTags={editedCard.frontTags}
                        onTagsChange={tags => setEditedCard({ ...editedCard, frontTags: tags })} />}
                </div>
                {!editedCard && frontTtsEnabled && <div className="ml-2 opacity-0 group-hover:opacity-100">
                    <AudioPlayer
                        language={frontLanguage}
                        text={card.front.replace(/\(.*?\)/g, "")}
                        playOnMount={autoPlayFront}
                        playListenerEvent="flashcard_play_front" />
                </div>}
            </div>
            {showAnswer && (
                <div className="border-t text-3xl pt-1 dark:text-white w-full md:pl-4 border-gray-800 group flex flex-row items-center">
                    <div className="flex flex-col mt-3">
                        <MarkdownEditor
                            className="rounded mb-1 max-w-1/2"
                            content={editedCard?.new ? "" : card.back}
                            editable={!!editedCard}
                            onUpdate={text => {
                                setEditedCard({ ...editedCard!, back: text });
                            }} />
                        {editedCard && <TagInput
                            initialTags={editedCard.backTags}
                            onTagsChange={tags => setEditedCard({ ...editedCard, backTags: tags })} />}
                    </div>
                    {!editedCard && backTtsEnabled && <div className="ml-2 opacity-0 group-hover:opacity-100">
                        <AudioPlayer
                            language={backLanguage}
                            text={card.back.replace(/\(.*?\)/g, "")}
                            playOnMount={autoPlayBack}
                            playListenerEvent="flashcard_play_back" />
                    </div>}
                </div>)}
        </div>
    </div>
}
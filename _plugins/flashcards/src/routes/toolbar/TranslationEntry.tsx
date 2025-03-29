import { useEffect, useState } from "react";
import { AudioPlayer } from "@rimori/client";
import { usePlugin, UserSettings } from "@rimori/client";
import AddToDeckButton from "../../components/DropDownButton";
import { FlashcardPluginSettings } from "../settings/SettingsPage";
import { Translation, BasicWordInfo } from "../../types/translation";
import { addFlashcard, getAlternativeMeaning } from "../../services/flashcardAddService";
import { getBasicWordInfo, getAdditionalWordInfo } from "../../services/translationService";

interface Props {
    word: string;
    onAddedToFlashcard: () => void;
    onTranslationComplete: (t: Translation) => void;
}

export default function TranslationEntry({ onTranslationComplete, word, onAddedToFlashcard }: Props) {
    const [basicInfo, setBasicInfo] = useState<BasicWordInfo | null>(null);
    const [t, setAdditionalInfo] = useState<Partial<Translation>>({});
    const [decks, setDecks] = useState<any[]>([]);
    const plugin = usePlugin();
    const [settings, setSettings] = useState<FlashcardPluginSettings | null>(null);
    const [language, setLanguage] = useState<string | null>(null);

    useEffect(() => {
        plugin.getSettings<FlashcardPluginSettings>({
            autoPlayForeignNewFlashcards: false
        }).then(setSettings);

        plugin.getSettings<UserSettings>({ motherTongue: "English", languageLevel: "A1" }, "user")
            .then(s => setLanguage(s.motherTongue));

        plugin.from("decks").select("id, name, last_used").then(({ data }) => {
            setDecks(data!.sort((a: any, b: any) => new Date(b.last_used).getTime() - new Date(a.last_used).getTime()));
        });
    }, []);

    useEffect(() => {
        setBasicInfo(null);
        setAdditionalInfo({});
        if (!word || !settings || !language) return;

        console.log({ word, settings, language });

        getBasicWordInfo(word, language as string, plugin).then(info => {
            // console.log("basic info", info);
            setBasicInfo(info);

            getAdditionalWordInfo(info, language as string, plugin).then(moreInfo => {
                // console.log("additional info", moreInfo);
                if (info.language !== "swedish") {
                    moreInfo.translation = [info.input];
                }
                moreInfo.type = info.type;
                moreInfo.swedish_word = moreInfo.infinitive || info.swedish_translation;

                setAdditionalInfo(moreInfo);
                onTranslationComplete(moreInfo as Translation);
            });
        });
    }, [word, settings, language]);


    const formattedOtherMeaning = getAlternativeMeaning(t as Translation);
    const isLoaded = !!basicInfo && !!t.explanation;

    return (
        <div className="flex flex-col w-full max-w-3xl pt-6 mx-auto stretch dark:text-gray-200">
            <div className="flex flex-row items-end w-full border-b mb-4 pb-1">
                <div className="flex-1 flex flex-wrap items-end">
                    {!basicInfo ? <div className="animate-pulse w-1/5 h-8 bg-gray-700 rounded-md mt-4" /> : <>
                        <div className="mr-1">{t.en_ett_word}</div>
                        <div className="font-bold text-5xl dark:text-white">{t.swedish_word || basicInfo?.swedish_translation}</div>
                        <div className="ml-1 pb-1">
                            <AudioPlayer text={t.swedish_word || basicInfo?.swedish_translation || ""} language="sv" />
                        </div>
                    </>}
                    {t.plural && <div className='flex flex-row'>
                        <div className="text-2xl pl-1">({t.plural})</div>
                    </div>}
                    {t.tenses && <div className='flex flex-row flex-wrap items-end'>
                        <div className="text-2xl">({t.tenses.presens}{t.tenses.past ? ", " + t.tenses.past : ""}{t.tenses.perfekt ? ", " + t.tenses.perfekt : ""})</div>
                        {t.irregular && <div className="text-base">(irregular)</div>}
                    </div>}
                    {!!t.adjective?.comparative && <div className='flex flex-row'>
                        <div className="text-3xl">({t.adjective.comparative}, {t.adjective.superlative})</div>
                    </div>}
                </div>
                {isLoaded ? <button className="hidden sm:block bg-blue-300 dark:bg-gray-700 p-1 px-2 rounded" style={{ marginBottom: "2px" }} onClick={() => onAddedToFlashcard()}>
                    New Search
                </button> : ""}
            </div>
            {isLoaded ? <div className='flex flex-row'>
                <div>{t.explanation}</div>
            </div> : <div className="h-4 bg-gray-700 rounded-md animate-pulse w-3/4"></div>}

            {basicInfo ? <div className='flex flex-row text-4xl mt-3 mb-3 dark:text-white'>
                <div>{(t.translation || [basicInfo?.translation]).join(", ")}{formattedOtherMeaning}</div>
            </div> : <div className="h-10 mt-3 mb-3 bg-gray-700 rounded-md animate-pulse w-1/2"></div>
            }

            {isLoaded ? <>
                <div className='flex flex-col italic mb-3'>
                    <div className="whitespace-pre-wrap">{highlightBoldText(t?.example_sentence?.swedish || "")}</div>
                    <div className="whitespace-pre-wrap">{highlightBoldText(t?.example_sentence?.english || "")}</div>
                    {!!t.example_sentence?.mother_tongue && <div className="whitespace-pre-wrap">{highlightBoldText(t.example_sentence.mother_tongue)}</div>}
                </div>
            </> : ""}
            {isLoaded ? <AddToDeckButton options={decks} onSelect={id => {
                addFlashcard(plugin, t as Translation, id, language as string);
                onAddedToFlashcard();
            }} /> : <TranslationSkeleton />}
            {/* for mobile view */}
            {isLoaded ? <button className="sm:hidden mt-2 bg-blue-300 dark:bg-gray-700 p-1 px-2 rounded-lg" onClick={() => onAddedToFlashcard()}>
                New Search
            </button> : ""}
        </div>
    );
}

function highlightBoldText(text: string) {
    const parts = text.split('**');
    if (parts.length === 1) return text;

    return <div>
        {parts.map((part, i) => {
            if (i % 2 === 0) return part;
            return <span key={i} className="font-bold">{part}</span>;
        })}
    </div>;
}

export const TranslationSkeleton = () => {
    return (
        <div className="flex flex-col space-y-2 max-w-md w-full">
            <div className="h-4 bg-gray-700 rounded-md animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded-md animate-pulse w-full"></div>
            <div className="h-4 bg-gray-700 rounded-md animate-pulse w-5/6"></div>
        </div>
    );
}; 
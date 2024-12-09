import { useEffect, useState } from "react";
import { usePlugin } from "shared-components";
import FlashcardController from "../deck/FlashcardController";
import { AudioPlayer } from "shared-components";
import AddToDeckButton from "../../components/DropDownButton";
import { FlashcardPluginSettings } from "../settings/SettingsPage";
import { PluginController } from "shared-components";

export interface Translation {
    swedish_word: string;
    translation: string[];
    translation_alternative_meaning?: string;
    translation_noun_singular: string[];
    example_sentence: {
        swedish: string;
        english: string;
        mother_tongue: string;
    };
    type: string;
    explanation: string;
    singular?: string;
    plural?: string;
    en_ett_word?: string;
    infinitive?: string;
    tenses?: {
        present: string;
        past: string;
        supine: string;
        imperative: string;
    };
    irregular?: boolean;
    adjective?: {
        comparative: string;
        superlative: string;
    }
}

interface Props {
    word: string;
    onAddedToFlashcard: () => void;
    onTranslationComplete: (t: Translation) => void;
}

export default function TranslationEntry({ onTranslationComplete, word, onAddedToFlashcard }: Props) {
    const [t, setTranslation] = useState<Translation | null>(null);
    const [decks, setDecks] = useState<any[]>([]);
    const plugin = usePlugin();
    const [settings, setSettings] = useState<FlashcardPluginSettings | null>(null);

    console.log({ settings, translation: t });

    useEffect(() => {
        plugin.getSettings<FlashcardPluginSettings>({
            motherTongue: "English",
            translation_term_one: "one",
            translation_term_or: "or",
            ttsTags: ["lang"]
        }).then(setSettings);
        plugin.dbFetch('deck', "id, name, last_used")
            .then(decks => decks.sort((a: any, b: any) => new Date(b.last_used).getTime() - new Date(a.last_used).getTime())).then(setDecks);
    }, []);

    useEffect(() => {
        setTranslation(null);
        if (!word || !settings) return

        getLookedUpWord(word, settings.motherTongue, plugin).then(translation => {
            setTranslation(translation);
            onTranslationComplete(translation);
        });
    }, [word, settings]);

    if (!t) {
        return <div className="mx-auto mt-48 w-full max-w-32">
            Loading....
        </div>
    }

    const swedishWord = t.infinitive || t.swedish_word;
    let alt = (t.translation_alternative_meaning || "");

    if (t.translation.includes(alt) || alt.toLowerCase() === "n/a") {
        alt = "";
    }

    const formattedOtherMeaning = alt ? ` ${settings?.translation_term_or} ${alt}` : "";

    return (
        <div className="flex flex-col w-full max-w-3xl pt-6 mx-auto stretch dark:text-gray-200">
            <div className="flex flex-row items-end w-full border-b mb-4 pb-1">
                <div className="flex-1 flex flex-wrap items-end">
                    <div className="mr-1">{t.en_ett_word}</div>
                    <div className="font-bold text-5xl dark:text-white">{swedishWord}</div>
                    <div className="ml-1 pb-1">
                        <AudioPlayer text={"(swedish:) " + swedishWord} />
                    </div>
                    {t.singular && <div className='flex flex-row'>
                        <div className="text-2xl pl-1">({t.singular}/{t.plural})</div>
                    </div>}
                    {t.tenses && <div className='flex flex-row flex-wrap items-end'>
                        <div className="text-2xl">({t.tenses.present}, {t.tenses.past}, {t.tenses.supine}, {t.tenses.imperative})</div>
                        {t.irregular && <div className="text-base">(irregular)</div>}
                    </div>}
                    {!!t.adjective?.comparative && <div className='flex flex-row'>
                        <div className="text-3xl">({t.adjective.comparative}, {t.adjective.superlative})</div>
                    </div>}
                </div>
                <button className="bg-blue-300 dark:bg-gray-700 p-1 px-2 rounded" style={{ marginBottom: "2px" }} onClick={() => onAddedToFlashcard()}>
                    New Search
                </button>
            </div>
            <div className='flex flex-row'>
                <div>{t.explanation}</div>
            </div>

            <div className='flex flex-row text-4xl mt-3 mb-3 dark:text-white'>
                <div>{t.translation.join(", ")}{formattedOtherMeaning}</div>
            </div>

            <div className='flex flex-col italic mb-3'>
                <div className="whitespace-pre-wrap">{highlightBoldText(t.example_sentence.swedish)}</div>
                <div className="whitespace-pre-wrap">{highlightBoldText(t.example_sentence.english)}</div>
                {!!t.example_sentence.mother_tongue && <div className="whitespace-pre-wrap">{highlightBoldText(t.example_sentence.mother_tongue)}</div>}
            </div>
            <AddToDeckButton options={decks} onSelect={id => {
                console.log("translation", t);
                const controller = new FlashcardController(plugin);

                const isEtt = t.en_ett_word === "ett";
                const targetTranslation = t.translation_noun_singular || t.translation;

                controller.add({
                    front: (isEtt ? settings?.translation_term_one + " " : "") + targetTranslation[0] + formattedOtherMeaning,
                    back: getBackPage(t),
                    deckId: id,
                    frontTags: ["lang", "lang:" + settings?.motherTongue],
                    backTags: ["lang", "lang:swedish"],
                })
                onAddedToFlashcard();
            }} />
        </div>
    );
}

function getBackPage(t: Translation) {
    let backPage = t.infinitive || t.swedish_word;
    const isEtt = t.en_ett_word === "ett";

    if (t.type === "noun") {
        backPage = `${isEtt ? "ett " : ""}${t.singular} (${t.plural})`;
    } else if (t.type === "verb") {
        const { present, past, supine, imperative } = t.tenses!;
        if (t.irregular) {
            backPage += `  \n(${present}, ${past}, ${supine}, ${imperative})`;
        }
        return backPage;
    } else if (t.type === "adjective") {
        backPage = `${t.swedish_word}  \n(${t.adjective!.comparative}, ${t.adjective!.superlative})`;
    }
    return backPage;
}

async function getLookedUpWord(word: string, targetLanguage: string = "german", plugin: PluginController): Promise<Translation> {
    const prompt = `
    You are a language processing assistant specialized in Swedish vocabulary. When given a Swedish word, your task is to provide a JSON-formatted output with the following information:

    1. The word itself.
    2. A short, easy example sentence using the word in Swedish.
    3. Translations of the word into ${targetLanguage} (provide multiple appropriate terms, if applicable).
    4. The example sentence translated into both English and ${targetLanguage}. The word is highlighted in the sentences.
    5. The word's type (e.g., noun, verb, adjective, etc.).
    6. A clear explanation of the word in English.
    7. If it has a second meaning, provide an alternative ${targetLanguage} translation.
    8. Additional information based on the word's type:
    - **For nouns**:
      - Singular and plural form.
      - Indicate if it is an 'en' or 'ett' word.
    - **For verbs**:
      - All tenses: present, past, supine, and imperative in swedish.
      - The word's infinitive form in swedish.
      - State whether it is a regular or irregular verb.
    - **For adjectives**:
      - Comparative form.
      - Superlative form.

    Ensure the JSON is correctly structured and free of errors.

    ### Example Input:
    "fjäll"

    ### Example Output for german:
    \`\`\`json
    {
        "swedish_word": "fjäll",
        "type": "noun",
        "translation": ["Berge", "Gebirge"],
        "translation_alternative_meaning": "Schuppen (bei Tieren)", 
        "translation_noun_singular": ["Berg"],   
        "example_sentence": {
            "swedish": "Vi vandrade i **fjällen** i somras.",
            "english": "We hiked in **the mountains** last summer.",
            "mother_tongue": "Wir wanderten letzten Sommer im **Gebirge**."
        },
        "explanation": "Can mean a mountain range or fell (in Scandinavia) or scales (on animals).",
        "singular": "fjäll",
        "plural": "fjäll",
        "en_ett_word": "en"  
    }

    ### Example Output (with additional information for verbs):
    \`\`\`json
    {
        "infinitive": "springa",
        "en_ett_word": ""  
        ....
        "tenses": {
            "present": "springer",
            "past": "sprang",
            "supine": "har sprungit",
            "imperative": "spring"
        },
        "irregular": false
    }

    ### Example Output (with additional information for adjectives):
    \`\`\`json
    {
        "swedish_word": "stor",
        "en_ett_word": ""  
        ....
        "adjective": {
            "comparative": "större",
            "superlative": "störst"
        }
    }

    The target language is: ${targetLanguage}
    \`\`\``;

    return await plugin.getAIResponse([
        { role: 'system', content: prompt },
        { role: 'user', content: "Look up the word(s): " + word }])
        //remove first and last line
        .then((json: any) => JSON.parse(json.split('\n').slice(1, -1).join('\n')));
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
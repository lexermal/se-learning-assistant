import { useEffect, useState } from "react";
import { usePlugin } from "../../../utils/PluginProvider";
import FlashcardController from "../../deck/FlashcardController";
import AddToDeckButton from "./DropDownButton";

export interface Translation {
    swedish_word: string;
    translation_german: string[];
    alternative_german_meaning?: string;
    translation_german_word_singular: string[];
    example_sentence: {
        swedish: string;
        english: string;
        german: string;
    };
    type: string;
    explanation: string;
    singular?: string;
    plural?: string;
    en_ett_word?: string;
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
    console.log(t);

    useEffect(() => {
        plugin.dbFetch('deck', "id, name, last_used")
            .then(decks => decks.sort((a: any, b: any) => new Date(b.last_used).getTime() - new Date(a.last_used).getTime())).then(setDecks);

        getLookedUpWord(word).then(translation => {
            setTranslation(translation);
            onTranslationComplete(translation);
        });
    }, []);

    if (!t) {
        return <div className="mx-auto mt-48 w-full max-w-32">
            Loading....
        </div>
    }

    return (
        <div className="flex flex-col w-full max-w-xl pt-6 mx-auto stretch">
            <div className="flex flex-wrap items-end border-b mb-4 pb-1">
                <div className="mr-1">{t.en_ett_word}</div>
                <div className="font-bold text-5xl">{t.swedish_word}</div>
                {t.singular && <div className='flex flex-row'>
                    <div className="text-3xl pl-1">({t.singular}/{t.plural})</div>
                </div>}
                {t.tenses && <div className='flex flex-row flex-wrap items-end'>
                    <div className="text-2xl">({t.tenses.present}, {t.tenses.past}, {t.tenses.supine}, {t.tenses.imperative})</div>
                    {t.irregular && <div className="text-sm">(irregular)</div>}
                </div>}
                {t.adjective && <div className='flex flex-row'>
                    <div className="text-3xl">({t.adjective.comparative}, {t.adjective.superlative})</div>
                </div>}
            </div>
            <div className='flex flex-row'>
                <div>{t.explanation}</div>
            </div>

            <div className='flex flex-row text-4xl mt-3 mb-3'>
                <div>{t.translation_german.join(", ")} oder {t.alternative_german_meaning}</div>
            </div>

            <div className='flex flex-col italic mb-2'>
                <div className="whitespace-pre-wrap">{highlightBoldText(t.example_sentence.swedish)}</div>
                <div className="whitespace-pre-wrap">{highlightBoldText(t.example_sentence.english)}</div>
                <div className="whitespace-pre-wrap">{highlightBoldText(t.example_sentence.german)}</div>
            </div>
            <AddToDeckButton options={decks} onSelect={id => {
                console.log("translation", t);
                const controller = new FlashcardController(plugin);
                let backPage = t.swedish_word;

                if (t.type === "noun") {
                    backPage = `${t.en_ett_word === "ett" ? "ett " : ""}${t.singular} (${t.plural})`;
                } else if (t.type === "verb") {
                    const { present, past, supine, imperative } = t.tenses!;
                    if (t.irregular) {
                        backPage = `
                        (${present}, ${past}, ${supine}, ${imperative})`;
                    }
                } else if (t.type === "adjective") {
                    const { comparative, superlative } = t.adjective!;
                    backPage = `${t.swedish_word}
                    (${comparative}, ${superlative})`;
                }
                const germanTranslation = t.translation_german_word_singular || t.translation_german;
                const alternativeMeaning = t.alternative_german_meaning ? ` oder ${t.alternative_german_meaning}` : "";
                controller.add(germanTranslation[0] + alternativeMeaning, backPage, id);
                onAddedToFlashcard();
            }} />
        </div>
    );
}

async function getLookedUpWord(word: string) {
    const prompt = `
    You are a language processing assistant specialized in Swedish vocabulary. When given a Swedish word, your task is to provide a JSON-formatted output with the following information:

    1. The word itself.
    2. A short, easy example sentence using the word in Swedish.
    3. Translations of the word into German (provide multiple appropriate terms, if applicable).
    4. The example sentence translated into both English and German. The word is highlighted in the sentences.
    5. The word's type (e.g., noun, verb, adjective, etc.).
    6. A clear explanation of the word in English.
    7. If it has a second meaning, provide an alternative German translation.
    8. Additional information based on the word's type:
    - **For nouns**:
      - Singular and plural form.
      - Indicate if it is an 'en' or 'ett' word.
    - **For verbs**:
      - All tenses: present, past, supine, and imperative.
      - State whether it is a regular or irregular verb.
    - **For adjectives**:
      - Comparative form.
      - Superlative form.

    Ensure the JSON is correctly structured and free of errors.

    ### Example Input:
    "fjäll"

    ### Example Output:
    \`\`\`json
    {
        "swedish_word": "fjäll",
        "type": "noun",
        "translation_german": ["Berge", "Gebirge"],
        "alternative_german_meaning": "Schuppen (bei Tieren)", 
        "translation_german_word_singular": ["Berg"],   
        "example_sentence": {
            "swedish": "Vi vandrade i **fjällen** i somras.",
            "english": "We hiked in **the mountains** last summer.",
            "german": "Wir wanderten letzten Sommer im **Gebirge**."
        },
        "explanation": "Can mean a mountain range or fell (in Scandinavia) or scales (on animals).",
        "singular": "fjäll",
        "plural": "fjäll",
        "en_ett_word": "en"  
    }

    ### Example Output (with additional information for verbs):
    \`\`\`json
    {
        "swedish_word": "springa",
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
    \`\`\``;

    return await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [{ role: 'system', content: prompt }, { role: 'user', content: "Look uo the word(s): " + word }] })
    })
        .then(r => r.json())
        //remove first and last line
        .then(json => JSON.parse(json.messages[0].content[0].text.split('\n').slice(1, -1).join('\n')));
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
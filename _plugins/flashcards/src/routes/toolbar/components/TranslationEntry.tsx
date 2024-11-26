import { useEffect, useState } from "react";
import { usePlugin } from "../../../utils/PluginProvider";
import FlashcardController from "../../deck/FlashcardController";
import AddToDeckButton from "./DropDownButton";

export interface Translation {
    word: string;
    translation_german: string[];
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

export default function TranslationEntry({ onTranslationComplete, word }: { word: string, onTranslationComplete: (t: Translation) => void }) {
    const [t, setTranslation] = useState<Translation | null>(null);
    const [decks, setDecks] = useState<any[]>([]);
    const plugin = usePlugin();
    console.log(t);

    useEffect(() => {
        plugin.dbFetch('deck', "id, name").then(setDecks);
        getLookedUpWord(word).then(setTranslation);
    }, []);

    if (!t) {
        return <div className="">
            Loading....
        </div>
    }

    return (
        <div className="flex flex-col w-full max-w-md pt-6 mx-auto stretch">
            <div className="items-end border-b mb-4">
                <div className="mr-1">{t.en_ett_word}</div>
                <div className="font-bold text-5xl">{t.word}</div>
                {t.singular && <div className='flex flex-row'>
                    <div className="text-3xl pl-1">({t.singular}/{t.plural})</div>
                </div>}
                {t.tenses && <div className=''>
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
                <div>{t.translation_german.join("/")}</div>
            </div>

            <div className='flex flex-col italic'>
                <div className="whitespace-pre-wrap">{highlightBoldText(t.example_sentence.swedish)}</div>
                <div className="whitespace-pre-wrap">{highlightBoldText(t.example_sentence.english)}</div>
                <div className="whitespace-pre-wrap">{highlightBoldText(t.example_sentence.german)}</div>
            </div>
            <AddToDeckButton options={decks} onSelect={id => {
                const controller = new FlashcardController(plugin);
                if (t.type === "noun") {
                    controller.add(t.translation_german.join(", "), `${t.en_ett_word === "ett" ? "ett " : ""}${t.singular} (${t.plural})`, id);
                } else if (t.type === "verb") {
                    const { present, past, supine, imperative } = t.tenses!;
                    controller.add(t.translation_german.join(", "), `${t.word} (${present}, ${past}, ${supine}, ${imperative})`, id);
                } else if (t.type === "adjective") {
                    const { comparative, superlative } = t.adjective!;
                    controller.add(t.translation_german.join(", "), `${t.word} (${comparative}, ${superlative})`, id);
                } else {
                    controller.add(t.translation_german.join(", "), t.word, id);
                }
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
    7. Additional information based on the word's type:
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
        "word": "fjäll",
        "type": "noun",
        "translation_german": ["Berge", "Gebirge", "Schuppen (bei Tieren)"],
        "example_sentence": {
            "swedish": "Vi vandrade i **fjällen** i somras.",
            "english": "We hiked in **the mountains** last summer.",
            "german": "Wir wanderten letzten Sommer im **Gebirge**."
        },
        "explanation": "Can mean a mountain range or fell (in Scandinavia) or scales (on animals).",
        "singular": "fjäll",
        "plural": "fjäll",
        "en_ett_word": "en"  //empty if not applicable
    }

    ### Example Output (with additional information for verbs):
    \`\`\`json
    {
        "word": "springa",
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
        "word": "stor",
        ....
        "adjective": {
            "comparative": "större",
            "superlative": "störst"
        }
    }

    \`\`\``;
    // If the word does not exist in english, swedish or german set "The word does not exist in the dictionary." as description and leave all other properties empty.

    return await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [{ role: 'system', content: prompt }, { role: 'user', content: word }] })
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
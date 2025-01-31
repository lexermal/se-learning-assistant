import { useEffect, useState } from "react";
import { usePlugin, UserSettings } from "shared-components";
import FlashcardController from "../deck/FlashcardController";
import { AudioPlayer } from "shared-components";
import AddToDeckButton from "../../components/DropDownButton";
import { FlashcardPluginSettings } from "../settings/SettingsPage";
import { PluginController } from "shared-components";

export interface Translation {
    swedish_word: string;
    translation: string[];
    alternative_meaning?: string;
    translation_noun_singular: string[];
    example_sentence: {
        swedish: string;
        english: string;
        mother_tongue: string;
    };
    type: string;
    explanation: string;
    plural?: string;
    en_ett_word?: string;
    infinitive?: string;
    tenses?: {
        presens: string;
        past: string;
        perfekt: string;
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
    const [basicInfo, setBasicInfo] = useState<BasicWordInfo | null>(null);
    const [additionalInfo, setAdditionalInfo] = useState<Partial<Translation> | null>(null);
    const [decks, setDecks] = useState<any[]>([]);
    const plugin = usePlugin();
    const [settings, setSettings] = useState<FlashcardPluginSettings | null>(null);
    const [language, setLanguage] = useState<string | null>(null);

    console.log({ settings, basicInfo, language });

    useEffect(() => {
        plugin.getSettings<FlashcardPluginSettings>({
            translation_term_one: "one",
            translation_term_or: "or",
            ttsTags: ["lang"]
        }).then(setSettings);

        plugin.getSettings<UserSettings>({ motherTongue: "English", languageLevel: "A1" }, "user").then(s => setLanguage(s.motherTongue));

        plugin.dbFetch('deck', "id, name, last_used")
            .then(decks => decks.sort((a: any, b: any) => new Date(b.last_used).getTime() - new Date(a.last_used).getTime())).then(setDecks);
    }, []);

    useEffect(() => {
        setBasicInfo(null);
        setAdditionalInfo(null);
        if (!word || !settings) return;

        getBasicWordInfo(word, plugin).then(info => {
            console.log("basic info", info);
            setBasicInfo(info);

            getAdditionalWordInfo(info, language as string, plugin).then(moreInfo => {
                console.log("additional info", moreInfo);
                moreInfo.type = info.type;
                moreInfo.swedish_word = info.swedish_translation;
                if (info.language !== "swedish") {
                    moreInfo.translation = [info.input];
                }

                setAdditionalInfo(moreInfo);
                onTranslationComplete(moreInfo as Translation);
            });
        });
    }, [word, settings]);

    const t = { ...additionalInfo } as Translation;
    t.swedish_word = basicInfo?.swedish_translation || "";
    t.type = basicInfo?.type || "";

    const swedishWord = t.infinitive || t.swedish_word;
    let alt = (t.alternative_meaning || "");

    if (t.translation?.includes(alt) || alt.toLowerCase() === "n/a" || t.translation?.some((x: string) => x.toLowerCase().includes(alt.substring(0, alt.indexOf("(")).toLowerCase().trim()))) {
        alt = "";
    }

    const formattedOtherMeaning = alt ? `, ${alt}` : "";

    return (
        <div className="flex flex-col w-full max-w-3xl pt-6 mx-auto stretch dark:text-gray-200">
            <div className="flex flex-row items-end w-full border-b mb-4 pb-1">
                <div className="flex-1 flex flex-wrap items-end">
                    {!basicInfo ? <div className="animate-pulse w-1/5 h-8 bg-gray-700 rounded-md mt-4" /> : <>
                        <div className="mr-1">{t.en_ett_word}</div>
                        <div className="font-bold text-5xl dark:text-white">{swedishWord}</div>
                        <div className="ml-1 pb-1">
                            <AudioPlayer text={swedishWord} language="sv" />
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
                {additionalInfo ? <button className="hidden sm:block bg-blue-300 dark:bg-gray-700 p-1 px-2 rounded" style={{ marginBottom: "2px" }} onClick={() => onAddedToFlashcard()}>
                    New Search
                </button> : ""}
            </div>
            <div className='flex flex-row'>
                <div>{t.explanation}</div>
            </div>

            {additionalInfo ? <>
                <div className='flex flex-row text-4xl mt-3 mb-3 dark:text-white'>
                    <div>{t.translation.join(", ") || ""}{formattedOtherMeaning}</div>
                </div>

                <div className='flex flex-col italic mb-3'>
                    <div className="whitespace-pre-wrap">{highlightBoldText(t?.example_sentence?.swedish || "")}</div>
                    <div className="whitespace-pre-wrap">{highlightBoldText(t?.example_sentence?.english || "")}</div>
                    {!!t.example_sentence?.mother_tongue && <div className="whitespace-pre-wrap">{highlightBoldText(t.example_sentence.mother_tongue)}</div>}
                </div>
            </> : ""}
            {additionalInfo ? <AddToDeckButton options={decks} onSelect={id => {
                // console.log("translation", t);
                const controller = new FlashcardController(plugin);

                const isEtt = t.en_ett_word === "ett";
                const targetTranslation = t.translation_noun_singular || t.translation;

                controller.add({
                    front: (isEtt ? settings?.translation_term_one + " " : "") + targetTranslation[0] + formattedOtherMeaning,
                    back: getBackPage(t),
                    deckId: id,
                    frontTags: ["lang", "lang:" + language],
                    backTags: ["lang", "lang:swedish"],
                })
                onAddedToFlashcard();
            }} /> : <TranslationSkelleton />}
            {/* for mobile view */}
            {additionalInfo ? <button className="sm:hidden mt-2 bg-blue-300 dark:bg-gray-700 p-1 px-2 rounded-lg" onClick={() => onAddedToFlashcard()}>
                New Search
            </button> : ""}
        </div>
    );
}

function getBackPage(t: Translation) {
    let backPage = t.infinitive || t.swedish_word;
    const isEtt = t.en_ett_word === "ett";

    if (t.type === "noun") {
        backPage = `${isEtt ? "ett " : ""}${t.swedish_word} (${t.plural})`;
    } else if (t.type === "verb") {
        const { presens: present, past, perfekt: supine } = t.tenses!;
        if (t.irregular) {
            backPage += `  \n(${present}, ${past}, ${supine})`;
        }
        return backPage;
    } else if (t.type === "adjective") {
        backPage = `${t.swedish_word}  \n(${t.adjective!.comparative}, ${t.adjective!.superlative})`;
    }
    return backPage;
}

interface BasicWordInfo {
    input: string;
    language: string;
    type: string;
    swedish_translation: string;
}

async function getBasicWordInfo(word: string, plugin: PluginController): Promise<BasicWordInfo> {
    const prompt = `
You are a language assistant specialized in Swedish vocabulary. For the given word or phrase, provide a JSON-formatted output with the following information:

1. If the input is a sentence or a multi-word phrase (like "Jag söva i huset" or "laga mat"), return it as is in "swedish_word".
2. If the input is a single word with an article or in conjugated form (like "att söva"), strip any articles or conjugations, and return the base form of the word in presents in "swedish_word".
3. Determine the word's type (e.g., noun, verb, adjective, phrase, sentence, etc.). For phrases and sentences, set the type accordingly.
4. Determine the language of the input (e.g., Swedish).
5. If gramatically mistakes are found in the input fix them and return the corrected sentence.

Ensure the JSON is correctly structured and free of errors.

English can also be the input language.

### Examples:

#### Input:
"Jag söva i huset."

#### Output:
\`\`\`json
{
    "gramatically_corrected_input_text": "Jag sover i huset.",
    "input_word_language": "swedish",
    "type": "sentence",
    "swedish_base_word_translation": "Jag söva i huset."
}
\`\`\`

#### Input:
"to sleepg"

#### Output:
\`\`\`json
{
    "gramatically_corrected_input_text": "to sleep",
    "input_word_language": "english",
    "type": "verb",
    "swedish_base_word_translation": "söva"
}
\`\`\`

#### Input:
"laga mmat"

#### Output:
\`\`\`json
{
    "gramatically_corrected_input_text": "laga mat",
    "input_word_language": "swedish",
    "type": "phrase",
    "swedish_base_word_translation": "laga mat"
}
\`\`\`

#### Input:
"Flöteg"

#### Output:
\`\`\`json
{
    "gramatically_corrected_input_text": "Flöte",
    "input_word_language": "german",
    "type": "noun",
    "swedish_base_word_translation": "flöjt"
}

For all outputs, ensure that "swedish_word" contains the appropriate form of the word or phrase, and "type" reflects its correct grammatical category.

`;

    return await plugin.getAIResponse([
        { role: 'system', content: prompt },
        { role: 'user', content: "Look up the word or phrase: " + word }
    ]).then(json => JSON.parse(json.split('\n').slice(1, -1).join('\n'))).then((json: any) => ({
        input: json.gramatically_corrected_input_text,
        language: json.input_word_language,
        type: json.type,
        swedish_translation: json.swedish_base_word_translation
    }));
}

async function getAdditionalWordInfo(i: BasicWordInfo, targetLanguage: string, plugin: PluginController): Promise<Partial<Translation>> {
    const prompt = `
You are a language assistant specialized in Swedish vocabulary. Provide a JSON-formatted output with the following information for the given word:

- "translation": Array of direct translations of the Swedish word into ${targetLanguage} (provide multiple appropriate terms, if applicable).
- "alternative_meaning": Alternative meaning of the word in ${targetLanguage}, if any.
- "example_sentence": Object containing:
    - "swedish": A short, easy example sentence using the word in Swedish, with the word highlighted using **.
    - "english": The example sentence translated into English, with the word highlighted using **.
    - "mother_tongue": The example sentence translated into ${targetLanguage}, with the word highlighted using **.
- "explanation": A clear explanation of the word in ${(targetLanguage || "").toUpperCase()}.

Include additional fields based on the word's type to fit the Translation interface:

- For nouns:
    - "plural": The plural form.
    - "en_ett_word": Indicate if it is an 'en' or 'ett' word.
- For verbs:
    - "infinitive": The infinitive form.
    - "tenses": Object containing "presens", "past", and "perfekt" forms in Swedish.
    - "irregular": Boolean indicating whether it is a regular or irregular verb.
- For adjectives:
    - "adjective": Object containing "comparative" and "superlative" forms.
- For phrases or sentences:
    - Only include the "translation", "explanation" and "example_sentence" fields.

Ensure the JSON is correctly structured and matches the Translation interface on line 9, including all necessary fields. If a field is not applicable, include it with an appropriate value or an empty string.

The target language to translate to is ${targetLanguage}.

### Example Outputs (when translation target language is "German"):

#### For a Verb:

Input:
"springa"

Output:
\`\`\`json
{
    "translation": ["laufen"],
    "alternative_meaning": "",
    "example_sentence": {
        "swedish": "Jag **springer** varje morgon.",
        "english": "I **run** every morning.",
        "mother_tongue": "Ich **laufe** jeden Morgen."
    },
    "explanation": "Sich schnell zu Fuß fortbewegen.",
        "infinitive": "springa",
        "infinitive": "springa",
        "en_ett_word": ""  
        ....
    "infinitive": "springa",
        "en_ett_word": ""  
        ....
    "tenses": {
        "presens": "springer",
        "past": "sprang",
        "perfekt": "har sprungit"
    },
    "irregular": false
}
\`\`\`

#### For a Noun:

Input:
"fjäll"

Output:
\`\`\`json
{
    "translation": ["Gebirge", "Fjäll"],
    "alternative_meaning": "Schuppen (bei Tieren)",
    "example_sentence": {
        "swedish": "Vi vandrade i **fjällen** i somras.",
        "english": "We hiked in **the mountains** last summer.",
        "mother_tongue": "Wir wanderten letzten Sommer im **Gebirge**."
    },
    "explanation": "Eine Bergregion oder Hochebene in Skandinavien; kann auch Schuppen bei Tieren bedeuten.",
    "plural": "fjäll",
    "en_ett_word": "ett"
}
\`\`\`

#### For an Adjective:

Input:
"stor"

Output:
\`\`\`json
{
    "translation": ["groß"],
    "alternative_meaning": "",
    "example_sentence": {
        "swedish": "Det är ett **stort** hus.",
        "english": "It is a **big** house.",
        "mother_tongue": "Es ist ein **großes** Haus."
    },
    "explanation": "Von beträchtlicher Größe oder Ausdehnung.",
    "adjective": {
        "comparative": "större",
        "superlative": "störst"
    }
}
\`\`\`

Input:
"Skog är full av träd."

Output:
\`\`\`json
{
    "translation": ["Der Wald ist voller Bäume."],
    "example_sentence": {
        "swedish": "Skog är full av träd.",
        "english": "The forest is full of trees.",
        "mother_tongue": "Der Wald ist voller Bäume."
    },
    "explanation": "Ein großes, dichtes Gebiet mit vielen Bäumen."
}
\`\`\`

Please ensure that all relevant fields are included to fit the Translation interface defined on line 9. If any field is missing for a particular word type, include it with an appropriate value or an empty string if not applicable.
`;
    return await plugin.getAIResponse([
        { role: 'system', content: prompt },
        { role: 'user', content: `Get more details for the ${i.type}: ${i.input}(${i.language})` }
    ]).then((json: any) => JSON.parse(json.split('\n').slice(1, -1).join('\n')));
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


const TranslationSkelleton = () => {
    return (
        <div className="flex flex-col space-y-2 max-w-md w-full">
            <div className="h-4 bg-gray-700 rounded-md animate-pulse w-3/4"></div>
            <div className="h-10 bg-gray-700 rounded-md animate-pulse w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded-md animate-pulse w-3/4 mt-5"></div>
            <div className="h-4 bg-gray-700 rounded-md animate-pulse w-full"></div>
            <div className="h-4 bg-gray-700 rounded-md animate-pulse w-5/6"></div>
        </div>
    );
};
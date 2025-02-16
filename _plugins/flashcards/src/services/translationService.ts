import { RimoriClient } from "shared-components";
import { BasicWordInfo, Translation } from "../types/translation";

export async function getBasicWordInfo(word: string, targetLanguage: string, plugin: RimoriClient): Promise<BasicWordInfo> {
    const prompt = `
    You are a language assistant specialized in Swedish vocabulary. For the given word or phrase, provide a JSON-formatted output with the following information:
    
    1. If the input is a sentence or a multi-word phrase (like "Jag söva i huset" or "laga mat"), return it as is in "swedish_word".
    2. If the input is a single word with an article or in conjugated form (like "att söva"), strip any articles or conjugations, and return the base form of the word in presents in "swedish_word".
    3. Determine the word's type (e.g., noun, verb, adjective, phrase, sentence, etc.). For phrases and sentences, set the type accordingly.
    4. Determine the language of the input (e.g., Swedish).
    5. If gramatically mistakes are found in the input fix them and return the corrected sentence.
    6. Translate the word to ${targetLanguage}.
    
    Ensure the JSON is correctly structured and free of errors.
    
    Often the input language is English, Swedish or ${targetLanguage}.
    
    ### Examples:

    #### Input:
    text: "Jag söva i huset."
    target language: german
    
    #### Output:
    \`\`\`json
    {
        "gramatically_corrected_input_text": "Jag sover i huset.",
        "detected_input_word_language": "swedish",
        "type": "sentence",
        "swedish_base_word_translation": "Jag söva i huset.",
        "translation": "Ich schlafe im Haus."
    }
    \`\`\`
    
    #### Input:
    text: "to sleep"
    target language: french
    
    #### Output:
    \`\`\`json
    {
        "gramatically_corrected_input_text": "to sleep",
        "detected_input_word_language": "english",
        "type": "verb",
        "swedish_base_word_translation": "söva",
        "translation": "dormir"
    }
    \`\`\`
    
    #### Input:
    text: "laga mat"
    target language: english
    
    #### Output:
    \`\`\`json
    {
        "gramatically_corrected_input_text": "laga mat",
        "detected_input_word_language": "swedish",
        "type": "phrase",
        "swedish_base_word_translation": "laga mat",
        "translation": "cooking"
    }
    \`\`\`
    
    #### Input:
    text: "Flöteg"
    target language: german
    
    #### Output:
    \`\`\`json
    {
        "gramatically_corrected_input_text": "Flöte",
        "detected_input_word_language": "german",
        "type": "noun",
        "swedish_base_word_translation": "flöjt",
        "translation": "Flöte"
    }
    \`\`\`
    For all outputs, ensure that "swedish_word" contains the appropriate form of the word or phrase, and "type" reflects its correct grammatical category.
    `;


    return await plugin.getAIResponse([
        { id: '1', role: 'system', content: prompt },
        { id: '2', role: 'user', content: "Look up the word or phrase: " + word }
    ]).then(json => JSON.parse(json.split('\n').slice(1, -1).join('\n'))).then((json: any) => ({
        input: json.gramatically_corrected_input_text,
        language: json.detected_input_word_language,
        type: json.type,
        swedish_translation: json.swedish_base_word_translation,
        translation: json.translation
    }));
}

export async function getAdditionalWordInfo(i: BasicWordInfo, targetLanguage: string, plugin: RimoriClient): Promise<Partial<Translation>> {
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
        { id: '1', role: 'system', content: prompt },
        { id: '2', role: 'user', content: `Get more details for the ${i.type}: ${i.input}(${i.language})` }
    ]).then((json: any) => JSON.parse(json.split('\n').slice(1, -1).join('\n')));
}


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

export interface BasicWordInfo {
    type: string;
    input: string;
    language: string;
    translation: string;
    swedish_translation: string;
} 
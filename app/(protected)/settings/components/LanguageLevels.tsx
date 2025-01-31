import { useState, useEffect } from "react";

interface LanguageLevel {
    title: string;
    code: string;
    description: string[];
    example_sentence: string;
}

interface Props {
    initialLevel?: string;
    setSettings: (languageLevel: string) => void;
}

export default function LanguageLevelDisplay({ initialLevel, setSettings }: Props) {
    const [level, setLevel] = useState<LanguageLevel | null>(null);
    useEffect(() => {
        const level = languageLevels.find(l => l.code === initialLevel) || languageLevels[0];
        setLevel(level);
    }, [initialLevel]);

    const handleSetLevel = (level: LanguageLevel) => {
        setLevel(level);
        setSettings(level.code);
    }

    return (
        <div className="mb-6">
            <h1 className="text-xl font-bold mt-6">Language Level</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Select the language level that best matches your current abilities.
            </p>

            <div className="mt-2">
                <input
                    type="range"
                    min="0"
                    max={languageLevels.length - 1}
                    value={languageLevels.findIndex(l => l.code === level?.code)}
                    onChange={(e) => handleSetLevel(languageLevels[parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 px-1">
                    {languageLevels.map(l => (
                        <div key={l.code}>{l.code}</div>
                    ))}
                </div>
            </div>
            <h2 className="text-md font-bold mb-2 mt-4">
                {level?.title} <span className="text-gray-500">({level?.code})</span>
            </h2>
            <ul className="list-disc ml-6 mb-3">
                {level?.description.map((desc, index) => (
                    <li key={index} className="mb-1">{desc}</li>
                ))}
            </ul>
            <p className="italic text-gray-600 dark:text-gray-400">
                Example: {level?.example_sentence}
            </p>
        </div>
    );
}


const languageLevels = [
    {
        "title": "Beginner",
        "code": "Pre-A1",
        "description": [
            "Can introduce themselves with simple phrases.",
            "Can follow basic classroom instructions or simple questions.",
            "Can recognize and use a few basic words and phrases, such as greetings and simple objects.",
            "Can understand very slow, clear speech about familiar topics, such as family, colors, or food.",
        ],
        "example_sentence": "Jag heter Anna och jag bor i Sverige."
    },
    {
        "title": "Elementary",
        "code": "A1",
        "description": [
            "Can understand and use everyday expressions to meet basic needs, such as ordering food or asking for directions.",
            "Can have very simple conversations if the other person speaks slowly and clearly.",
            "Can describe their immediate surroundings using basic adjectives and nouns, such as colors, objects, and places.",
            "Can write very simple sentences, like 'I live in a small house' or 'I have a big family'."
        ],
        "example_sentence": "Kan jag få en kaffe, tack?"
    },
    {
        "title": "Pre-Intermediate",
        "code": "A2",
        "description": [
            "Can understand frequently used expressions related to personal information, shopping, and travel.",
            "Can talk about their past experiences, plans, and preferences in a simple way.",
            "Can communicate in routine situations, such as booking a hotel room or asking for help in a store.",
            "Can write short personal texts, such as notes, postcards, or simple emails."
        ],
        "example_sentence": "Igår köpte jag en ny jacka eftersom det är kallt ute."
    },
    {
        "title": "Intermediate",
        "code": "B1",
        "description": [
            "Can understand the main points of clear standard speech on familiar topics, such as work, school, and leisure.",
            "Can handle most travel situations and interact with locals using straightforward language.",
            "Can express personal opinions and feelings, and explain simple ideas in detail.",
            "Can write connected text on familiar topics, such as a diary entry or a simple article."
        ],
        "example_sentence": "När jag var barn, brukade jag leka i skogen med mina vänner."
    },
    {
        "title": "Upper-Intermediate",
        "code": "B2",
        "description": [
            "Can understand extended speech and follow complex discussions related to their area of interest or work.",
            "Can interact fluently and spontaneously with native speakers, making communication comfortable.",
            "Can explain viewpoints on different topics, giving advantages and disadvantages.",
            "Can produce clear, detailed text on a wide range of subjects, including reports and essays."
        ],
        "example_sentence": "Om jag hade mer tid, skulle jag resa till flera länder och uppleva nya kulturer."
    },
    {
        "title": "Advanced",
        "code": "C1",
        "description": [
            "Can understand long and complex texts, including technical discussions in their field.",
            "Can express themselves fluently and flexibly, even in social or professional settings.",
            "Can produce well-structured and detailed text on various subjects, adapting tone and style appropriately.",
            "Can use language effectively for academic, professional, and social purposes."
        ],
        "example_sentence": "Trots att han inte höll med, kunde han förstå argumenten och diskutera dem på ett respektfullt sätt."
    },
    {
        "title": "Proficiency",
        "code": "C2",
        "description": [
            "Can understand virtually everything they hear or read, even abstract, technical, or literary content.",
            "Can summarize and reconstruct arguments from multiple sources, presenting them in a coherent way.",
            "Can express themselves with high precision, conveying subtle shades of meaning in any situation.",
            "Can write complex texts, such as academic papers, professional reports, or well-structured arguments."
        ],
        "example_sentence": "Att kunna anpassa sitt språk beroende på situationen är avgörande för effektiv kommunikation."
    },
    {
        "title": "University",
        "code": "Post-C2",
        "description": [
            "Can use the language at a near-native level, understanding cultural references and idiomatic expressions.",
            "Can participate effortlessly in complex discussions, even on highly specialized or philosophical topics.",
            "Can write at an academic or professional level, producing well-researched and structured content.",
            "Can adapt their language style depending on the audience, purpose, and social context."
        ],
        "example_sentence": "Samhällets utveckling påverkas av en komplex växelverkan mellan historiska, ekonomiska och teknologiska faktorer."
    }
]

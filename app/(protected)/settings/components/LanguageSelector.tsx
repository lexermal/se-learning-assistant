import React, { useState, useEffect } from 'react';

export type Language = keyof typeof languages;

interface LanguageSelectorProps {
    initLang?: Language;
    className?: string;
    setLanguage: (lang: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ initLang, setLanguage, className }) => {
    const [selectedLanguage, setSelectedLanguage] = useState(initLang);

    useEffect(() => {
        initLang && setSelectedLanguage(initLang);
    }, [initLang]);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (event.target.value === selectedLanguage) return;
        const lang = event.target.value as Language;
        setSelectedLanguage(lang);
        setLanguage(lang);
    };

    return (
        <div className="flex flex-col mt-6">
            <h1 className="text-xl font-bold mb-2">Language</h1>
            <p className="text-sm mb-2">The language you most familiar with.</p>
            <select
                value={selectedLanguage}
                onChange={handleChange}
                className={"w-full dark:bg-gray-800 border-0 px-2 py-2 pr-8 rounded leading-tight focus:outline-none max-w-md " + (className || "")}>
                {Object.entries(languages)
                .sort(([, a], [, b]) => a.localeCompare(b))
                .map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                ))}
            </select>
        </div>
    );
};

export default LanguageSelector;

const languages = {
    Afrikaans: "Afrikaans",
    Arabic: "العربية",
    Armenian: "Հայերեն",
    Azerbaijani: "Azərbaycan",
    Belarusian: "Беларуская",
    Bosnian: "Bosanski",
    Bulgarian: "Български",
    Catalan: "Català",
    Chinese: "中文 (Mandarin, Simplified)",
    Croatian: "Hrvatski",
    Czech: "Čeština",
    Danish: "Dansk",
    Dutch: "Nederlands",
    English: "English",
    Estonian: "Eesti",
    Finnish: "Suomi",
    French: "Français",
    Galician: "Galego",
    German: "Deutsch",
    Greek: "Ελληνικά",
    Hebrew: "עברית",
    Hindi: "हिन्दी",
    Hungarian: "Magyar",
    Icelandic: "Íslenska",
    Indonesian: "Bahasa Indonesia",
    Italian: "Italiano",
    Japanese: "日本語",
    Kannada: "ಕನ್ನಡ",
    Kazakh: "Қазақша",
    Korean: "한국어",
    Latvian: "Latviešu",
    Lithuanian: "Lietuvių",
    Macedonian: "Македонски",
    Malay: "Bahasa Melayu",
    Marathi: "मराठी",
    Māori: "Te Reo Māori",
    Nepali: "नेपाली",
    Norwegian: "Norsk Bokmål",
    Persian: "فارسی",
    Polish: "Polski",
    Portuguese: "Português",
    Romanian: "Română",
    Russian: "Русский",
    Serbian: "Српски",
    Slovak: "Slovenčina",
    Slovenian: "Slovenščina",
    Spanish: "Español",
    Swahili: "Kiswahili",
    Swedish: "Svenska",
    Filipino: "Filipino",
    Tamil: "தமிழ்",
    Thai: "ไทย",
    Turkish: "Türkçe",
    Ukrainian: "Українська",
    Urdu: "اردو",
    Vietnamese: "Tiếng Việt",
    Welsh: "Cymraeg"
};
import { useState } from "react";
import { usePlugin } from "shared-components";
import { useEffect } from "react";

export interface FlashcardPluginSettings {
    ttsTags: string[];
    motherTongue: string;
    translation_term_or: string;
    translation_term_one: string;
}

export default function SettingsPage() {
    const [settings, setPageSettings] = useState<Partial<FlashcardPluginSettings> | null>(null);
    const { getSettings, setSettings } = usePlugin();
    const [isLoading, setIsLoading] = useState(true);

    function setSettingsWrapper(key: keyof FlashcardPluginSettings, value: any) {
        if (settings && settings[key] === value) return;

        if (key === "motherTongue") {
            // getFlashcardTerms(value).then(terms => {
            //     // console.log("Terms", terms);
            //     const newSettings = { ...settings, translation_term_or: terms.or, translation_term_one: terms.one, motherTongue: value };
            //     setPageSettings(newSettings);
            //     setSettings(newSettings);
            // });
        } else {
            setPageSettings({ ...settings, [key]: value });
            setSettings({ ...settings, [key]: value });
        }
    }

    useEffect(() => {
        getSettings<FlashcardPluginSettings>({
            motherTongue: "English",
            translation_term_one: "one",
            translation_term_or: "or",
            ttsTags: ["init"]
        }).then(data => {
            // console.log("Settings", data);
            setPageSettings(data);
            setIsLoading(false);

            if (data.ttsTags[0] === "init") {
                setSettingsWrapper("ttsTags", ["lang"]);
            }
        }
        );
    }, []);

    if (isLoading) return <div />;

    return <div className="text-lg flex flex-row flex-wrap items-center py-1 mt-2">
        <p>The plugin has no settings.</p>
        {/* <SettingsEntry
            title="Text-to-speech tags"
            description="These are the tags specifying which cards should support TTS.">
            <TagInput
                initialTags={settings?.ttsTags ?? ["lang"]}
                onTagsChange={(tags) => setSettingsWrapper("ttsTags", tags)}
                className="w-full pt-0 mt-0 pl-0" />
        </SettingsEntry>
        <SettingsEntry
            title="Mother tongue"
            description="The language you most familiar with.">
            <LanguageSelector initLang={lang as Language} setLanguage={(lang) => setSettingsWrapper("motherTongue", lang)} />
        </SettingsEntry> */}
    </div>
}

function capitalizeFirstLetter(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function SettingsEntry(props: { title: string, description: string, children: React.ReactNode }) {
    return <div className="bg-gray-400 dark:bg-gray-900 dark:text-gray-100 text-xl flex flex-row flex-wrap items-center rounded p-2 mb-3 w-full">
        <p className="text-lg w-full font-bold">{props.title}</p>
        <p className="text-sm">{props.description}</p>
        <div className="w-full pt-2">
            {props.children}
        </div>
    </div>
}

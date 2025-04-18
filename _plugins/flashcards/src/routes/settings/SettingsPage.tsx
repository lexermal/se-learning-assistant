import { useState } from "react";
import { useEffect } from "react";
import { usePlugin } from "@rimori/client";

export interface FlashcardPluginSettings {
    autoAddToDeck: boolean;
    autoPlayForeignNewFlashcards: boolean;
}

export default function SettingsPage() {
    const [settings, setPageSettings] = useState<Partial<FlashcardPluginSettings> | null>(null);
    const { getSettings, setSettings } = usePlugin();

    function setSettingState(key: keyof FlashcardPluginSettings, value: any) {
        if (settings && settings[key] === value) return;

        setPageSettings({ ...settings, [key]: value });
        setSettings({ ...settings, [key]: value });
    }

    useEffect(() => {
        getSettings<FlashcardPluginSettings>({
            autoAddToDeck: true,
            autoPlayForeignNewFlashcards: true,
        }).then(setPageSettings);
    }, []);

    return <div className="text-lg flex flex-row flex-wrap items-center py-1 mt-2">
        <SettingsEntry
            title="Auto-play new flashcards"
            description="If enabled, new flashcards with foreign language will automatically be played.">
            <div className="flex flex-row items-center">
                <input type="checkbox"
                    id="s1"
                    className="mr-2"
                    checked={settings?.autoPlayForeignNewFlashcards ?? true}
                    onChange={(e) => setSettingState("autoPlayForeignNewFlashcards", e.target.checked)} />
                <label htmlFor="s1" className="text-sm cursor-pointer">
                    Activate auto-play for new flashcards with foreign language?
                </label>
            </div>
        </SettingsEntry>
        <SettingsEntry
            title="Auto-add looked up words to flashcards"
            description="If enabled, looked up words will automatically be added to the flashcards.">
            <div className="flex flex-row items-center">
                <input type="checkbox"
                    id="s2"
                    className="mr-2"
                    checked={settings?.autoAddToDeck ?? true}
                    onChange={(e) => setSettingState("autoAddToDeck", e.target.checked)} />
                <label htmlFor="s2" className="text-sm cursor-pointer">Activate auto-add for looked up words?</label>
            </div>
        </SettingsEntry>
    </div>
}

function SettingsEntry(props: { title: string, description: string, children: React.ReactNode }) {
    return <div className="bg-gray-400 dark:bg-gray-900 dark:text-gray-100 text-xl flex flex-row flex-wrap 
    items-center rounded p-2 mb-3 w-full">
        <p className="text-lg w-full font-bold">{props.title}</p>
        <p className="text-sm">{props.description}</p>
        <div className="w-full pt-2">
            {props.children}
        </div>
    </div>
}

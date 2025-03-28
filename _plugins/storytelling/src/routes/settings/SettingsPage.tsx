import { useState } from "react";
import { useEffect } from "react";
import { AudioPlayOptions, AudioPlayOptionType, usePlugin } from "@rimori/client";

export interface FlashcardPluginSettings {
    readingSpeed: AudioPlayOptionType
}

export default function SettingsPage() {
    const [settings, setPageSettings] = useState<FlashcardPluginSettings | null>(null);
    const { getSettings, setSettings } = usePlugin();

    function onSpeedChange(readingSpeed: AudioPlayOptionType) {
        if (settings && settings.readingSpeed === readingSpeed) return;

        const newSettings = { ...settings, readingSpeed };
        setSettings(newSettings);
        setPageSettings(newSettings);
    }

    useEffect(() => {
        getSettings<FlashcardPluginSettings>({ readingSpeed: 1 }).then(setPageSettings);
    }, []);

    return <div className="text-lg flex flex-row flex-wrap items-center py-1 mt-2">
        <SettingsEntry
            title="Storytelling reading speed"
            description="The speed of how fast the story is read out.">
            <SpeedSelector
                setSpeed={onSpeedChange}
                initSpeed={settings?.readingSpeed ?? 1}
            />
        </SettingsEntry>
    </div>
}


function SettingsEntry(props: { title: string, description: string, children: React.ReactNode }) {
    return <div className="bg-gray-400 dark:bg-gray-900 dark:text-gray-100 text-xl flex 
        flex-row flex-wrap items-center rounded p-2 mb-3 w-full">
        <p className="text-lg w-full font-bold">{props.title}</p>
        <p className="text-sm">{props.description}</p>
        <div className="w-full pt-2">
            {props.children}
        </div>
    </div>
}

function SpeedSelector(props: { initSpeed: AudioPlayOptionType, setSpeed: (speed: AudioPlayOptionType) => void }) {
    return (
        <div className="mb-6">
            <input
                type="range"
                min="0"
                max={AudioPlayOptions.length - 1}
                value={AudioPlayOptions.findIndex(l => l === props.initSpeed)}
                onChange={(e) => props.setSpeed(AudioPlayOptions[parseInt(e.target.value)] as AudioPlayOptionType)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 px-1">
                {AudioPlayOptions.map(l => (
                    <div key={l}>{l}</div>
                ))}
            </div>
        </div>
    );
}
import { useState } from "react";
import TagInput from "../../components/form/TagInput";
import { usePlugin } from "../../utils/plugin/providers/PluginProvider";
import { useEffect } from "react";

interface Settings {
    ttsTags: string[];
}

export default function SettingsPage() {
    const [settings, setPageSettings] = useState<Settings | null>(null);
    const { getSettings, setSettings } = usePlugin();
    const [isLoading, setIsLoading] = useState(true);

    function setSettingsWrapper(key: keyof Settings, value: any) {
        setPageSettings({ ...settings, [key]: value });
    }

    useEffect(() => {
        getSettings<Settings>().then(data => {
            console.log("Settings", data);
            setPageSettings(data);
            setIsLoading(false);
        }
        );
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            settings && setSettings(settings);
        }, 5000);

        return () => clearTimeout(timeout);
    }, [settings]);

    if (isLoading) return <div/>;

    return <div className="text-lg flex flex-row flex-wrap items-center py-1 mt-2">
        <SettingsEntry
            title="Text-to-speech tags"
            description="These are the tags specifying which cards should support TTS.">
            <TagInput initialTags={settings?.ttsTags ?? []} onTagsChange={(tags) => setSettingsWrapper("ttsTags", tags)} className="w-full" />
        </SettingsEntry>
    </div>
}


function SettingsEntry(props: { title: string, description: string, children: React.ReactNode }) {
    return <div className="bg-gray-900 text-gray-100 text-xl flex flex-row flex-wrap items-center rounded p-2">
        <p className=" text-lg w-full font-bold">{props.title}</p>
        <p className="text-sm">{props.description}</p>
        <div className="w-full">
            {props.children}
        </div>
    </div>
}
"use client";

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Plugin } from "../plugin/CommunicationHandler";
import SettingsPluginHandler from '@/components/plugin/SettingsPluginHandler';

const SettingsPage = () => {
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [settingIndex, setSettingIndex] = useState(-1);

    useEffect(() => {
        fetch(`/api/plugins`).then(res => res.json()).then(setPlugins);
    }, []);

    const entries = [{ name: "general", title: "General" }].concat(plugins);
    return (
        <div className="flex h-screen">
            <div className="ml-5 border-r border-gray-600">
                <ul>
                    {entries.map((plugin, index) => (
                        <li
                            key={plugin.name}
                            className={`p-2 pr-10 rounded-l cursor-pointer ${index === settingIndex + 1 ? 'bg-gray-600' : 'bg-transparent'}`}
                            onClick={() => setSettingIndex(index - 1)}
                        >
                            {plugin.title}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex-1 p-5">
                {settingIndex === -1 ? <GeneralSettings /> : <PluginSettings plugin={plugins[settingIndex]} />}
            </div>
        </div>
    );
};

function PluginSettings(props: { plugin: Plugin }) {
    const { title, settingsPage } = props.plugin;
    return (
        <div>
            <h1 className="text-3xl font-bold">{title} Settings</h1>
            <div>
                {!settingsPage ? <div>No settings available</div> : <SettingsPluginHandler plugin={props.plugin} />}
            </div>
        </div>
    );
}

function GeneralSettings() {
    const { setTheme } = useTheme();
    return (
        <div>
            <h1 className="text-xl font-bold">General Settings</h1>
            <button className="mr-2 p-2 bg-blue-500 text-white rounded" onClick={() => setTheme('light')}>Light</button>
            <button className="p-2 bg-gray-800 text-white rounded" onClick={() => setTheme('dark')}>Dark</button>
        </div>
    );
}

export default SettingsPage;
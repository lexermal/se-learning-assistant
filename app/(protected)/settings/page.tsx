"use client";

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Plugin } from "../plugin/CommunicationHandler";
import SettingsPluginHandler from '@/components/plugin/SettingsPluginHandler';
import ResetPassword from '@/app/(protected)/settings/ResetPassword';

const SettingsPage = () => {
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [settingIndex, setSettingIndex] = useState(-1);

    useEffect(() => {
        fetch(`/api/plugins`).then(res => res.json()).then(setPlugins);
    }, []);

    const entries = [{ name: "general", title: "General" }].concat(plugins);
    return (
        <div className="flex h-screen">
            <div className="ml-5 pt-4 border-r border-gray-600">
                <ul>
                    {entries.map((plugin, index) => (
                        <li
                            key={plugin.name}
                            className={`p-2 pr-10 rounded-l cursor-pointer ${index === settingIndex + 1 ? 'bg-gray-400 dark:bg-gray-600' : 'bg-transparent'}`}
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
    const params = new URLSearchParams(window.location.search);
    console.log(params);
    return (
        <div>
            <h1 className="text-xl font-bold">General Settings</h1>
            <p>Change the theme</p>
            <button className={"p-2 text-white rounded-l bg-blue-500 dark:bg-blue-600"} onClick={() => setTheme('light')}>Light</button>
            <button className={"p-2 text-white rounded-r bg-blue-600 dark:bg-blue-800"} onClick={() => setTheme('dark')}>Dark</button>
            {/* based on query parameters define the search params */}
            <ResetPassword searchParams={params} />
        </div>
    );
}

export default SettingsPage;
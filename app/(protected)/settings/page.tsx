"use client";

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Plugin } from "../plugin/CommunicationHandler";

const SettingsPage = () => {
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [settingIndex, setSettingIndex] = useState(-1);

    useEffect(() => {
        fetch(`/api/plugins`).then(res => res.json()).then(setPlugins);
    }, []);

    const entries = [{ name: "general", title: "General" }].concat(plugins);
    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div style={{ width: '200px', borderRight: '1px solid #ccc' }}>
                <ul>
                    {entries.map((plugin, index) => (
                        <li
                            key={plugin.name}
                            style={{ padding: '10px', cursor: 'pointer', backgroundColor: index === settingIndex + 1 ? '#f0f0f0' : 'transparent' }}
                            onClick={() => setSettingIndex(index - 1)}
                        >
                            {plugin.title}
                        </li>
                    ))}
                </ul>
            </div>
            <div style={{ flex: 1, padding: '20px' }}>
                {settingIndex === -1 ? <GeneralSettings /> : <PluginSettings plugin={plugins[settingIndex]} />}
            </div>
        </div>
    );
};

function PluginSettings(props: { plugin: Plugin }) {
    const { title, settingsPage } = props.plugin;

    if (!settingsPage) {
        return (<div>
            <h1>{title} Settings</h1>
            <div>No settings available</div>
        </div>
        );
    }
    return <div>
        <h1>{title} Settings</h1>
        <div>Iframe stuff</div>
    </div>
}

function GeneralSettings() {
    const { theme, setTheme } = useTheme();
    return (
        <div>
            <h1>General Settings</h1>
            <button onClick={() => setTheme('light')}>Light</button>
            <button onClick={() => setTheme('dark')}>Dark</button>
        </div>
    );
}

export default SettingsPage;
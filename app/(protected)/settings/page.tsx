"use client";

import { useEffect, useState } from 'react';
import { Plugin } from "../../../utils/plugin/CommunicationHandler";
import { GeneralSettings } from './GeneralSettings';
import { PluginSettings } from './components/PluginSettings';
import { SupabaseClient } from '@/utils/supabase/client';

const SettingsPage = () => {
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [settingIndex, setSettingIndex] = useState(-1);

    useEffect(() => {
        SupabaseClient.getPlugins().then(setPlugins);
    }, []);

    const entries = [{ id: "general", title: "General" }].concat(plugins);
    return (
        <div className="flex sm:h-screen flex-wrap">
            <div className="sm:ml-5 pt-4 sm:border-r border-gray-600 w-full sm:w-1/4 border-b sm:border-b-0">
                <ul>
                    {entries.map((plugin, index) => (
                        <li
                            key={plugin.id}
                            className={`p-2 pr-10 rounded-l cursor-pointer ${index === settingIndex + 1 ? 'bg-gray-400 dark:bg-gray-600' : 'bg-transparent'}`}
                            onClick={() => setSettingIndex(index - 1)}
                        >
                            {plugin.title}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex-1 p-1 sm:p-5">
                {settingIndex === -1 ? <GeneralSettings /> : <PluginSettings plugin={plugins[settingIndex]} />}
            </div>
        </div>
    );
};

export default SettingsPage;
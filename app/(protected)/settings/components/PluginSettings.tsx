import SettingsPluginHandler from '@/components/plugin/SettingsPluginHandler';
import { Plugin } from "@/utils/plugin/CommunicationHandler";

export function PluginSettings({ plugin }: { plugin: Plugin }) {
    const { title, settings_page: settingsPage } = plugin;
    return (
        <div>
            <h1 className="text-3xl font-bold">{title} Settings</h1>
            <div>
                {!settingsPage ? <div>No settings available</div> : <SettingsPluginHandler plugin={plugin} />}
            </div>
        </div>
    );
} 
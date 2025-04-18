import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import ResetPassword from './components/ResetPassword';
import LanguageLevelDisplay from './components/LanguageLevels';
import { useDebounce } from '@/utils/hooks/useDebounce';
import { getUserSettings, setUserSettings } from './settings.service';
import LanguageSelector, { Language } from './components/LanguageSelector';
import ContextMenuTrigger from './components/ContextMenuTrigger';

interface UserSettings {
    motherTongue: Language;
    languageLevel: string;
    contextMenuOnSelect: boolean;
}

export function GeneralSettings() {
    const { setTheme } = useTheme();
    const params = new URLSearchParams(window.location.search);
    const [settings, setSettingState] = useState<UserSettings | null>(null);

    useEffect(() => {
        getUserSettings().then(setSettingState);
    }, []);

    const debouncedSetUserSettings = useDebounce(setUserSettings, 2000);

    const handleSetSettings = (key: keyof UserSettings, value: any) => {
        const newSettings = { ...settings, [key]: value } as UserSettings;
        setSettingState(newSettings);
        debouncedSetUserSettings(newSettings);
    }

    console.log({ settings });

    return (
        <div>
            <h1 className="text-xl font-bold">General Settings</h1>
            <p>Change the theme</p>
            <button className="p-2 text-white rounded-l bg-blue-500 dark:bg-blue-600" onClick={() => setTheme('light')}>Light</button>
            <button className="p-2 text-white rounded-r bg-blue-600 dark:bg-blue-800" onClick={() => setTheme('dark')}>Dark</button>
            <ResetPassword searchParams={params} />
            <LanguageSelector initLang={settings?.motherTongue} setLanguage={(lang) => handleSetSettings("motherTongue", lang)} />
            <LanguageLevelDisplay initialLevel={settings?.languageLevel} setSettings={values => handleSetSettings("languageLevel", values)} />
            <ContextMenuTrigger initialValue={settings?.contextMenuOnSelect} setSettings={(value) => handleSetSettings("contextMenuOnSelect", value)} />
        </div>
    );
} 
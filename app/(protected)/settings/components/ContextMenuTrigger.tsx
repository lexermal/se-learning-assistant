import { useState } from "react";
import SettingsEntry from "./SettingsEntry";

interface Props {
    initialValue?: boolean;
    setSettings: (value: boolean) => void;
}

export default function ContextMenuTrigger({ initialValue = false, setSettings }: Props) {
    const [isRightClick, setIsRightClick] = useState(initialValue);

    const handleToggle = (value: boolean) => {
        setIsRightClick(value);
        setSettings(value);
    }

    return <SettingsEntry title="Context Menu Trigger"
        description="Choose how the context menu should be triggered when selecting text.">
        <div className="mt-4 space-y-4">
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="selection"
                    name="contextTrigger"
                    checked={isRightClick}
                    onChange={() => handleToggle(!isRightClick)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="selection" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Should the context menu be triggered on text selection?
                </label>
            </div>
        </div>
    </SettingsEntry>
}
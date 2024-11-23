import { useEventEmitter } from "@/utils/providers/EventEmitterContext";
import React, { useState, useEffect } from "react";

interface Props {
    actions: MenuEntry[];
    contextMenu: ContextMenuInfo;
}

export interface MenuEntry {
    text: string;
    action: string;
    pluginName: string;
    icon?: React.ReactNode;
    url: string;
}

export interface ContextMenuInfo {
    x: number,
    y: number,
    text: string,
    open: boolean
}

export interface ContextMenuAction {
    url: string;
    text: string;
    action: string;
    pluginName: string;
}

const ContextMenu = ({ actions, contextMenu }: Props) => {
    const [showMenu, setMenuVisibility] = useState(contextMenu.open);
    const { emit } = useEventEmitter();

    useEffect(() => {
        setMenuVisibility(contextMenu.open);
    }, [contextMenu]);

    useEffect(() => {
        // Hide the menu on click outside
        const handleClick = () => setMenuVisibility(false);

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);

    if (!showMenu) {
        return null;
    }

    return (
        <div className="fixed bg-gray-500 shadow-lg border border-gray-300 rounded-md py-332"
            style={{ top: contextMenu.y, left: contextMenu.x }}>
            {actions.map((action, index) => (
                <MenuEntryItem key={index} icon={action.icon} text={action.text} onClick={() => {
                    setMenuVisibility(false);
                    console.log("triggering context menu action", action);
                    emit("contextMenuAction", action);
                }} />
            ))}
        </div>
    );
};

function MenuEntryItem(props: { icon: any, text: string, onClick: () => void }) {
    return <button onClick={props.onClick} className="px-4 py-2 text-left hover:bg-gray-400 w-full flex flex-row">
        <span className="flex-grow">{props.icon}</span>
        <span className="flex-grow">{props.text}</span>
        {/* <span className="text-sm">Ctrl+Shift+xxxx</span> */}
    </button>
}

export default ContextMenu;

import React, { useState, useEffect } from "react";

interface Props {
    x: number;
    y: number;
    open: boolean;
    actions: MenuEntry[];
}

export interface MenuEntry {
    text: string;
    onClick: () => void;
    icon?: React.ReactNode;
}

const ContextMenu = ({ actions, open, x, y }: Props) => {
    const [showMenu, setMenuVisibility] = useState(open);
    const [menuPosition, setMenuPosition] = useState({ x, y });

    useEffect(() => {
        setMenuVisibility(open);
        setMenuPosition({ x, y });
    }, [x, y, open]);

    useEffect(() => {
        // Hide the menu on click outside
        const handleClick = () => setMenuVisibility(false);

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);

    return (
        <div>
            {showMenu && (
                <div className="fixed bg-gray-500 shadow-lg border border-gray-300 rounded-md py-332"
                    style={{ top: menuPosition.y, left: menuPosition.x }}>
                    {actions.map((action, index) => (
                        <MenuEntryItem key={index} icon={action.icon} text={action.text} onClick={() => {
                            setMenuVisibility(false);
                            action.onClick();
                        }} />
                    ))}
                </div>
            )}
        </div>
    );
};

function MenuEntryItem(props: MenuEntry) {
    return <button onClick={props.onClick} className="px-4 py-2 text-left hover:bg-gray-400 w-full flex flex-row">
        <span className="flex-grow">{props.icon}</span>
        <span className="flex-grow">{props.text}</span>
        {/* <span className="text-sm">Ctrl+Shift+xxxx</span> */}
    </button>
}

export default ContextMenu;

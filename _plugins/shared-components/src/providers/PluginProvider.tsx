import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { PluginController } from '../plugin/PluginController';
import { RimoriClient } from '../plugin/RimoriClient';
interface PluginProviderProps {
    children: ReactNode;
}

const PluginContext = createContext<RimoriClient | null>(null);


export const PluginProvider: React.FC<PluginProviderProps> = ({ children }) => {
    const [plugin, setPlugin] = useState<RimoriClient | null>(null);
    //route change
    useEffect(() => {
        let lastHash = window.location.hash;

        setInterval(() => {
            if (lastHash !== window.location.hash) {
                lastHash = window.location.hash;
                console.log('url changed:', lastHash);
                plugin?.emit('urlChange', window.location.hash);
            }
        }, 100);
        PluginController.getInstance().then(setPlugin);
    }, []);

    //detect page height change
    useEffect(() => {
        const body = document.body;
        const handleResize = () => plugin?.emit('heightAdjustment', body.clientHeight);
        body.addEventListener('resize', handleResize);
        handleResize();
        return () => body.removeEventListener('resize', handleResize);
    }, [plugin]);

    //context menu
    useEffect(() => {
        let isOpen = false;
        const handleContextMenu = (e: MouseEvent) => {
            const selection = window.getSelection()?.toString().trim();
            if (selection) {
                e.preventDefault();
                // console.log('context menu', selection);
                plugin?.emit('contextMenu', { text: selection, x: e.clientX, y: e.clientY, open: true });
                isOpen = true;
            }
        };

        // Hide the menu on click outside
        const handleClick = () => isOpen && plugin?.emit('contextMenu', { text: '', x: 0, y: 0, open: false });

        document.addEventListener("click", handleClick);
        document.addEventListener('contextmenu', handleContextMenu);
        return () => {
            document.removeEventListener("click", handleClick);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [plugin]);

    if(!plugin){
        return ""
    }

    return (
        <PluginContext.Provider value={plugin}>
            {children}
        </PluginContext.Provider>
    );
};

export const usePlugin = () => {
    const context = useContext(PluginContext);
    if (context === null) {
        throw new Error('usePlugin must be used within an PluginProvider');
    }
    return context;
};
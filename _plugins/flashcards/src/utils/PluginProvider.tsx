import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { PluginController } from './PluginController';

interface PluginProviderProps {
    children: ReactNode;
}

const PluginContext = createContext<PluginController | null>(null);

let currentHeight = 0;

const plugin = PluginController.getInstance();

export const PluginProvider: React.FC<PluginProviderProps> = ({ children }) => {
    //resizing
    useEffect(() => {
        const handleResize = () => {
            const height = document.body.scrollHeight;
            if (height === currentHeight) return;
            currentHeight = height;

            plugin.emit('heightAdjustment', height);
        };

        handleResize();
        setTimeout(handleResize, 500);

        const root = document.getElementById('root')

        new ResizeObserver(handleResize).observe(root!);
        root?.addEventListener('resize', handleResize);
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    //route change
    useEffect(() => {
        let lastHash = window.location.hash;

        setInterval(() => {
            if (lastHash !== window.location.hash) {
                lastHash = window.location.hash;
                console.log('url changed:', lastHash);
                plugin.emit('urlChange', window.location.hash);
            }
        }, 100);
    }, []);

    //context menu
    useEffect(() => {
        let isOpen = false;
        const handleContextMenu = (e: MouseEvent) => {
            const selection = window.getSelection()?.toString().trim();
            if (selection) {
                e.preventDefault();
                // console.log('context menu', selection);
                plugin.emit('contextMenu', { text: selection, x: e.clientX, y: e.clientY, open: true });
                isOpen = true;
            }
        };

        // Hide the menu on click outside
        const handleClick = () => isOpen && plugin.emit('contextMenu', { text: '', x: 0, y: 0, open: false });

        document.addEventListener("click", handleClick);
        document.addEventListener('contextmenu', handleContextMenu);
        return () => {
            document.removeEventListener("click", handleClick);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

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
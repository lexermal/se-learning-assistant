import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { PluginController } from './PluginController';

interface PluginProviderProps {
    children: ReactNode;
}

const PluginContext = createContext<PluginController | null>(null);

let currentHeight = 0;

const plugin = PluginController.getInstance();

export const PluginProvider: React.FC<PluginProviderProps> = ({ children }) => {
    console.log("plugin created");

    //resizing
    useEffect(() => {
        const handleResize = () => {
            const height = document.body.scrollHeight + 3;
            if (height === currentHeight) return;
            currentHeight = height;

            plugin.emit('heightAdjustment', height);
        };

        handleResize();
        setTimeout(handleResize, 500);
        window.addEventListener('resize', handleResize);
        document.getElementById('root')?.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
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
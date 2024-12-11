"use client";

import { Env } from '@/utils/constants';
import React, { createContext, useContext, ReactNode } from 'react';
import { SupabaseClient } from '../supabase/client';

interface EnvProviderProps {
    env: Env;
    children: ReactNode;
}

const EnvContext = createContext<Env | null>(null);

export const EnvProvider: React.FC<EnvProviderProps> = ({ env, children }) => {
    SupabaseClient.getClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    return (
        <EnvContext.Provider value={env}>
            {children}
        </EnvContext.Provider>
    );
};

export const useEnv = () => {
    const context = useContext(EnvContext);
    if (context === null) {
        throw new Error('useEnv must be used within an EnvProvider');
    }
    return context;
};
"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { SupabaseClient } from "@/utils/supabase/client";
import CommunicationHandler, { Plugin } from "../../utils/plugin/CommunicationHandler";

export default function SettingsPluginHandler({ plugin }: { plugin: Plugin }) {
    const iframeRef = useRef(null as HTMLIFrameElement | null);
    const supabase = SupabaseClient.getClient();
    const { theme } = useTheme();

    useEffect(() => {
        if (!iframeRef.current) {
            return;
        }
        iframeRef.current!.style.opacity = "0";
        
        const connection = new CommunicationHandler(supabase, plugin, iframeRef.current, plugin.settingsPage, ["h-full", "bg-gray-950"], new Map([["theme", theme || "system"]]));
        connection.init().then(() => {
            iframeRef.current!.style.opacity = "1";
        });

        connection.subscribe("heightAdjustment", (_id, height: number) => {
            const iframe = (iframeRef.current!.children[0] as HTMLIFrameElement);

            iframe.style.height = `${height}px`;
        });
    }, [plugin]);

    // {/* For the communication library to use it needs to have the div with the iframe inside!!! */}
    return (
        <div ref={iframeRef} className="w-full" style={{ opacity: 0 }}>
            <iframe className="w-full" scrolling="no" allow="microphone; autoplay; fullscreen" src={plugin.endpoint} />
        </div>
    );
}

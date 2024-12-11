"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { SupabaseClient } from "@/utils/supabase/client";
import CommunicationHandler, { Plugin } from "../../app/(protected)/plugin/CommunicationHandler";

export default function SettingsPluginHandler({ plugin }: { plugin: Plugin }) {
    const iframeRef = useRef(null as HTMLDivElement | null);
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

        connection.subscribe("heightAdjustment", (height: number) => {
            const iframe = (iframeRef.current!.children[0] as HTMLIFrameElement);

            iframe.style.height = `${height}px`;
            iframe.setAttribute("scrolling", "no");
        });
        return () => {connection.destroy()};
    }, [plugin]);

    return (
        <div className={`w-full`}>
            <div ref={iframeRef} className="w-full" style={{ opacity: 0 }}></div>
        </div>
    );
}

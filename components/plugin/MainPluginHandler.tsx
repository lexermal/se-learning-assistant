"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SupabaseClient } from "@/utils/supabase/client";
import ContextMenu, { ContextMenuInfo, MenuEntry } from "./ContextMenu";
import CommunicationHandler, { Plugin } from "../../utils/plugin/CommunicationHandler";
import { useTheme } from "next-themes";

export default function MainPluginHandler({ plugin, globalContextMenuActions }: { plugin: Plugin, globalContextMenuActions: MenuEntry[] }) {
    const [contextMenu, setContextMenu] = useState<ContextMenuInfo>({ x: 0, y: 0, open: false, text: "" });
    const [constextActions, setContextMenuActions] = useState<MenuEntry[]>(globalContextMenuActions);
    const iframeRef = useRef(null as HTMLDivElement | null);
    const [hash, setHash] = useState<string | null>(null);
    const supabase = SupabaseClient.getClient();
    const router = useRouter();
    const { theme } = useTheme();

    useEffect(() => {
        if (!iframeRef.current || !iframeRef.current.children[0] || !plugin || !hash) {
            return;
        }
        iframeRef.current!.style.opacity = "0";

        const connection = new CommunicationHandler(supabase, plugin, iframeRef.current, hash);
        connection.init().then(() => {
            iframeRef.current!.style.opacity = "1";
        });

        connection.subscribe("heightAdjustment", (_id, height: number) => {
            if (!iframeRef.current) {
                return;
            }
            const iframe = (iframeRef.current.children[0] as HTMLIFrameElement);

            // console.log("adjusting height", height);
            iframe.style.minHeight = `calc(100vh - 300px)`;
            iframe.style.height = `${height}px`;
        });

        connection.subscribe("urlChange", async (_id, url: string) => {
            console.log("urlChange", url);
            router.push(url);
        });

        connection.subscribe("contextMenu", (_id, data: ContextMenuInfo) => {
            const rect = iframeRef.current!.getBoundingClientRect();
            setContextMenu({ x: data.x + rect.left, y: data.y + rect.top, open: data.open, text: data.text });
        });

        connection.subscribe("addContextMenuActions", (_id, actions: MenuEntry[]) => {
            setContextMenuActions([...actions, ...constextActions]);
        });
    }, [plugin, hash]);

    //url hash changed
    useEffect(() => {
        let lastHash = window.location.hash;
        setHash(lastHash);

        setInterval(() => {
            if (lastHash !== window.location.hash) {
                lastHash = window.location.hash;
                console.log('url changed based on main application navigation changed:', lastHash);
                setHash(lastHash);
            }
        }, 100);
    }, []);

    return (
        <div className={`w-full`}>
            <ContextMenu contextMenu={contextMenu} actions={constextActions} />
            {/* For the communication library to use it needs to have the div with the iframe inside!!! */}
            <div ref={iframeRef} className="w-full" style={{ opacity: 0 }}>
                <iframe className="w-full" scrolling="no" allow="microphone; autoplay; fullscreen" src={plugin.endpoint} />
            </div>
        </div>
    );
}

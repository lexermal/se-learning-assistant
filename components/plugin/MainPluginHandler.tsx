"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import ContextMenu, { ContextMenuInfo, MenuEntry } from "./ContextMenu";
import CommunicationHandler, { Plugin } from "../../app/(protected)/plugin/CommunicationHandler";
import { useTheme } from "next-themes";

export default function MainPluginHandler({ plugin, globalContextMenuActions }: { plugin: Plugin, globalContextMenuActions: MenuEntry[] }) {
    const [contextMenu, setContextMenu] = useState<ContextMenuInfo>({ x: 0, y: 0, open: false, text: "" });
    const [constextActions, setContextMenuActions] = useState<MenuEntry[]>(globalContextMenuActions);
    const iframeRef = useRef(null as HTMLDivElement | null);
    const [hash, setHash] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();
    const { theme } = useTheme();

    useEffect(() => {
        if (!iframeRef.current || !plugin || !hash) {
            return;
        }

        const connection = new CommunicationHandler(supabase, plugin, iframeRef.current, hash);
        connection.init();

        connection.subscribe("heightAdjustment", (height: number) => {
            if (!iframeRef.current) {
                return;
            }
            const iframe = (iframeRef.current.children[0] as HTMLIFrameElement);

            // console.log("adjusting height", height);
            iframe.style.minHeight = `calc(100vh - 300px)`;
            iframe.style.height = `${height}px`;
            iframe.setAttribute("scrolling", "no");
        });

        connection.subscribe("urlChange", async (url: string) => {
            console.log("urlChange", url);
            router.push(url);
        });

        connection.subscribe("contextMenu", (data: ContextMenuInfo) => {
            const rect = iframeRef.current!.getBoundingClientRect();
            setContextMenu({ x: data.x + rect.left, y: data.y + rect.top, open: data.open, text: data.text });
        });

        connection.subscribe("addContextMenuActions", (actions: MenuEntry[]) => {
            setContextMenuActions([...actions, ...constextActions]);
        });

        return () => { connection.destroy() }
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

    if (!plugin) {
        return <div>Loading...</div>;
    }

    return (
        <div className={`w-full`}>
            <ContextMenu contextMenu={contextMenu} actions={constextActions} />
            <div ref={iframeRef} className="w-full"></div>
        </div>
    );
}

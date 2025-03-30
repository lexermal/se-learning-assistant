"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SupabaseClient } from "@/utils/supabase/client";
import ContextMenu, { ContextMenuInfo, MenuEntry } from "./ContextMenu";
import CommunicationHandler, { Plugin } from "../../utils/plugin/CommunicationHandler";
import { useTheme } from "next-themes";
import { useEventEmitter } from "@/utils/providers/EventEmitterContext";

export default function MainPluginHandler({ plugin, globalContextMenuActions }: { plugin: Plugin, globalContextMenuActions: MenuEntry[] }) {
    const [contextMenu, setContextMenu] = useState<ContextMenuInfo>({ x: 0, y: 0, open: false, text: "" });
    const [constextActions, setContextMenuActions] = useState<MenuEntry[]>(globalContextMenuActions);
    const iframeRef = useRef(null as HTMLDivElement | null);
    const [hash, setHash] = useState<string | null>(null);
    const supabase = SupabaseClient.getClient();
    const { emit } = useEventEmitter();
    const router = useRouter();
    const theme = useTheme();

    useEffect(() => {
        if (!iframeRef.current || !iframeRef.current.children[0] || !plugin || !hash) {
            return;
        }
        iframeRef.current!.style.opacity = "0";

        const connection = new CommunicationHandler(supabase, plugin, iframeRef.current, hash, [], new Map([["rm_theme", theme.theme || "light"]]));
        connection.init().then(() => {
            iframeRef.current!.style.opacity = "1";
            const iframe = (iframeRef.current?.children[0] as HTMLIFrameElement);
            iframe.style.minHeight = `calc(100vh - 50px)`;
            // iframeRef.current!.style.height = `calc(100vh - 80px)`;
        });

        if (plugin.unmanaged) {
            return;
        }

        connection.subscribe("urlChange", async (_id, url: string) => {
            console.log("urlChange", url);
            router.push(url);
        });

        connection.subscribe("contextMenu", (_id, data: ContextMenuInfo) => {
            const rect = iframeRef.current!.getBoundingClientRect();
            setContextMenu({ x: data.x + rect.left, y: data.y + rect.top, open: data.open, text: data.text });
        });

        connection.subscribe("addContextMenuActions", (_id, actions: MenuEntry[]) => {
            console.log("addContextMenuActions", actions);
            setContextMenuActions([...actions, ...constextActions]);
        });

        connection.subscribe("triggerSidebarAction", (_id, data: { actionKey: string, text: string, pluginId: string }) => {
            console.log("triggerSidebarAction", data);
            emit("contextMenuAction", { actionKey: data.actionKey, text: data.text, pluginId: data.pluginId });
        });
    }, [plugin.id, hash]);

    //url hash changed
    useEffect(() => {
        let lastHash = window.location.hash;
        setHash(lastHash.substring(1));

        setInterval(() => {
            if (lastHash !== window.location.hash) {
                lastHash = window.location.hash;
                console.log('url changed based on main application navigation changed:', lastHash);
                setHash(lastHash.substring(1));
            }
        }, 100);
    }, []);

    return (
        <div className={`w-full`}>
            <ContextMenu contextMenu={contextMenu} actions={constextActions} />
            {/* For the communication library to use it needs to have the div with the iframe inside!!! */}
            <div ref={iframeRef} className="w-full" style={{ opacity: 0 }}>
                <iframe className="w-full"
                    allow="microphone; autoplay; fullscreen"
                    src={plugin.endpoint + "?rm_theme=dark"} />
            </div>
        </div>
    );
}

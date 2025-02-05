"use client";

import { useEffect, useRef, useState } from "react";
import { ContextMenuAction, MenuEntry } from "./ContextMenu";
import { useEventEmitter } from "@/utils/providers/EventEmitterContext";
import { Plugin, SidebarPage } from "../../utils/plugin/CommunicationHandler";
import CommunicationHandler from "../../utils/plugin/CommunicationHandler";
import { SupabaseClient } from "@/utils/supabase/client";

function PluginSidebar({ plugin, contextMenuAction }: { plugin: Plugin, contextMenuAction: MenuEntry }) {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [parent, setParent] = useState<CommunicationHandler | null>(null);
    const supabase = SupabaseClient.getClient();

    useEffect(() => {
        if (parent) {
            parent.emit("toolAction", { action: contextMenuAction.action, text: contextMenuAction.text });
        }
    }, [contextMenuAction]);

    useEffect(() => {
        const parent = new CommunicationHandler(supabase, plugin, iframeRef.current, contextMenuAction.url, ["h-full", "dark:bg-gray-920"], new Map([["applicationMode", "sidebar"]]));
        setParent(parent);
        iframeRef.current!.style.opacity = "0";

        parent.init().then(() => {
            parent.emit("toolAction", { action: contextMenuAction.action, text: contextMenuAction.text });

            iframeRef.current!.style.opacity = "1";
        });
    }, [plugin, contextMenuAction]);

    return (
        <div className="dark:bg-gray-920 w-full h-full border-l border-gray-600 pt-[50px]">
            {/* For the communication library to use it needs to have the div with the iframe inside!!! */}
            <div ref={iframeRef} className="w-full h-full" style={{ opacity: 0 }}>
                <iframe className="w-full" style={{ height: "calc(100vh - 50px)" }} allow="microphone; autoplay; fullscreen" src={plugin.endpoint} />
            </div>
        </div>
    );
}

export function SidebarPluginHandler({ plugins }: { plugins: Plugin[] }) {
    const sidebarPlugins = plugins.flatMap((plugin) => plugin.sidebarPages.map(sp => ({ ...sp, pluginName: plugin.name }))) as (SidebarPage & { pluginName: string })[];
    const [openPlugin, setOpenPlugin] = useState<number>(-1);
    const [sidebarPlugin, setSidebarPlugin] = useState<Plugin | null>(null);
    const [pluginAction, setPluginAction] = useState<ContextMenuAction | undefined>(undefined);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
    const { on } = useEventEmitter();

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMdScreen = windowWidth <= 900;

    useEffect(() => {
        on("contextMenuAction", ({ pluginName, action, text, url }: ContextMenuAction) => {
            // console.log("Trigger context menu action:", pluginName, action, text, url);

            const result = sidebarPlugins.filter((p) =>
                p.pluginName === pluginName && p.url === url
            );

            if (result.length === 0) {
                console.log("No plugin found for action", pluginName, action);
                return;
            }
            setSidebarPlugin(plugins.find(p => p.name === pluginName) || null);
            setOpenPlugin(sidebarPlugins.indexOf(result[0]));
            setPluginAction({ pluginName, action, text, url });
        });
    }, []);


    const isOpen = openPlugin > -1;
    const width = isOpen ? 460 : 0;

    return (
        <div className="flex flex-row">
            <div style={{ paddingLeft: width + "px", height: "calc(100vh - 50px)" }} className={isOpen && isMdScreen ? 'absolute' : ''}>
                <div
                    style={{ width: isOpen ? (isMdScreen ? "100%" : "500px") : "40px" }}
                    className="fixed right-0 top-0 flex flex-row h-fgggull">
                    <div className="flex flex-col gap-1 w-0 pt-[4.3rem] h-fit" style={{ marginRight: "40px" }}>
                        {sidebarPlugins.map(({ name, url, iconUrl, pluginName }, index) => {
                            const plugin = plugins.find(p => p.name === pluginName)!;
                            return (
                                <button
                                    key={name}
                                    style={{ width: "40px", background: index === openPlugin ? "rgb(94, 102, 115)" : "rgb(44, 52, 65)" }}
                                    onClick={() => {
                                        setOpenPlugin(index === openPlugin ? -1 : index);
                                        setSidebarPlugin(plugin);
                                        setPluginAction({ pluginName, action: url, text: "", url });
                                    }}
                                    className="flex flex-col items-center rounded-l-lg py-3 brightness-200 dark:brightness-100">
                                    <img
                                        src={iconUrl || plugin.iconUrl}
                                        className="w-6 h-6 brightness-75"
                                        title={`${plugin.title} - ${name}`}
                                    />
                                </button>
                            );
                        })}
                    </div>
                    {sidebarPlugin && pluginAction && openPlugin > -1 && (
                        <PluginSidebar plugin={sidebarPlugin} contextMenuAction={pluginAction} />
                    )}
                </div>
            </div>
        </div>
    );
}
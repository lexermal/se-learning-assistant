"use client";

import { useEffect, useRef, useState } from "react";
import { ContextMenuAction, MenuEntry } from "./ContextMenu";
import { useEventEmitter } from "@/utils/providers/EventEmitterContext";
import { Plugin, SidebarPage } from "../../utils/plugin/CommunicationHandler";
import CommunicationHandler from "../../utils/plugin/CommunicationHandler";
import { SupabaseClient } from "@/utils/supabase/client";
import { CgMaximizeAlt } from "react-icons/cg";
import { TbArrowsMinimize } from "react-icons/tb";

function PluginSidebar({ plugin, contextMenuAction, url }: { plugin: Plugin, contextMenuAction: MenuEntry, url: string }) {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const supabase = SupabaseClient.getClient();
    const [isMaximized, setIsMaximized] = useState(false);

    function handleMaximize() {
        document.body.style.overflow = isMaximized ? "auto" : "hidden";
        setIsMaximized(!isMaximized);
    }

    useEffect(() => {
        const parent = new CommunicationHandler(supabase, plugin, iframeRef.current, url, ["h-full", "dark:bg-gray-920"], new Map([["applicationMode", "sidebar"]]));
        iframeRef.current!.style.opacity = "0";

        parent.subscribe("getToolAction", () => {
            parent.emit("getToolAction", { action: contextMenuAction.actionKey, text: contextMenuAction.text });
        });

        parent.init().then(() => {
            iframeRef.current!.style.opacity = "1";
        });
    }, [plugin.id, contextMenuAction.actionKey]);

    return (
        <div className="dark:bg-gray-920 w-full h-full border-l border-gray-600 pt-[50px]">
            {/* For the communication library to use it needs to have the div with the iframe inside!!! */}
            <button className="absolute p-1 right-0 text-gray-400 hover:text-gray-200 text-2xl z-20" onClick={handleMaximize}>
                {isMaximized ? <TbArrowsMinimize /> : <CgMaximizeAlt />}
            </button>
            <div ref={iframeRef} className={"w-full h-full " + (isMaximized ? "fixed left-0" : "")} style={{ opacity: 0 }}>
                <iframe className="w-full" style={{ height: "calc(100vh - 50px)" }} allow="microphone; autoplay; fullscreen" src={plugin.endpoint} />
            </div>
        </div>
    );
}

export function SidebarPluginHandler({ plugins }: { plugins: Plugin[] }) {
    const sidebarPlugins = plugins.flatMap((plugin) => plugin.sidebar_pages.map(sp => ({ ...sp, pluginId: plugin.id }))) as (SidebarPage & { pluginId: string })[];
    const [openPlugin, setOpenPlugin] = useState<number>(-1);
    const [sidebarPlugin, setSidebarPlugin] = useState<Plugin | null>(null);
    const [pluginAction, setPluginAction] = useState<ContextMenuAction & { url: string } | undefined>(undefined);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
    const { on } = useEventEmitter();

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMdScreen = windowWidth <= 900;

    function getContextMenuAction(pluginId: string, actionKey: string, text: string): ContextMenuAction & { url: string } {
        const result = sidebarPlugins.filter((p) =>
            p.pluginId === pluginId && p.actionKey === actionKey
        );
        return { pluginId, text, actionKey, url: result[0].url };
    }

    useEffect(() => {
        on("contextMenuAction", ({ pluginId, text, actionKey }: ContextMenuAction) => {
            console.log("Trigger context menu action:", { pluginId, actionKey, text });

            const result = sidebarPlugins.filter((p) =>
                p.pluginId === pluginId && p.actionKey === actionKey
            );

            if (result.length === 0) {
                console.log("No plugin found for action", pluginId, actionKey);
                return;
            }
            setSidebarPlugin(plugins.find(p => p.id === pluginId) || null);
            setOpenPlugin(sidebarPlugins.indexOf(result[0]));
            setPluginAction(getContextMenuAction(pluginId, actionKey, text ?? ""));
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
                        {sidebarPlugins.map(({ name, icon_url: iconUrl, pluginId, actionKey }, index) => {
                            const plugin = plugins.find(p => p.id === pluginId)!;
                            return (
                                <button
                                    key={name}
                                    style={{ width: "40px", background: index === openPlugin ? "rgb(94, 102, 115)" : "rgb(44, 52, 65)" }}
                                    onClick={() => {
                                        setOpenPlugin(index === openPlugin ? -1 : index);
                                        setSidebarPlugin(plugin);
                                        setPluginAction(getContextMenuAction(pluginId, actionKey, ""));
                                    }}
                                    className="flex flex-col items-center rounded-l-lg py-3 brightness-200 dark:brightness-100">
                                    <img
                                        src={iconUrl || plugin.icon_url}
                                        className="w-6 h-6 brightness-75"
                                        title={`${plugin.title} - ${name}`}
                                    />
                                </button>
                            );
                        })}
                    </div>
                    {sidebarPlugin && pluginAction && openPlugin > -1 && (
                        <PluginSidebar plugin={sidebarPlugin} contextMenuAction={pluginAction} url={pluginAction.url} />
                    )}
                </div>
            </div>
        </div>
    );
}
"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ContextMenuAction, MenuEntry } from "./ContextMenu";
import { useEventEmitter } from "@/utils/providers/EventEmitterContext";
import { Plugin, SidebarPage } from "../../app/(protected)/plugin/CommunicationHandler";
import CommunicationHandler from "../../app/(protected)/plugin/CommunicationHandler";
import { useTheme } from "next-themes";

function PluginSidebar({ plugin, contextMenuAction }: { plugin: Plugin, contextMenuAction: MenuEntry }) {
    const iframeRef = useRef<HTMLDivElement | null>(null);
    const [parent, setParent] = useState<CommunicationHandler | null>(null);
    const supabase = createClient();
    const { theme } = useTheme();

    useEffect(() => {
        if (parent) {
            parent.emit("toolAction", { action: contextMenuAction.action, text: contextMenuAction.text });
        }
    }, [contextMenuAction]);

    useEffect(() => {
        iframeRef.current!.style.opacity = "0";

        const parent = new CommunicationHandler(supabase, plugin, iframeRef.current, contextMenuAction.url, ["h-full", "dark:bg-gray-920"], new Map([["applicationMode", "sidebar"], ["theme", theme || "system"]]));
        setParent(parent);

        parent.init().then(() => {
            parent.emit("toolAction", { action: contextMenuAction.action, text: contextMenuAction.text });

            iframeRef.current!.style.opacity = "1";
        });

        return () => { parent.destroy() };
    }, [plugin, contextMenuAction]);

    return (
        <div className="dark:bg-gray-920 w-full h-full border-l border-gray-600 pt-16">
            <div ref={iframeRef} className="w-full h-full" style={{ opacity: 0 }}></div>
        </div>
    );
}

export function SidebarPluginHandler({ plugins }: { plugins: Plugin[] }) {
    const sidebarPlugins = plugins.flatMap((plugin) => plugin.sidebarPages.map(sp=>({ ...sp, pluginName: plugin.name }))) as (SidebarPage & { pluginName: string })[];

    // console.log("Sidebar plugins", sidebarPlugins);

    const [sidebarPlugin, setSidebarPlugin] = useState<Plugin | null>(null);
    const [pluginAction, setPluginAction] = useState<ContextMenuAction | undefined>(undefined);
    const [openPlugin, setOpenPlugin] = useState<number>(-1);
    const { on } = useEventEmitter();

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


    const width = openPlugin > -1 ? 500 : 40;
    // console.log({pluginAction, sidebarPlugin, openPlugin, width});  

    return (
        <div className="flex flex-row">
            <div style={{ paddingLeft: width + "px" }} className={`pl-[${width}px]`}>
                <div style={{ width: width + "px" }} className={`fixed bottom-0 right-0 top-0 flex flex-row`}>
                    <div className="flex flex-col gap-1 w-10 pt-[4.3rem]">
                        {sidebarPlugins.map(({ name, url, iconUrl, pluginName }, index) => {
                            const plugin = plugins.find(p => p.name === pluginName)!;
                            return (
                                <button key={index} style={{ background: index === openPlugin ? "rgb(94, 102, 115)" : "rgb(44, 52, 65)" }} onClick={() => {
                                    setOpenPlugin(index === openPlugin ? -1 : index);
                                    setSidebarPlugin(plugin);
                                    setPluginAction({ pluginName, action: url, text: "", url: url });
                                }} className={"flex flex-col items-center rounded-l-lg py-3 brightness-200 dark:brightness-100"}>
                                    <img src={iconUrl || plugin.iconUrl} className="w-6 h-6 brightness-75" title={plugin.title + " - " + name} />
                                </button>
                            );
                        })}
                    </div>
                    {sidebarPlugin && pluginAction && openPlugin > -1 &&
                        <PluginSidebar plugin={sidebarPlugin} contextMenuAction={pluginAction} />
                    }
                </div>
            </div>
        </div>
    );

}
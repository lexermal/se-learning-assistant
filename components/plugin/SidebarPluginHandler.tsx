"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ContextMenuAction, MenuEntry } from "./ContextMenu";
import { useEventEmitter } from "@/utils/providers/EventEmitterContext";
import { Plugin } from "../../app/(protected)/plugin/CommunicationHandler";
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
        const parent = new CommunicationHandler(supabase, plugin, iframeRef.current, contextMenuAction.url);
        setParent(parent);

        parent.init().then(() => {
            parent.emit("toolAction", { action: contextMenuAction.action, text: contextMenuAction.text });
            if (!iframeRef.current) {
                return;
            }
            const iframe = (iframeRef.current.children[0] as HTMLIFrameElement);

            iframe.style.height = `calc(100vh - 4rem)`;
            parent.emit("themeChange", theme);
        });

        return () => { parent.destroy() };
    }, [plugin, contextMenuAction]);

    return (
        <div ref={iframeRef} className="w-full h-full border-l border-gray-600"></div>
    );
}

export function SidebarPluginHandler({ plugins }: { plugins: Plugin[] }) {
    const [sidebarPlugin, setSidebarPlugin] = useState<Plugin | null>(null);
    const [pluginAction, setPluginAction] = useState<ContextMenuAction | undefined>(undefined);
    const [openPlugin, setOpenPlugin] = useState<number>(-1);
    const { on } = useEventEmitter();

    useEffect(() => {
        on("contextMenuAction", ({ pluginName, action, text, url }: ContextMenuAction) => {
            // console.log("Trigger context menu action:", pluginName, action, text, url);

            const result = plugins.filter((p) =>
                p.isSidebarPlugin &&
                p.name === pluginName &&
                p.contextMenuActions.some((a: MenuEntry) => a.action === action)
            );

            if (result.length === 0) {
                console.log("No plugin found for action", pluginName, action);
                return;
            }
            setSidebarPlugin(result[0]);
            setOpenPlugin(plugins.indexOf(result[0]));
            setPluginAction({ pluginName, action, text, url });
        });
    }, []);


    const sidebarPlugins = plugins.filter(p => p.isSidebarPlugin).map(p => p.sidebarPages.map(sp => ({ plugin: p, action: sp }))).flat();
    const width = openPlugin > -1 ? 500 : 40;

    return (
        <div className="flex flex-row">
            <div style={{ paddingLeft: width + "px" }} className={`pl-[${width}px]`}>
                <div style={{ width: width + "px" }} className={`fixed bottom-0 right-0 top-16 flex flex-row`}>
                    <div className="flex flex-col gap-1 w-10">
                        {sidebarPlugins.map(({ plugin, action }, index) => (
                            <button key={index} style={{ background: index === openPlugin ? "rgb(94, 102, 115)" : "rgb(44, 52, 65)" }} onClick={() => {
                                setOpenPlugin(index === openPlugin ? -1 : index);
                                setSidebarPlugin(plugin);
                                setPluginAction({ pluginName: plugin.name, action: action.url, text: "", url: action.url });
                            }} className={"flex flex-col items-center rounded-l-lg py-3"}>
                                <img src={action.iconUrl || plugin.iconUrl} className="w-6 h-6 brightness-75" title={plugin.title + " - " + action.name} />
                            </button>
                        ))}
                    </div>
                    {sidebarPlugin && pluginAction && openPlugin > -1 &&
                        <PluginSidebar plugin={sidebarPlugin} contextMenuAction={pluginAction} />
                    }
                </div>
            </div>
        </div>
    );

}
"use client";

import { ContextMenuAction, MenuEntry } from "./ContextMenu";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plugin } from "../../app/plugin/CommunicationHandler";
import CommunicationHandler from "../../app/plugin/CommunicationHandler";
import { useEventEmitter } from "@/utils/providers/EventEmitterContext";

export default function SidebarPluginHandler({ plugin, contextMenuAction }: { plugin: Plugin, contextMenuAction: MenuEntry }) {
    const iframeRef = useRef<HTMLDivElement | null>(null);
    const supabase = createClient();

    useEffect(() => {
        console.log("SidebarPluginHandler", plugin, contextMenuAction);
        const parent = new CommunicationHandler(supabase, plugin, iframeRef.current, contextMenuAction.url);

        parent.init().then(() => {
            parent.emit("toolAction", { action: contextMenuAction.action, text: contextMenuAction.text });
            if (!iframeRef.current) {
                return;
            }
            const iframe = (iframeRef.current.children[0] as HTMLIFrameElement);

            // iframe.setAttribute("scrolling", "no");
            iframe.style.minHeight = `calc(100vh - 324px)`;
        });

        return () => {
            parent.destroy();
        };
    }, [plugin]);

    return (
        <div ref={iframeRef} className="w-full" style={{ border: "1px solid #ccc" }}></div>
    );
}

export function PluginSidebar({ plugins }: { plugins: Plugin[] }) {
    const [sidebarPlugin, setSidebarPlugin] = useState<Plugin | null>(null);
    const { on } = useEventEmitter();
    const [pluginAction, setPluginAction] = useState<ContextMenuAction | null>(null);

    console.log("PluginSidebar", sidebarPlugin);

    useEffect(() => {
        on("contextMenuAction", ({ pluginName, action, text, url }: ContextMenuAction) => {
            console.log("Trigger context menu action:", pluginName, action, text, url);

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
            setPluginAction({ pluginName, action, text, url });
        });
    }, []);

    if (!plugins || !pluginAction || !sidebarPlugin) {
        return <div></div>;
    }

    return (
        <div className="flex flex-col">
            <button className="" onClick={() => setSidebarPlugin(null)}>Close</button>
            <SidebarPluginHandler plugin={sidebarPlugin} contextMenuAction={pluginAction} />
        </div>
    );

}
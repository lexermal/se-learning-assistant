"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ContextMenuAction, MenuEntry } from "./ContextMenu";
import { useEventEmitter } from "@/utils/providers/EventEmitterContext";
import { Plugin } from "../../app/(protected)/plugin/CommunicationHandler";
import CommunicationHandler from "../../app/(protected)/plugin/CommunicationHandler";
import { useTheme } from "next-themes";

export default function SidebarPluginHandler({ plugin, contextMenuAction }: { plugin: Plugin, contextMenuAction: MenuEntry }) {
    const iframeRef = useRef<HTMLDivElement | null>(null);
    const supabase = createClient();
    const [parent, setParent] = useState<CommunicationHandler | null>(null);
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

            // iframe.setAttribute("scrolling", "no");
            iframe.style.height = `calc(100vh - 150px)`;
            parent.emit("themeChange", theme);

        });

        return () => {
            parent.destroy();
        };
    }, [plugin]);

    return (
        <div ref={iframeRef} className="w-full h-full"></div>
    );
}

export function PluginSidebar({ plugins }: { plugins: Plugin[] }) {
    const [sidebarPlugin, setSidebarPlugin] = useState<Plugin | null>(null);
    const { on } = useEventEmitter();
    const [pluginAction, setPluginAction] = useState<ContextMenuAction | null>(null);

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
            setPluginAction({ pluginName, action, text, url });
        });
    }, []);

    if (!plugins || !pluginAction || !sidebarPlugin) {
        return <div></div>;
    }

    return (
        <div className="pl-[500px]">
            <div className="w-[500px] fixed bottom-0 right-0 top-24">
                <button className="" onClick={() => setSidebarPlugin(null)}>Close</button>
                <SidebarPluginHandler plugin={sidebarPlugin} contextMenuAction={pluginAction} />
            </div>
        </div>
    );

}
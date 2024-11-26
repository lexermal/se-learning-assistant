import { MenuEntry } from "@/components/plugin/ContextMenu";
import { NextRequest, NextResponse } from "next/server";
import { deprecate } from "util";

export interface Plugin {
    id: string;
    // @deprecate
    name: string;
    title: string;
    description: string;
    pluginRepo: string;
    pluginWebsite: string;
    version: string;
    author: string;
    endpoint: string;
    endpointDev?: string;
    contextMenuActions: MenuEntry[];
    isMainPlugin: boolean;
    isSidebarPlugin: boolean;
    pluginPages: {
        name: string;
        url: string;
    }[];
}

export async function GET() {
    let plugins: Plugin[] = [
        {
            id: "1",
            name: "flashcards",
            title: "Flashcards",
            description: "A plugin to help you memorize things",
            version: "1.0.0",
            author: "lexermal",
            endpoint: "/plugins/flashcards/index.html",
            endpointDev: "http://localhost:3001",
            pluginRepo: "https://github.com/lexermal/se-learning-assistant",
            pluginWebsite: "https://lexermal.github.io/se-learning-assistant/",
            isSidebarPlugin: true,
            isMainPlugin: true,
            pluginPages: [
                {
                    name: "Training",
                    url: "/",
                },
                {
                    name: "Translation",
                    url: "/sidebar/translate",
                },
            ],
            contextMenuActions: [
                {
                    text: "Add to flashcards",
                    pluginName: "flashcards",
                    action: "add",
                    url: "/sidebar/add"
                },
                {
                    text: "Translate",
                    pluginName: "flashcards",
                    action: "translate",
                    url: "/sidebar/translate"
                }
            ],
        },
    ];

    console.log("node env", process.env.NODE_ENV);

    plugins = plugins.map(plugin => {
        if (process.env.NODE_ENV !== "production") {
            console.log("Using dev endpoint for plugin", plugin.name);
            plugin.endpoint = plugin.endpointDev!;
        }
        delete plugin.endpointDev;
        return plugin;
    });
    return NextResponse.json(plugins);
}

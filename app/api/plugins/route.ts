import { MenuEntry } from "@/components/plugin/ContextMenu";
import { NextResponse } from "next/server";

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
    sidebarPages: {
        name: string;
        url: string;
        iconUrl?: string;
    }[];
    iconUrl: string;
    settingsPage: string;
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
            iconUrl: "http://localhost:3001/plugins/flashcards/logo.png",
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
            sidebarPages: [
                {
                    name: "Translate",
                    url: "/sidebar/translate",
                    iconUrl: "http://localhost:3001/plugins/flashcards/translate.png",
                },
                {
                    name: "Quick add",
                    url: "/sidebar/add",
                },
            ],
            settingsPage: "/settings",
        },
        {
            id: "2",
            name: "storytelling",
            title: "Storytelling",
            description: "A plugin to help you write stories",
            version: "1.0.0",
            author: "lexermal",
            endpoint: "/plugins/storytelling/index.html",
            endpointDev: "http://localhost:3002",
            pluginRepo: "https://lexermal.github.io/se-learning-assistant/",
            pluginWebsite: "https://lexermal.github.io/se-learning-assistant/",
            iconUrl: "http://localhost:3001/plugins/storytelling/logo.png",
            isSidebarPlugin: false,
            isMainPlugin: true,
            pluginPages: [
                // {
                //     name: "Entry page",
                //     url: "/",
                // },
                {
                    name: "Silent reading",
                    url: "/silent-reading",
                },
                // {
                //     name: "Storytelling",
                //     url: "/sidebar/write",
                // },
            ],
            contextMenuActions: [
                // {
                //     text: "Add to story",
                //     pluginName: "storytelling",
                //     action: "add",
                //     url: "/sidebar/add"
                // },
                // {
                //     text: "Write",
                //     pluginName: "storytelling",
                //     action: "write",
                //     url: "/sidebar/write"
                // }
            ],
            sidebarPages: [],
            settingsPage: "/settings",
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

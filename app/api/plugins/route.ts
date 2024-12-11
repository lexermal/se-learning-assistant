import { MenuEntry } from "@/components/plugin/ContextMenu";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export interface Plugin {
    id: string;
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
    pluginPages: {
        name: string;
        url: string;
        description: string;
    }[];
    sidebarPages: {
        name: string;
        url: string;
        iconUrl: string;
        description: string;
    }[];
    iconUrl: string;
    settingsPage: string;
}

export async function GET() {
    const supabase = await createClient();

    if ((await supabase.auth.getUser()).data.user === null) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let plugins: Plugin[] = [
        {
            id: "1",
            name: "flashcards",
            title: "Flashcards",
            description: "Memorize words, phrases, and more with flashcards.",
            version: "1.0.0",
            author: "lexermal",
            endpoint: "http://localhost:3101/plugins/flashcards/",
            endpointDev: "http://localhost:3001/plugins/flashcards/",
            pluginRepo: "https://github.com/lexermal/se-learning-assistant",
            pluginWebsite: "https://lexermal.github.io/se-learning-assistant/",
            iconUrl: "logo.png",
            pluginPages: [
                {
                    name: "Training",
                    url: "/",
                    description: "Quickly memorizing info by using flashcards."
                },
                {
                    name: "Translation",
                    url: "/sidebar/translate",
                    description: "Translating words into mutliple languages and quickly adding them to your flashcards."
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
                    iconUrl: "translate.png",
                    description: "Translate words."
                },
                {
                    name: "Quick add",
                    url: "/sidebar/add",
                    description: "Quickly add a word to your flashcards.",
                    iconUrl: "logo.png",
                },
            ],
            settingsPage: "/settings",
        },
        {
            id: "2",
            name: "storytelling",
            title: "Storytelling",
            description: "Learn vocabulary and grammar by reading stories.",
            version: "1.0.0",
            author: "lexermal",
            endpoint: "http://localhost:3101/plugins/storytelling/",
            endpointDev: "http://localhost:3002/plugins/storytelling/",
            pluginRepo: "https://lexermal.github.io/se-learning-assistant/",
            pluginWebsite: "https://lexermal.github.io/se-learning-assistant/",
            iconUrl: "logo.png",
            pluginPages: [
                {
                    name: "Silent reading",
                    url: "/silent-reading",
                    description: "Practice reading with stories you like on your skill level."
                },
            ],
            contextMenuActions: [],
            sidebarPages: [],
            settingsPage: "/settings",
        },
    ];

    console.log("node env", process.env.NODE_ENV);

    plugins = plugins.map(p => {
        if (process.env.NODE_ENV !== "production") {
            console.log("Using dev endpoint for plugin", p.name);
            p.endpoint = p.endpointDev!;
        }
        delete p.endpointDev;

        p.iconUrl = p.endpoint + p.iconUrl;
        p.sidebarPages = p.sidebarPages.map(sp => {
            sp.iconUrl = p.endpoint + sp.iconUrl;
            return sp;
        });

        return p;
    });
    return NextResponse.json(plugins);
}

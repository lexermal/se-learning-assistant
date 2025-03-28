import { MenuEntry } from "@/components/plugin/ContextMenu";
import { env } from "@/utils/constants";
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
        root: string;
    }[];
    sidebarPages: {
        name: string;
        url: string;
        iconUrl: string;
        description: string;
    }[];
    iconUrl: string;
    settingsPage: string;
    unmanaged?: boolean;
}

export async function GET() {
    const supabase = await createClient();

    if ((await supabase.auth.getUser()).data.user === null) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let plugins: Plugin[] = [
        {
            id: "pl454583483",
            name: "flashcards",
            title: "Flashcards",
            description: "Memorize words, phrases, and more with flashcards.",
            version: "1.0.0",
            author: "lexermal",
            endpoint: env.DEFAULT_PLUGIN_ENDPOINT + "/plugins/pl454583483/",
            endpointDev: "http://localhost:3001/plugins/pl454583483/",
            pluginRepo: "https://github.com/lexermal/se-learning-assistant",
            pluginWebsite: "https://lexermal.github.io/se-learning-assistant/",
            iconUrl: "logo.png",
            pluginPages: [
                {
                    name: "Flashcards",
                    url: "#/",
                    description: "Quickly memorizing info by using flashcards.",
                    root: "Memorizing"
                },
                // {
                //     name: "Translation",
                //     url: "#/sidebar/translate",
                //     description: "Translating words into mutliple languages and quickly adding them to your flashcards.",
                //     root: "Tools"
                // },
            ],
            contextMenuActions: [
                {
                    text: "Add to flashcards",
                    pluginName: "flashcards",
                    action: "add",
                    url: "#/sidebar/add"
                },
                {
                    text: "Translate",
                    pluginName: "flashcards",
                    action: "translate",
                    url: "#/sidebar/translate"
                }
            ],
            sidebarPages: [
                {
                    name: "Translate",
                    url: "#/sidebar/translate",
                    iconUrl: "translate.png",
                    description: "Translate words."
                },
                {
                    name: "Quick add",
                    url: "#/sidebar/add",
                    description: "Quickly add a word to your flashcards.",
                    iconUrl: "logo.png",
                },
            ],
            settingsPage: "#/settings",
        },
        {
            id: "pl976053336",
            name: "storytelling",
            title: "Storytelling",
            description: "Learn vocabulary and grammar by reading stories.",
            version: "1.0.0",
            author: "lexermal",
            endpoint: env.DEFAULT_PLUGIN_ENDPOINT + "/plugins/pl976053336/",
            endpointDev: "http://localhost:3002/plugins/pl976053336/",
            pluginRepo: "https://lexermal.github.io/se-learning-assistant/",
            pluginWebsite: "https://lexermal.github.io/se-learning-assistant/",
            iconUrl: "logo.png",
            pluginPages: [
                {
                    name: "Stories",
                    url: "#/silent-reading",
                    description: "Practice reading with stories you like on your skill level.",
                    root: "Reading"
                },
                {
                    name: "Discussions",
                    url: "#/discussions",
                    description: "Practice your swedish knowledge.",
                    root: "Speaking"
                }
            ],
            contextMenuActions: [],
            sidebarPages: [],
            settingsPage: "#/settings",
        },
        {
            id: "pl423940426",
            name: "resources",
            title: "Resources",
            description: "Useful resources to learn swedish.",
            version: "1.0.0",
            author: "lexermal",
            endpoint: "https://wiki.rimori.se/books/",
            endpointDev: "https://wiki.rimori.se/books/",
            pluginRepo: "https://github.com/lexermal/se-learning-assistant",
            pluginWebsite: "https://lexermal.github.io/se-learning-assistant/",
            iconUrl: "../logo.png",
            pluginPages: [
                {
                    name: "Grammar",
                    url: "grammar",
                    description: "Comprehensive guide to Swedish grammar rules and patterns.",
                    root: "Resources"
                },
                {
                    name: "Vocabulary",
                    url: "vocabulary",
                    description: "Curated lists of essential Swedish vocabulary by topic.",
                    root: "Resources"
                },
                {
                    name: "Reading",
                    url: "reading",
                    description: "Collection of Swedish texts and reading materials for all levels.",
                    root: "Resources"
                },
                {
                    name: "Listening",
                    url: "listening",
                    description: "Curated collection of Swedish podcasts, radio shows, and audio content.",
                    root: "Resources"
                },
                {
                    name: "Speaking",
                    url: "speaking",
                    description: "Guide to pronunciation and speaking practice resources.",
                    root: "Resources"
                },
                {
                    name: "Writing",
                    url: "writing",
                    description: "Writing guides, example texts, and common phrases in Swedish.",
                    root: "Resources"
                },
                {
                    name: "Watching",
                    url: "watching",
                    description: "Tv shows and movies to watch to improve your swedish.",
                    root: "Resources"
                }
            ],
            contextMenuActions: [
                // {
                //     text: "Add to flashcards",
                //     pluginName: "flashcards",
                //     action: "add",
                //     url: "/sidebar/add"
                // },
                // {
                //     text: "Translate",
                //     pluginName: "flashcards",
                //     action: "translate",
                //     url: "/sidebar/translate"
                // }
            ],
            sidebarPages: [
                // {
                //     name: "Translate",
                //     url: "/sidebar/translate",
                //     iconUrl: "translate.png",
                //     description: "Translate words."
                // },
                // {
                //     name: "Quick add",
                //     url: "/sidebar/add",
                //     description: "Quickly add a word to your flashcards.",
                //     iconUrl: "logo.png",
                // },
            ],
            settingsPage: "",
            unmanaged: true,
        },
        {
            id: "pl595258785",
            name: "writing",
            title: "Writing",
            description: "Improve your writing skills by writing and getting feedback.",
            version: "1.0.0",
            author: "lexermal",
            endpoint: env.DEFAULT_PLUGIN_ENDPOINT + "/plugins/pl595258785/",
            endpointDev: "http://localhost:3004/plugins/pl595258785/",
            pluginRepo: "https://lexermal.github.io/se-learning-assistant/",
            pluginWebsite: "https://lexermal.github.io/se-learning-assistant/",
            iconUrl: "logo.png",
            pluginPages: [
                {
                    name: "Writing Assistant",
                    url: "#/writing",
                    description: "Practice writing with the writing assistant.",
                    root: "Writing"
                },
            ],
            contextMenuActions: [],
            sidebarPages: [],
            settingsPage: "",
        },
    ];

    plugins = plugins.map(p => {
        // if (process.env.NODE_ENV !== "production") {
        //     console.log("Using dev endpoint for plugin", p.name);
        //     p.endpoint = p.endpointDev!;
        // }
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

import { NextRequest, NextResponse } from "next/server";

export interface Plugin {
    id: string;
    name: string;
    description: string;
    pluginRepo: string;
    pluginWebsite: string;
    version: string;
    author: string;
    endpoint: string;
    endpointDev?: string;
}

export async function GET() {
    let plugins = [
        {
            id: "1",
            name: "flashcards",
            description: "A plugin to help you memorize things",
            version: "1.0.0",
            author: "lexermal",
            endpoint: "/plugin/flashcards",
            endpointDev: "http://localhost:3001",
            pluginRepo: "https://github.com/lexermal/se-learning-assistant",
            pluginWebsite: "https://lexermal.github.io/se-learning-assistant/",
        },
    ] as Plugin[];

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

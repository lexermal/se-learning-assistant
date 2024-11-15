import { NextResponse } from "next/server";

export async function GET() {
    const plugins = [
        { name: "examplePlugin", description: "A sample plugin.", url: "/plugins/examplePlugin/index.html" },
        { name: "external", description: "A sample plugin.", url: "https://hello.com" },
        { name: "flashcards", description: "A sample plugin.", url: "http://localhost:3001" },
    ];
    return NextResponse.json(plugins);
}

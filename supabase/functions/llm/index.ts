import { getEnv } from "../_shared/Env.ts";
import { openai } from "npm:@ai-sdk/openai";
import { streamText, generateText, smoothStream } from "npm:ai";
import { getCorsHeaders } from "../_shared/Cors.ts";
import { getToolkit, Tool } from "../_shared/ToolBuilder.ts";
import { serve, WebServerResponse } from "../_shared/WebServer.ts";

interface RequestBody {
    messages: any;
    tools?: Tool[];
    stream?: boolean;
}

serve("POST", async ({ messages, stream = false, tools }: RequestBody) => {
    if (!messages) {
        return new WebServerResponse({ error: "No messages provided" }, 400);
    }

    if (stream) {
        const result = streamText({
            messages,
            onFinish: onFinish,
            tools: getToolkit(tools),
            model: openai("gpt-4o-mini", { apiKey: getEnv("OPENAI_API_KEY") }),
            experimental_transform: smoothStream(),
        });
        const headers: Record<string, string> = getCorsHeaders();
        headers["Content-Type"] = "text/event-stream";

        return result.toDataStreamResponse({ headers });
    }

    const result = await generateText({
        messages,
        onFinish: onFinish,
        tools: getToolkit(tools),
        model: openai("gpt-4o-mini", { apiKey: getEnv("OPENAI_API_KEY") }),
    });
    return new WebServerResponse({ messages: result.response.messages }, 200, "json");
});

function onFinish(event: any) {
    console.log("Usage: ", event.usage);
}


import { getEnv } from "../_shared/Env.ts";
import { openai } from "npm:@ai-sdk/openai";
import { streamText, generateText } from "npm:ai";
import { getCorsHeaders } from "../_shared/Cors.ts";
import ToolBuilder, { Tool } from "../_shared/ToolBuilder.ts";
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
            tools: buildTools(tools),
            model: openai("gpt-4o-mini", { apiKey: getEnv("OPENAI_API_KEY") }),
        });
        const headers: Record<string, string> = getCorsHeaders();
        headers["Content-Type"] = "text/event-stream";

        return result.toDataStreamResponse({ headers });
    }

    const result = await generateText({
        messages,
        onFinish: onFinish,
        tools: buildTools(tools),
        model: openai("gpt-4o-mini", { apiKey: getEnv("OPENAI_API_KEY") }),
    });
    return new WebServerResponse({ messages: result.response.messages }, 200, "json");
});

function onFinish(event: any) {
    console.log("Usage: ", event.usage);
}


function buildTools(tools?: Tool[]) {
    if (!tools) return undefined;

    const toolBuilder = new ToolBuilder();
    tools.forEach(tool => {
        const builder = toolBuilder.addClientTool(tool.name, tool.description);
        tool.parameters.forEach(parameter => {
            builder.addParameter(parameter.name, parameter.type, parameter.description);
        });
        builder.build();
    });

    return toolBuilder.getTools();
}
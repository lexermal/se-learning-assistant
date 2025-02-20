import { getEnv } from "../_shared/Env.ts";
import { openai } from "npm:@ai-sdk/openai";
import { streamObject, generateObject } from "npm:ai";
import { getCorsHeaders } from "../_shared/Cors.ts";
import { getObjectToolkit, ObjectTool } from "../_shared/ObjectBuilder.ts";
import { serve, WebServerResponse } from "../_shared/WebServer.ts";

interface RequestBody {
    tool: ObjectTool;
    stream?: boolean;
    behaviour?: string;
    instructions: string;
}

serve("POST", async (request: RequestBody) => {
    const { behaviour, instructions, stream = false, tool } = request;

    if (!instructions) {
        return new WebServerResponse({ error: "No instructions provided" }, 400);
    }

    if (!tool) {
        return new WebServerResponse({ error: "No tool provided" }, 400);
    }

    if (stream) {
        const result = streamObject({
            system: behaviour,
            prompt: instructions,
            onFinish: onFinish,
            schema: getObjectToolkit(tool),
            model: openai("gpt-4o-mini", { apiKey: getEnv("OPENAI_API_KEY") }),
        });
        const headers: Record<string, string> = getCorsHeaders();
        headers["Content-Type"] = "text/event-stream";

        return result.toDataStreamResponse({ headers });
    }

    const result = await generateObject({
        system: behaviour,
        prompt: instructions,
        onFinish: onFinish,
        schema: getObjectToolkit(tool),
        model: openai("gpt-4o-mini", { apiKey: getEnv("OPENAI_API_KEY") }),
    });
    console.log(result);
    return new WebServerResponse(result.object, 200, "json");
});

function onFinish(event: any) {
    console.log("Usage: ", event.usage);
}


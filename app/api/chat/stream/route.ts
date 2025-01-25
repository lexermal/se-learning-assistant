import { createClient } from '@/utils/supabase/server';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import ToolBuilder from './ToolBuilder';
import { Tool } from '@/utils/SharedComponetTypes';
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const supabase = await createClient();

  const { messages, tools } = await req.json();

  if (!messages) {
    return Response.json({ error: 'No messages provided' }, { status: 400 });
  }

  if ((await supabase.auth.getUser()).data.user === null) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = streamText({
    messages,
    tools: buildTools(tools),
    model: openai('gpt-4o-mini'),
    onFinish(event) {
      console.log("Usage: ", event.usage);
    },
  });

  return result.toDataStreamResponse();
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
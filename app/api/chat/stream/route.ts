import { createClient } from '@/utils/supabase/server';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const supabase = await createClient();

  const { messages } = await req.json();

  if (!messages) {
    return Response.json({ error: 'No messages provided' }, { status: 400 });
  }

  if ((await supabase.auth.getUser()).data.user === null) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages,
  });

  return result.toDataStreamResponse();
}
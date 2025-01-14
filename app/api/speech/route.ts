import { env } from '@/utils/constants';
import { NextResponse } from 'next/server';
import { ElevenLabsClient } from "elevenlabs";
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    const { input, voice = 'openai_alloy', speed = 1.0, language = "sv" } = await request.json();
    const [model, voiceId] = voice.split('_');

    if (!model || !voiceId) {
        return new NextResponse('Invalid voice format "' + voice + '". The format should look like this: openai_alloy', { status: 400 });
    }

    const supabase = await createClient();
    if ((await supabase.auth.getUser()).data.user === null) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (model === 'openai') {
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({ model: 'tts-1', input, voice: voiceId, speed })
        });
        if (!response.ok) {
            let errorMessage = "An internal server error occurred. Please try again later.";

            if (response.status >= 400 && response.status < 500) {

                errorMessage = 'An error occurred while processing the request. Is the model and voice correct? ';
                console.error('Error response when generating voice:', await response.text());
            }

            return new NextResponse(errorMessage, { status: response.status, headers: { 'Content-Type': 'text/plain' } });
        }

        return new NextResponse(await response.arrayBuffer(), {
            headers: { 'Content-Type': 'audio/mpeg' },
        });
    } else if (model === 'elevenlabs') {
        const elevenlabs = new ElevenLabsClient({ apiKey: env.ELEVENLABS_API_KEY });
        try {
            const audio = await elevenlabs.generate({
                text: input,
                voice: voiceId,
                language_code: language,
                model_id: "eleven_flash_v2_5",
            });

            return new Response(audio as any, { headers: { "Content-Type": "audio/mpeg" } });
        } catch (error: any) {
            const textBody = await error.body.text();
            console.error('Error at generating elevenlabs voice:', textBody);
            return Response.json(error, { status: error.statusCode });
        }
    } else {
        return new NextResponse('Invalid model', { status: 400 });
    }
}
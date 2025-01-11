import { env } from '@/utils/constants';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { input, voice = 'openai_alloy', speed = 1.0 } = await request.json();
    const [model, voiceId] = voice.split('_');

    let response;
    if (model === 'openai') {
        response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ model: 'tts-1', input, voiceId, speed })
        });
    } else if (model === 'elevenlabs') {
        response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'xi-api-key': env.ELEVENLABS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: input })
        });
    } else {
        return new NextResponse('Invalid model', { status: 400 });
    }

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
}
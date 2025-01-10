import { env } from '@/utils/constants';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { input, voice = 'alloy', speed = 1.0, model = 'openai' } = await request.json();

    let response;
    if (model === 'openai') {
        response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ model: 'tts-1', input, voice, speed })
        });
    } else if(model === 'elevenlabs') {
        response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
            method: 'POST',
            headers: {
                'xi-api-key': env.ELEVENLABS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: input })
        });
    }else {
        return new NextResponse('Invalid model', { status: 400 });
    }

    return new NextResponse(await response.arrayBuffer(), {
        headers: { 'Content-Type': 'audio/mpeg' },
    });
}
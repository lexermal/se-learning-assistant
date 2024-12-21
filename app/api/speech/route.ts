
import { env } from '@/utils/constants';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { input, voice = 'alloy', speed = 1.0 } = await request.json();

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: 'tts-1', input, voice, speed })
    });

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
        headers: {
            'Content-Type': 'audio/mpeg',
        },
    });
}
import { env } from "@/utils/constants";
import { NextResponse } from "next/server";

export async function openaiTTS(text: string, voiceId: string, speed: number) {
    const validVoices = ['alloy', 'ash', 'coral', 'echo', 'fable', 'onyx', 'nova', 'sage', 'shimmer']
    if (!validVoices.includes(voiceId)) {
        return new NextResponse('Invalid voice format or model. The format should look like this: openai_alloy', { status: 400, headers: { 'Content-Type': 'text/plain' } });
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({ model: 'tts-1', input: text, voice: voiceId, speed })
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
}
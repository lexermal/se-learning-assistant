import { getEnv } from "../../_shared/Env.ts";
import { WebServerResponse } from "../../_shared/WebServer.ts";

export async function openaiTTS(text: string, voiceId: string) {
    const validVoices = ['alloy', 'ash', 'coral', 'echo', 'fable', 'onyx', 'nova', 'sage', 'shimmer']
    if (!validVoices.includes(voiceId)) {
        return new WebServerResponse('Invalid voice format or model. The format should look like this: openai_alloy', 400);
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getEnv('OPENAI_API_KEY')}`,
        },
        body: JSON.stringify({ model: 'tts-1', input: text, voice: voiceId, speed: 1 })
    });
    if (!response.ok) {
        let errorMessage = "An internal server error occurred. Please try again later.";

        if (response.status >= 400 && response.status < 500) {

            errorMessage = 'An error occurred while processing the request. Is the model and voice correct? ';
            console.error('Error response when generating voice:', await response.text());
        }

        return new WebServerResponse(errorMessage, response.status);
    }

    return new WebServerResponse(await response.arrayBuffer(), response.status, 'audio');
}
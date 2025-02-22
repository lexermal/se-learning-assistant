import { openaiTTS } from './Openai.ts';
import { awsTTS } from './AWS_polly.ts';
import { WebServerResponse } from '../../_shared/WebServer.ts';
// import { elevenlabsTTS } from './Elevenlabs.ts';

export interface TTSRequest {
    input: string;
    voice: string;
    speed: number;
    language: string;
}

export async function tts(request: TTSRequest) {
    const { input, language, voice = 'openai_alloy', speed = 1.0 } = request;
    const [model, voiceId] = voice.split('_');

    if (!model || !voiceId) {
        return new WebServerResponse('Invalid voice format "' + voice + '". The format should look like this: openai_alloy', 400);
    }

    console.log("Creating speech for: ", { input, voiceId, speed, language });

    if (model === 'openai') {
        console.log("speed: ", speed);
        return await openaiTTS(input, voiceId);
        // } else if (model === 'elevenlabs') {
        //     return await elevenlabsTTS(input, voiceId, language);
    } else if (language || model === 'aws') {
        return await awsTTS(input, language, voiceId);
    } else {
        return new WebServerResponse('Invalid model', 400);
    }
}
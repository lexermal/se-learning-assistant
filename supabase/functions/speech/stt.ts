import { getEnv } from "../_shared/Env.ts";
import { WebError, WebErrorKey, WebServerResponse } from "../_shared/WebServer.ts";

export async function stt(file: File) {
    if (!file) {
        console.error('No file uploaded');
        throw new WebError('No file uploaded', WebErrorKey.NoFileUploaded, 400);
    }

    const formData = new FormData();
    formData.append('model', 'whisper-1');
    formData.append('file', file, 'audio.wav');

    return await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getEnv('OPENAI_API_KEY')}`, },
        body: formData as unknown as BodyInit,
    })
        .then((res) => res.json())
        .then((data) => new WebServerResponse({ text: data.text }))
        .catch((error) => {
            console.error('Error when converting voice into audio: ', { error });
            throw new WebError('Error when converting voice into audio: ' + error,
                WebErrorKey.ErrorWhenConvertingVoiceIntoAudio, 500);
        });
}
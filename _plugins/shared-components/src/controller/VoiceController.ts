
export async function getSTTResponse(audio: Blob) {
    const formData = new FormData();
    formData.append('file', audio);

    return await fetch('/api/stt', { method: 'POST', body: formData })
        .then(r => r.json())
        .then(r => r.text);
}

export async function getTTSResponse(text: string, voice: string, speed: number, language?: string) {
    return await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text, voice, speed, language }),
    }).then(r => r.blob());
}
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server';
import { env } from '@/utils/constants';

export async function POST(request: NextRequest) {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    const supabase = await createClient();
    if ((await supabase.auth.getUser()).data.user === null) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!file) {
        console.error('No file uploaded');
        return NextResponse.json({ error: 'No file uploaded' })
    }

    const formData = new FormData();
    formData.append('model', 'whisper-1');
    formData.append('file', file, 'audio.wav');

    return await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, },
        body: formData as unknown as BodyInit,
    })
        .then((res) => res.json())
        .then((data) => NextResponse.json({ text: data.text }))
        .catch((error) => {
            console.error('Error when converting voice into audio: ', { error });
            return NextResponse.json({ success: false })
        });
}
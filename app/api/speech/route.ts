import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { openaiTTS } from './Openai';
import { awsTTS } from './AWS_polly';
import { elevenlabsTTS } from './Elevenlabs';

export async function POST(request: Request) {
    const { input, voice = 'openai_alloy', speed = 1.0, language } = await request.json();
    const [model, voiceId] = voice.split('_');

    if (!model || !voiceId) {
        return new NextResponse('Invalid voice format "' + voice + '". The format should look like this: openai_alloy', { status: 400 });
    }

    const supabase = await createClient();
    if ((await supabase.auth.getUser()).data.user === null) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
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
        return new NextResponse('Invalid model', { status: 400 });
    }
}
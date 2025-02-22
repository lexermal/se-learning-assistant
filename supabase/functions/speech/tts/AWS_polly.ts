import { getEnv } from "../../_shared/Env.ts";
import { PollyClient, SynthesizeSpeechCommand, VoiceId } from "npm:@aws-sdk/client-polly";
import { Buffer } from "node:buffer";
import { getCorsHeaders } from "../../_shared/Cors.ts";

export async function awsTTS(text: string, language: string, voiceId?: string) {
    const polly = new PollyClient({
        region: 'eu-west-1',
        credentials: {
            accessKeyId: getEnv('AWS_ACCESS_KEY_ID'),
            secretAccessKey: getEnv('AWS_SECRET_ACCESS_KEY'),
        },
    });

    const langCode = getLanguageCode(language);

    const command = new SynthesizeSpeechCommand({
        Text: text,
        OutputFormat: 'mp3',
        LanguageCode: langCode,
        VoiceId: getVoiceId(langCode, voiceId),
    });

    const response = await polly.send(command);
    const audioStream = await streamToBuffer(response.AudioStream);
    return new Response(audioStream, {
        headers: {
            'Content-Type': 'audio/mpeg',
            ...getCorsHeaders(),
        }
    });
}

function streamToBuffer(stream: any): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}

function getVoiceId(langCode: string, voiceId?: string): VoiceId {
    const voiceIds = voices[langCode.substring(0, 2) as keyof typeof voices];

    if (voiceId && voiceId !== 'default' && !voiceIds.includes(voiceId)) {
        throw new Error(`Voice ${voiceId} not found for language ${langCode}`);
    }

    return (voiceId && voiceId !== 'default' ? voiceId : voiceIds[0]) as VoiceId;
}

function getLanguageCode(language: string) {
    switch (language.toLowerCase()) {
        case 'english':
        case 'en':
            return 'en-GB';
        case 'swedish':
        case 'sv':
            return 'sv-SE';
        case 'german':
        case 'de':
            return 'de-DE';
        case 'spanish':
        case 'es':
            return 'es-ES';
        case 'french':
        case 'fr':
            return 'fr-FR';
        case 'italian':
        case 'it':
            return 'it-IT';
        case 'japanese':
        case 'ja':
            return 'ja-JP';
        case 'korean':
        case 'ko':
            return 'ko-KR';
        case 'chinese':
        case 'zh':
            return 'cmn-CN';
        case 'portuguese':
        case 'pt':
            return 'pt-PT';
        case 'russian':
        case 'ru':
            return 'ru-RU';
        case 'dutch':
        case 'nl':
            return 'nl-NL';
        case 'polish':
        case 'pl':
            return 'pl-PL';
        case 'turkish':
        case 'tr':
            return 'tr-TR';
        case 'arabic':
        case 'ar':
            return 'arb';
        case 'hindi':
        case 'hi':
            return 'hi-IN';
        default:
            return 'en-GB';
    }
}

const voices = {
    ar: ["Zeina", "Hala", "Zayd"],
    nl: ["Lisa", "Laura", "Lotte", "Ruben"],
    ca: ["Arlet"],
    cs: ["Jitka"],
    yue: ["Hiujin"],
    cmn: ["Zhiyu"],
    da: ["Naja", "Mads", "Sofie"],
    en: [
        "Nicole", "Olivia", "Russell", "Amy", "Emma", "Brian", "Arthur", "Aditi",
        "Raveena", "Kajal", "Niamh", "Aria", "Ayanda", "Danielle", "Gregory",
        "Ivy", "Joanna", "Kendra", "Kimberly", "Salli", "Joey", "Justin", "Kevin",
        "Matthew", "Ruth", "Stephen", "Patrick", "Geraint"
    ],
    fi: ["Suvi"],
    fr: ["Celine", "Lea", "Mathieu", "Remi", "Isabelle", "Chantal", "Gabrielle", "Liam"],
    de: ["Marlene", "Vicki", "Hans", "Daniel", "Hannah", "Sabrina"],
    hi: ["Aditi", "Kajal"],
    is: ["Dora", "Karl"],
    it: ["Carla", "Bianca", "Giorgio", "Adriano"],
    ja: ["Mizuki", "Takumi", "Kazuha", "Tomoko"],
    ko: ["Seoyeon"],
    nb: ["Liv", "Ida"],
    pl: ["Ewa", "Maja", "Jacek", "Jan", "Ola"],
    pt: ["Camila", "Vitoria", "Ricardo", "Thiago", "Ines", "Cristiano"],
    ro: ["Carmen"],
    ru: ["Tatyana", "Maxim"],
    es: ["Conchita", "Lucia", "Alba", "Enrique", "Sergio", "Raul", "Mia", "Andres", "Lupe", "Penelope", "Miguel", "Pedro"],
    sv: ["Astrid", "Elin"],
    tr: ["Filiz", "Burcu"],
    cy: ["Gwyneth"]
};

// import { env } from "@/utils/constants";
// import { ElevenLabsClient } from "elevenlabs";

export async function elevenlabsTTS(input: string, voiceId: string, language: string) {
    // const elevenlabs = new ElevenLabsClient({ apiKey: env.ELEVENLABS_API_KEY });
    // try {
    //     const audio = await elevenlabs.generate({
    //         text: input,
    //         voice: voiceId,
    //         language_code: language,
    //         model_id: "eleven_flash_v2_5",
    //     });

    //     return new Response(audio as any, { headers: { "Content-Type": "audio/mpeg" } });
    // } catch (error: any) {
    //     const textBody = await error.body.text();
    //     console.error('Error at generating elevenlabs voice:', textBody);
    //     return Response.json(error, { status: error.statusCode });
    // }
}
import { stt } from "./stt.ts";
import { serve } from "../_shared/WebServer.ts";
import { tts, type TTSRequest } from "./tts/tts.ts";

serve("POST", async (request: TTSRequest | FormData) => {
    if (request instanceof FormData) {
        return await stt(request.get('file') as File);
    }
    return await tts(request);
});

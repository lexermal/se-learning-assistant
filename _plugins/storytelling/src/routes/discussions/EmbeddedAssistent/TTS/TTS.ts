import ChunkedAudioPlayer from "./Player";

export enum VoiceId {
    OLD_MAN = "t0jbNlBVZ17f02VDIeMI",
    KID = "jBpfuIE2acCO8z3wKNLl",
    // Add more voice IDs here...
    VISIONARY = "EXAVITQu4vr4xnSDxMaL"
}

export default class TTS {
    private socket: WebSocket;
    private chunks: string[] = [];
    private player = new ChunkedAudioPlayer();
    private sentencesParts = [] as number[];
    private messageCount = 0;

    private constructor(socket: WebSocket) {
        this.socket = socket;
    }

    // based on https://elevenlabs.io/docs/api-reference/websockets#example-voice-streaming-using-elevenlabs-and-openai
    static createAsync(voiceId: VoiceId, model = 'eleven_monolingual_v1'): Promise<TTS> {
        return new Promise((resolve, reject) => {
            const wsUrl = `ws://localhost:9000/${model}/${voiceId}`;
            const socket = new WebSocket(wsUrl);

            socket.onopen = () => {
                const bosMessage = {
                    "text": " ",
                    "voice_settings": {
                        "stability": 0.8,
                        "similarity_boost": 0.8
                    },
                    // "xi_api_key": apiKey
                };

                socket.send(JSON.stringify(bosMessage));

                const tts = new TTS(socket);
                socket.onmessage = tts.handleMessage.bind(tts);
                socket.onerror = tts.handleError.bind(tts);
                socket.onclose = tts.handleClose.bind(tts);

                resolve(tts);
            };

            socket.onerror = (error) => {
                reject(error);
            };
        });
    }

    endConversation() {
        const eosMessage = { "text": "" };

        this.socket.send(JSON.stringify(eosMessage));
    }

    sendMessage(text: string) {
        // console.log('Sending message ' + this.messageCount + ":" + text);

        const textMessage = {
            "text": text,
            "try_trigger_generation": true,
        };

        this.socket.send(JSON.stringify(textMessage));

        // If textMessage contains a sentence ending like . or ! or ?, write the current index to sentencesParts
        if (textMessage.text.match(/[.!?]/)) {
            // console.log("Sentence ending found")
            this.sentencesParts.push(this.messageCount);
        }
        this.messageCount++;
    }

    private base64ToArrayBuffer(base64: string) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    private handleMessage(event: MessageEvent) {
        const response = JSON.parse(event.data);

        if (response.audio) {
            const audioChunk = response.audio as string;
            this.chunks.push(audioChunk);
            this.player.addChunk(this.base64ToArrayBuffer(audioChunk), this.sentencesParts);
        } else {
            console.log("No audio data in the response");
        }

        if (response.isFinal) {
            console.log("sentence splits", this.sentencesParts);
            this.messageCount = 0;
            this.player.endConversation();

            // Clear the chunks after playing the audio
            this.chunks = [];
        }

        if (response.normalizedAlignment) {
            // use the alignment info if needed
        }
    }

    private handleError(error: Event) {
        console.error(`WebSocket Error: ${error}`);
    }

    private handleClose(event: CloseEvent) {
        if (event.wasClean) {
            console.info(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
        } else {
            console.warn('Connection died');
        }
    }
}

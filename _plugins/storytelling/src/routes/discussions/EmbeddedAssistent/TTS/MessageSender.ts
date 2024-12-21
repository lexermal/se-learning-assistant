import TTS, { VoiceId } from "./TTS";

// class that splits the text pieces so it can be sent in an efficient manner for allowing real-time communication
class MessageSender {
    private voiceId?: VoiceId;
    private updateCount = 0;
    private tts: TTS | null = null;
    private prefLastAssistentMessage = '';
    private voiceEnabled = true;
    // private ELEVENLABS_API_KEY = "";

    public setVoiceId(voiceId: VoiceId) {
        this.voiceId = voiceId;
    }

    public setVoiceEnabled(enabled: boolean) {
        this.voiceEnabled = enabled;
    }

    // public setElevenLabsApiKey(apiKey: string) {
    //     this.ELEVENLABS_API_KEY = apiKey;
    // }

    public async steamFullMessage(message: string) {
        if (!this.voiceEnabled) {
            return;
        }

        await this.streamOngoingMessage(true, undefined);

        const tokens = message.split(' ');
        for (let i = 0; i < tokens.length; i++) {
            await this.streamOngoingMessage(true, tokens.slice(0, i + 1).join(' '));
        }

        await this.streamOngoingMessage(false, message);
    }

    // This function slowly transmits the message as it is being generated
    public async streamOngoingMessage(inProgress: boolean, message: string | undefined) {
        if (!this.voiceEnabled) {
            return;
        }

        if (inProgress && !this.tts) {
            this.tts = await TTS.createAsync(this.voiceId!);
            // console.log('TTS created');
        }

        if (!message) {
            return;
        }

        if (message.includes(this.prefLastAssistentMessage)) {
            // Only send message on every second update
            // console.log('updateCount', this.updateCount);
            if (this.updateCount % 2 === 0) {
                this.sendMessage(message);
            }
            this.updateCount++;
        }

        if (!inProgress) {
            this.sendMessage(message, true);
            this.prefLastAssistentMessage = '';
            this.updateCount = 0;
            this.tts?.endConversation();
            // console.log('TTS ended');
            this.tts = null;
        }
    }

    private sendMessage(lastMessage: string, everything = false) {
        let newSubstring = lastMessage.replace(this.prefLastAssistentMessage, '');

        if (everything) {
            // console.log('will send full last rest of message:' + newSubstring);
            this.tts?.sendMessage(newSubstring);
            return;
        }

        // check if newSubstring contains no visible characters
        if (!newSubstring.trim()) {
            return;
        }

        const parts = newSubstring.split(' ');
        if (parts.length > 1 && !(parts.length === 2 && parts[0] === '')) {
            const subString = parts.splice(0, parts.length - 1).join(' ');
            // console.log('will send message:' + subString);
            // console.log('full string would have been:' + newSubstring);
            newSubstring = subString;
        }
        //check if newSubstring constains a sentence ending like . or ! or ?
        //if it does, send each part separately
        const parts2 = newSubstring.split(/(?<=[.?!])/);
        if (parts2.length > 1) {
            // console.log('found sentence ending, will send parts separately');
            //send a break before the next part
            // shit it makes such a difference now the voice sounds smooth!!!
            parts2[2] = parts2[1];
            parts2[1] = '   ';
        }
        parts2.forEach((part) => {
            this.tts?.sendMessage(part);
        });
        // append the new substring to the prefLastAssistentMessage
        this.prefLastAssistentMessage = this.prefLastAssistentMessage
            ? this.prefLastAssistentMessage + newSubstring
            : newSubstring;
    }
}

export default MessageSender;
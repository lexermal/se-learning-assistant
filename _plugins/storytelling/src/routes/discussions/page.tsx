import Assistentv2 from "./Assistentv2";
import { VoiceId } from "./EmbeddedAssistent/TTS/TTS";

export default function DiscussionsPage(){
    return <Assistentv2
    //the assistant does for now not work with small messages. It needs a bit of text to work properly
    // autoStartConversation={{
    //     userMessage: "Hi"
    // }}
    onComplete={(args) => console.log(args)}
    avatarImageUrl='https://www.gravatar.com/avatar/'
    voiceId={VoiceId.VISIONARY}
    endpoint='/api/chat'
    // body={{ entries }}
/>
}
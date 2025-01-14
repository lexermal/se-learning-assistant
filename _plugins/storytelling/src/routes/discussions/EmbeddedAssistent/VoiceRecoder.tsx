import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { FaMicrophone } from 'react-icons/fa6';
import { usePlugin } from 'shared-components';

interface Props {
  onVoiceRecorded: (message: string) => void;
}

const VoiceRecorder = forwardRef(({ onVoiceRecorded }: Props, ref) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { getVoiceToTextResponse } = usePlugin();

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current);
      audioChunksRef.current = [];

      onVoiceRecorded(await getVoiceToTextResponse(audioBlob));
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording,
  }));

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        <FaMicrophone className={"h-7 w-7 mr-2 " + (isRecording ? "text-red-600" : "")} />
      </button>
    </div>
  );
});

export default VoiceRecorder;
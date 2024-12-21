import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { FaMicrophone } from 'react-icons/fa6';

interface Props {
  onVoiceRecorded: (message: string) => void;
}

const VoiceRecorder = forwardRef(({ onVoiceRecorded }: Props, ref) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

      try {
        const text = await whisperRequestSTT(audioBlob);
        // console.log(text);
        onVoiceRecorded(text);
      } catch (error) {
        console.error('Error during whisperRequestSTT:', error);
      }
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

const whisperRequestSTT = async (audioFile: Blob) => {
  const formData = new FormData();
  formData.append('file', audioFile, 'audio.wav');

  const response = await fetch('/api/stt', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data.text;
};

export default VoiceRecorder;
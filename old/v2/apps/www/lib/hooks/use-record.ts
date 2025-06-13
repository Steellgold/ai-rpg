"use client";

import { useEffect, useState, useRef } from "react";
import { blobToBase64 } from "@imagine/ai/audio-utils";
import { createMediaStream } from "@imagine/ai/audio-utils";

export const useRecordVoice = (): {
  recording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  loading: boolean;
  text: string;
  error: string | null;
  disabled: boolean;
} => {
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState<boolean>(false);
  const isRecording = useRef<boolean>(false);
  const chunks = useRef<Blob[]>([]);

  const startRecording = (): void => {
    if (mediaRecorder) {
      isRecording.current = true;
      mediaRecorder.start();
      setRecording(true);
    } else {
      setError("MediaRecorder not initialized. Please check your microphone access.");
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      isRecording.current = false;
      mediaRecorder.stop();
      setRecording(false);
      setLoading(true);
      console.log("Recording stopped, processing audio...");
    }
  };

  const getText = async (base64data: string | undefined): Promise<void> => {
    if (!base64data) {
      console.error("No audio data available");
      setLoading(false);
      setError("No audio data available. Please try again.");
      return;
    }
    
    try {
      console.log("Sending audio data to API...");
      const response = await fetch("/api/speech-to-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio: base64data,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        setLoading(false);
        setError(`Error API: ${response.status}`);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setText(data.text);
      setLoading(false);
    } catch (error) {
      setError(`Erreur: ${error instanceof Error ? error.message : "Unknown error"}`);
      console.error("Error in getText:", error);
      setLoading(false);
    }
  };

  const initialMediaRecorder = (stream: MediaStream): void => {
    console.log("Initializing media recorder");
    const recorder = new MediaRecorder(stream);

    recorder.onstart = (): void => {
      console.log("Recording started");
      createMediaStream(stream, isRecording.current, (peak) => {
        console.log("Audio peak:", peak);
      });
      chunks.current = [];
    };

    recorder.ondataavailable = (ev: BlobEvent): void => {
      console.log("Data chunk available");
      chunks.current.push(ev.data);
    };

    recorder.onstop = (): void => {
      console.log("Recording stopped, processing chunks...");
      const audioBlob = new Blob(chunks.current, { type: "audio/wav" });
      console.log("Audio blob created, size:", audioBlob.size);
      blobToBase64(audioBlob, getText);
    };

    setMediaRecorder(recorder);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("Checking for microphone support");
      
      if (!navigator.mediaDevices) {
        console.error("MediaDevices API not supported");
        setError("API MediaDevices not supported. Please check your browser.");
        setDisabled(true);
        return;
      }
      
      console.log("Requesting microphone access");
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(initialMediaRecorder)
        .catch(error => {
          console.error("Error accessing microphone:", error);
          setError("Error accessing microphone. Please check permissions.");
          setDisabled(true);
        });
    }
    
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    };
  }, []);

  return { recording, startRecording, stopRecording, text, loading, error, disabled };
};
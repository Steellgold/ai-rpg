import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRecordVoice } from "@/lib/hooks/use-record";
import { Component } from "@/lib/types/component";

interface VoiceRecorderProps {
  onTextRecorded: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export const VoiceRecorder: Component<VoiceRecorderProps> = ({ onTextRecorded, disabled, className }) => {
  const t = useTranslations("AiTextarea.Record");
  const {
    recording,
    startRecording,
    stopRecording,
    text: recordedText,
    loading: recordLoading,
    disabled: recordDisabled
  } = useRecordVoice();

  const handleRecording = async () => {
    if (recording) {
      await stopRecording();
      if (recordedText) {
        onTextRecorded(recordedText);
      }
    } else {
      startRecording();
    }
  };

  return (
    <Button
      variant="outline"
      size="toolText"
      className={cn("rounded-full border-gray-700 transition-all", {
        "bg-red-500/20 text-red-400 hover:bg-red-600/20 border-red-500": recording,
        "bg-gray-800 text-gray-400 hover:bg-gray-700": !recording && !recordLoading,
        "cursor-not-allowed": recordDisabled || disabled || recordLoading
      }, className)}
      onClick={handleRecording}
      disabled={recordDisabled || disabled || recordLoading}
      aria-label={recording ? t("Stop") : t("Record")}
    >
      {recordLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-white" />
      ) : recording ? (
        <MicOff size={16} />
      ) : (
        <Mic size={16} />
      )}
    </Button>
  );
} 
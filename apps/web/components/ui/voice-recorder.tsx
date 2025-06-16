"use client";

import { useRecorder, MAX_RECORDING_TIME } from "@workspace/ui/hooks/use-record"
import { Button } from "@workspace/ui/components/button"
import { AudioPlayer } from "./audio-player"
import { cn } from "@workspace/ui/lib/utils"
import { Mic } from "lucide-react"
import React from "react"

export const VoiceRecorder = () => {
  const {
    // State
    status, elapsedTime,
    audioDuration, playbackProgress,
    // Functions
    record, stop, play, pause,
    discard, sendRecording,
  } = useRecorder()

  const isRecording = status === "RECORDING"
  const isPlaying = status === "PLAYING"
  const hasRecording = status === "PLAYING" || status === "PAUSED" || status === "RECORDED"

  const handleClick = () => {
    if (isRecording) stop()
    else record()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <>
      {hasRecording ? (
        <AudioPlayer
          isPlaying={isPlaying}
          duration={audioDuration}
          currentTime={playbackProgress}
          onPlay={play}
          onPause={pause}
          onDiscard={discard}
          onSend={sendRecording}
        />
      ) : (
        <>
          <div className="relative inline-block">
            <Button
              variant="default"
              size={isRecording ? "md" : "ycon"}
              onClick={handleClick}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
              className={cn(
                "rounded-full transition-all bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a] relative overflow-hidden inline-flex items-center gap-2 px-4 py-2",
                { "bg-red-500/20 text-red-400 hover:bg-red-600/20": isRecording },
              )}
              disabled={status === "NOT_SUPPORTED"}
            >
              {isRecording && (
                <div
                  className="absolute inset-0 bg-red-500/40 transition-all duration-300 ease-out rounded-l-full"
                  style={{
                    width: `${(elapsedTime / MAX_RECORDING_TIME) * 100}%`,
                  }}
                />
              )}

              <>
                {isRecording ? (
                  <div className="relative z-10">
                    <span className="text-sm flex items-center">
                      <Mic size={16} className="mr-2" />
                      {formatTime(elapsedTime)}&nbsp;/&nbsp;{formatTime(MAX_RECORDING_TIME)}
                    </span>
                  </div>
                ) : <Mic size={16} />}
              </>
            </Button>
          </div>
        </>
      )}
    </>
  )
}

export default VoiceRecorder;
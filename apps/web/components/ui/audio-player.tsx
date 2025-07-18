"use client";

import React from "react"
import { Button } from "@workspace/ui/components/button"
import { Play, Pause, Trash, CircleCheck } from "lucide-react"
import { Component } from "@workspace/ui/types/component";

type AudioPlayerProps = {
  isPlaying: boolean
  duration: number
  currentTime: number
  //
  onPlay: () => void
  onPause: () => void
  onDiscard: () => void
  onSend: () => void
}

export const AudioPlayer: Component<AudioPlayerProps> = ({
  isPlaying, duration, currentTime,
  onPlay, onPause, onDiscard, onSend
}) => {
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return "00:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progressWidth = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex items-center justify-between py-0">
      <>
        <Button
          variant="default"
          size={"md"}
          onClick={isPlaying ? onPause : onPlay}
          className="rounded-l-full bg-blue-500/20 text-blue-400 hover:bg-blue-600/20 relative overflow-hidden inline-flex items-center gap-2 px-4 py-2"
        >
          <div
            className="absolute inset-0 bg-blue-500/40 transition-all duration-300 ease-out rounded-l-full"
            style={{ width: `${progressWidth}%` }}
          />

          <div className="relative z-10 flex items-center gap-2">
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            <span className="text-sm">
              {formatTime(currentTime)}&nbsp;/&nbsp;{formatTime(duration)}
            </span>
          </div>
        </Button>
      </>

      <div className="flex items-center">
        <Button
          variant="default"
          size={"icon"}
          onClick={onDiscard}
          className="rounded-none bg-red-500/20 text-red-400 hover:bg-red-600/20"
        >
          <Trash size={16} />
        </Button>

        <Button
          variant="default"
          size={"icon"}
          onClick={onSend}
          className="rounded-r-full bg-violet-500/20 text-violet-400 hover:bg-violet-600/20"
        >
          <CircleCheck size={16} />
        </Button>
      </div>
    </div>
  )
}
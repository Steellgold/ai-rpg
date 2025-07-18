"use client"

import { useEffect, useRef, useState, useCallback } from "react"

export const MAX_RECORDING_TIME = 170

type RecorderStatus = "IDLE" | "RECORDING" | "PLAYING" | "PAUSED" | "RECORDED" | "NOT_SUPPORTED"

export const useRecorder = () => {
  const [status, setStatus] = useState<RecorderStatus>("IDLE")
  const [elapsedTime, setElapsedTime] = useState(0)
  const [audioData, setAudioData] = useState<number[]>([])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioDuration, setAudioDuration] = useState(0)
  const [playbackProgress, setPlaybackProgress] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const recordingDurationRef = useRef<number>(0)

  useEffect(() => {
    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setStatus("NOT_SUPPORTED")
    } else {
      setStatus("IDLE")
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop()

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [])

  const record = useCallback(async () => {
    if (status === "NOT_SUPPORTED") return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)

        const recordingDuration = recordingDurationRef.current
        setAudioDuration(recordingDuration)

        const audio = new Audio(url)
        audioRef.current = audio
        setStatus("RECORDED")

        stream.getTracks().forEach((track) => track.stop())
        audioContext.close()
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setStatus("RECORDING")
      setElapsedTime(0)

      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const newTime = prev + 1
          recordingDurationRef.current = newTime
          if (newTime >= MAX_RECORDING_TIME) {
            stopRecording()
            return MAX_RECORDING_TIME
          }
          return newTime
        })
      }, 1000)

      const updateAudioData = () => {
        if (analyserRef.current && mediaRecorderRef.current?.state === "recording") {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
          analyserRef.current.getByteFrequencyData(dataArray)

          const normalizedData = Array.from(dataArray.slice(0, 20)).map((value) => value / 255)
          setAudioData(normalizedData)

          animationRef.current = requestAnimationFrame(updateAudioData)
        }
      }
      updateAudioData()
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }, [stopRecording, status])

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && status === "RECORDING") {
      stopRecording()
    }
  }, [status, stopRecording])

  const play = useCallback(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play()
      setStatus("PLAYING")

      playbackIntervalRef.current = setInterval(() => {
        if (audioRef.current) setPlaybackProgress(audioRef.current.currentTime)
      }, 100)
    }
  }, [audioUrl])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setStatus("PAUSED")

      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
      }
    }
  }, [])

  const discard = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    if (audioRef.current) {
      audioRef.current.pause()
    }
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current)
    }
    setAudioUrl(null)
    setStatus("IDLE")
    setElapsedTime(0)
    setPlaybackProgress(0)
    setAudioData([])
    setAudioDuration(0)
    recordingDurationRef.current = 0
  }, [audioUrl])

  const sendRecording = useCallback(() => {
    console.log("Sending recording:", audioUrl)
    discard()
  }, [audioUrl, discard])

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current

      const handleEnded = () => {
        setStatus("PAUSED")
        setPlaybackProgress(0)

        if (playbackIntervalRef.current) {
          clearInterval(playbackIntervalRef.current)
        }
      }

      audio.addEventListener("ended", handleEnded)

      return () => {
        audio.removeEventListener("ended", handleEnded)
      }
    }
  }, [audioUrl])

  return {
    status,
    record,
    stop,
    play,
    pause,
    discard,
    sendRecording,
    elapsedTime,
    audioData,
    audioUrl,
    audioDuration,
    playbackProgress,
  }
}

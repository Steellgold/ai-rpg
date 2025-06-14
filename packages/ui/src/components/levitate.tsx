"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Component } from "@workspace/ui/types/component"
import type { ReactNode } from "react"

type Orientation = "vertical" | "horizontal" | "diagonal"

interface LevitateProps {
  children: ReactNode
  amplitude?: number
  speed?: number
  orientation?: Orientation
  reverse?: boolean
  className?: string
  style?: React.CSSProperties
  disabled?: boolean
}

export const Levitate: Component<LevitateProps> = ({
  children,
  amplitude = 10,
  speed = 1,
  orientation = "vertical",
  reverse = false,
  className = "",
  style = {},
  disabled = false,
  ...props
}) => {
  const [floatPosition, setFloatPosition] = useState(0);

  useEffect(() => {
    let animationFrameId: number
    let startTime: number | null = null

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsedTime = timestamp - startTime

      const basePosition = Math.sin((elapsedTime / 1000) * speed) * amplitude
      const newPosition = reverse ? -basePosition : basePosition
      setFloatPosition(newPosition)

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [amplitude, speed, reverse])

  const getTransform = () => {
    switch (orientation) {
      case "horizontal":
        return `translateX(${floatPosition}px)`
      case "diagonal":
        const rotationDegrees = (floatPosition / amplitude) * 15
        return `rotate(${rotationDegrees}deg)`
      case "vertical":
      default:
        return `translateY(${floatPosition}px)`
    }
  }
  
  if (disabled) return <>{children}</>;

  return (
    <div
      className={className}
      style={{
        transform: getTransform(),
        transition: "transform 0.1s ease-out",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

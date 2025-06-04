"use client"

import { Component } from "@/lib/types/component"
import { useState, useEffect, ReactNode } from "react"

interface LevitateProps {
  children: ReactNode
  amplitude?: number
  speed?: number
  className?: string
  style?: React.CSSProperties
}

export const Levitate: Component<LevitateProps> = ({
  children, amplitude = 10, speed = 1, className = "", style = {}, ...props
}) => {
  const [floatPosition, setFloatPosition] = useState(0)
  
  useEffect(() => {
    let animationFrameId: number
    let startTime: number | null = null
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsedTime = timestamp - startTime
      
      const newPosition = Math.sin(elapsedTime / 1000 * speed) * amplitude
      setFloatPosition(newPosition)
      
      animationFrameId = requestAnimationFrame(animate)
    }
    
    animationFrameId = requestAnimationFrame(animate)
    
    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [amplitude, speed])

  return (
    <div
      className={className}
      style={{
        transform: `translateY(${floatPosition}px)`,
        transition: "transform 0.1s ease-out",
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  )
}
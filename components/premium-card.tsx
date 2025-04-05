"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check } from "lucide-react"
import { Component } from "@/lib/types"

interface PremiumBannerProps {
  title?: string
  description?: string
  features?: string[]
  ctaText?: string
  onCtaClick?: () => void
}

export const PremiumBanner: Component<PremiumBannerProps> = ({
  title = "Upgrade to Premium",
  description = "Unlock exclusive features and benefits with our premium plan",
  features = ["Premium support", "Exclusive content", "Advanced features"],
  ctaText = "Get Premium",
  onCtaClick = () => {},
}) => {
  const [floatPosition, setFloatPosition] = useState(0);
  
  useEffect(() => {
    let animationFrameId: number;
    let startTime: number | null = null;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      
      const newPosition = Math.sin(elapsedTime / 1000) * 10;
      setFloatPosition(newPosition);

      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="bg-white relative overflow-hidden rounded-xl border border-[#e2c283]/30 shadow-lg">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#fade70]/20 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#895115]/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />

      <div className="relative z-10 grid md:grid-cols-[1fr_auto] gap-6 p-6 md:p-8">
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xl md:text-2xl font-bold text-[#895115]">{title}</h2>
          </div>

          <p className="text-sm md:text-base text-[#895115]/80 mb-4 max-w-xl">{description}</p>

          {features.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-white/60 flex items-center justify-center">
                    <Check className="h-3 w-3 text-[#895115]" />
                  </div>
                  <span className="text-sm text-[#895115]/90">{feature}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto">
            <Button onClick={onCtaClick} className="group bg-[#895115] hover:bg-[#895115]/90 text-white">
              {ctaText}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center">
          <div
            className="relative w-40 h-40 flex items-center justify-center"
            style={{
              transform: `rotate(5deg) scale(1.05) translateY(${floatPosition * 1.2}px)`,
              transition: "transform 0.1s ease-out",
            }}
          >
            <div className="absolute inset-0 bg-white/20 rounded-full blur-md" />
            <Image src="/crown.webp" alt="Premium Crown" width={160} height={160} className="relative z-10" />
          </div>
        </div>
      </div>
    </div>
  )
}
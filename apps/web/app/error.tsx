"use client";

import { Button } from "@/components/ui/button";
import Noise from "@/components/ui/noise";
import type { Component } from "@/lib/types";
import { IterationCcw } from "lucide-react";
import { useEffect } from "react";

const Error: Component<{
  error: Error & { digest?: string }
  reset: () => void
}> = ({ error, reset }) => {
  useEffect(() => {
    console.error(error)
  }, [error])
 
  return (
    <>
      <div className="flex flex-col items-center justify-center flex-1 py-16 text-center">
        <h2 className="text-3xl font-bold">
          An error occurred
        </h2>

        <p className="mb-4">
          {error.message}
        </p>

        <Button variant="outline" onClick={reset} className="cursor-pointer z-[13]">
          <IterationCcw className="w-4 h-4 mr-2" />
          Try again
        </Button>
      </div>
          
      <Noise
        patternSize={250}
        patternScaleX={1}
        patternScaleY={1}
        patternRefreshInterval={2}
        patternAlpha={15}
      />
    </>
  )
}

export default Error
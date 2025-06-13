"use client";

import { ArrowUp } from "lucide-react";
import Image from "next/image";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Levitate } from "@workspace/ui/components/levitate";
import { cn } from "@workspace/ui/lib/utils";
import { useEffect, useRef } from "react";
import { Component } from "@workspace/ui/types/component";
import { VoiceRecorder } from "../ui/voice-recorder";

type StoryInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
};

export const StoryInput: Component<StoryInputProps> = ({ value = "", onChange, disabled = false }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);


  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        if (onChange) {
          onChange(e.target.value);
        }
      }}
      placeholder="Placeholder"
      className={cn(
        "min-h-[120px] resize-none bg-gray-800/50 border-gray-700 text-gray-200 placeholder:text-gray-400 w-full overflow-hidden"
      )}
      disabled={disabled}
      autoFocus
    />
  );
};

export const AiTextarea = () => {
  return (
    <div className="w-full space-y-4 relative">
      <Card className="relative overflow-hidden border bg-[#070910] border-[#1e293b] p-4 z-10">
        <div className="relative z-10 space-y-4">
          <div className="space-y-3">
            <StoryInput />

            <div className="flex justify-end items-center gap-2">
              <VoiceRecorder />

              <Button
                variant="default"
                size="sm9"
                className="rounded-full bg-indigo-500 hover:bg-indigo-600 text-white transition-all"
              >
                <ArrowUp size={16} />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Image
        src={"/assets/illustrations/dragon-body.svg"}
        alt="dragon"
        width={90}
        height={90}
        className="absolute -top-[55px] -right-[35px] rotate-[31deg] select-none pointer-events-none hidden lg:block"
      />

      <Image
        src={"/assets/illustrations/portal.svg"}
        alt="portal"
        width={200}
        height={200}
        className="absolute top-10 -left-30 rotate-12 select-none pointer-events-none hidden lg:block"
      />

      <Levitate>
        <Image
          src={"/assets/illustrations/potion.svg"}
          alt="potion"
          width={75}
          height={75}
          className="absolute bottom-5 -right-11 select-none pointer-events-none hidden lg:block"
        />
      </Levitate>
    </div>
  );
};
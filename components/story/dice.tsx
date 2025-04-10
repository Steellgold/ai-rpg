"use client";

import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Component } from "@/lib/types";

type DiceCubeProps = HTMLAttributes<HTMLDivElement> & {
  face?: number;
  size?: "sm" | "md" | "lg";
  displayType?: "number" | "dots";
};

type Position = "top-left" | "top-right" | "middle-left" | "middle-right" | "bottom-left" | "bottom-right" | "center";

export const DiceCube: Component<DiceCubeProps> = ({
  face = 1,
  size = "md",
  displayType = "dots",
  className = ""
}) => {
  const validFace = typeof face === "number" && face >= 1 && face <= 6 ? face : 1;
  
  const sizeClasses = {
    sm: "w-9 h-9 text-sm",
    md: "w-16 h-16 text-base",
    lg: "w-24 h-24 text-lg"
  };
  
  const dotPositions: { [key: number]: Position[]; } = {
    1: ["center"],
    2: ["top-left", "bottom-right"],
    3: ["top-left", "center", "bottom-right"],
    4: ["top-left", "top-right", "bottom-left", "bottom-right"],
    5: ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
    6: ["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right"],
  };

  const getDotSize = () => {
    switch (size) {
      case "sm": return "w-1.5 h-1.5";
      case "lg": return "w-4 h-4";
      default: return "w-2.5 h-2.5";
    }
  };

  const getPositionClass = (position: Position) => {
    switch (position) {
      case "top-left": return "absolute top-2 left-2";
      case "top-right": return "absolute top-2 right-2";
      case "middle-left": return "absolute top-1/2 left-2 -translate-y-1/2";
      case "middle-right": return "absolute top-1/2 right-2 -translate-y-1/2";
      case "bottom-left": return "absolute bottom-2 left-2";
      case "bottom-right": return "absolute bottom-2 right-2";
      case "center": return "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      default: return "";
    }
  };

  return (
    <div 
      className={cn(
        "bg-white text-black rounded-lg shadow-lg flex justify-center items-center relative",
        sizeClasses[size] || sizeClasses.md,
        className
      )}
    >
      {displayType === "number" ? (
        <span className="font-bold">{validFace}</span>
      ) : (
        dotPositions[validFace].map((position, index) => (
          <div 
            key={index} 
            className={cn(
              "bg-black rounded-full",
              getDotSize(),
              getPositionClass(position)
            )} 
          />
        ))
      )}
    </div>
  );
};
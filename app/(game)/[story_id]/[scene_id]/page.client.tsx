"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Component } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import Image from "next/image";

type PageClientProps = {
  story_data: Prisma.StoryGetPayload<{}>;
  scene_data: Prisma.SceneGetPayload<{
    include: {
      choices: {
        select: {
          consequence: true,
          description: true,
          loadingMessage: true,
          text: true,
          id: true
        }
      }
    }
  }>;
};

export const PageClient: Component<PageClientProps> = ({ story_data: storyData, scene_data: sceneData }) => {
  return (
    <div className="flex flex-col mt-16 p-4">
      <div className="flex flex-row gap-2 bg-gray-100/5 p-4 rounded-md">
        <Badge variant="outline" className="text-md">{storyData.title}</Badge>
        <Badge variant="outline" className="text-md">{storyData.current_scene}&nbsp;/&nbsp;{storyData.max_scenes}</Badge>
      </div>

      <Card className={cn("mt-4", "w-full", "bg-gray-100/5")}>
      </Card>
    </div>
  );
}
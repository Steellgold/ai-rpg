"use client";

import { ReactElement } from "react";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";
import { Component } from "@/lib/types";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useTranslations } from "next-intl";
import { ChildrenStoryTag } from "./children-story.tag";

export const StoryCard: Component<Prisma.StoryGetPayload<{
  select: {
    synopsis: true,
    title: true,
    isChildrenStory: true,
    genre: true,
    characters: {
      select: {
        _count: true
      }
    },
    creator: {
      select: {
        id: true,
        display_name: true,
        image_url: true
      }
    },
    createdAt: true,
    coverImageUrl: true,
    goal: true,
    id: true
  }
}>> = ({ ...story }) => {
  const g = useTranslations("Utils.Genres")

  return (
    <Card className={cn(
      "w-full h-full flex flex-col", {
        "pt-0": story.coverImageUrl
      }
    )} key={story.id}>
      {story.coverImageUrl && (
        <div className="relative w-full h-48">
          <Image src={story.coverImageUrl} alt={story.title} fill className="rounded-t-lg object-cover" />
        </div>
      )}

      <CardContent className="flex flex-col gap-2 pt-0">
        <div className="mb-2">
          <CardTitle className="text-xl">{story.title}</CardTitle>

          <div className="flex flex-wrap gap-1 mt-2">
            {story.isChildrenStory && <ChildrenStoryTag />}

            {story.genre && story.genre.map((genre, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {g(genre + ".label")}
              </Badge>
            ))}

          </div>
        </div>
        
        <p className="line-clamp-4 italic text-base">{story.synopsis}</p>
        
        <div className="flex items-center mt-auto pt-4">
          {story.creator?.image_url && (
            <Image
              src={story.creator.image_url}
              alt={story.creator.display_name || "Creator"}
              width={24}
              height={24}
              className="rounded-full mr-2"
            />
          )}
          <span className="text-sm text-gray-400">
            By {story.creator?.display_name || "Anonymous"}
          </span>
        </div>
      </CardContent>

      {/* <CardFooter className="gap-1 pt-0">
        <Button variant="outline" className="w-full">
          Fork this story
        </Button>
      </CardFooter> */}
    </Card>
  )
}
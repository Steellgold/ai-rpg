import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Component } from "@/lib/types";
import { Prisma } from "@prisma/client";

type SceneListProps = {
  scenes: Prisma.SceneGetPayload<{
    select: {
      id: true,
      title: true,
      content: true,
      imageUrl: true,
      imagePrompt: true,
      choices: {
        select: {
          consequence: true,
          text: true,
          id: true,
          isCustomChoice: true,
          isPersonalized: true,
          isItemRelated: true,
          description: true
        }
      },
      selected_choice_id: true,
    }
  }>[];
  storyId: string;
  selectedSceneId: string;
}

const SceneList: Component<SceneListProps> = ({
  scenes, storyId, selectedSceneId
}) => {
  if (!scenes || scenes.length <= 1) return <></>;

  return (
    <div className="w-1/5">
      <Card className="w-full bg-gray-100/5">
        <CardHeader className="pb-0 -mb-2">
          <CardTitle>Scènes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-row xl:flex-col gap-0.5 xl:gap-2 items-center flex-wrap">
          {scenes.map((scene) => (
            <Link
              key={scene.id}
              href={
                scene.selected_choice_id ? `/${storyId}/${scene.id}` : `/${storyId}`
              }
              className={cn(
                "flex flex-row gap-2 items-center w-full p-2 rounded-md hover:bg-gray-100/10",
                selectedSceneId === scene.id ? "bg-gray-100/10" : "bg-transparent"
              )}
            >
              <div className="flex flex-row gap-2 items-center w-full">
                <div className="flex flex-col w-full">
                  <span className="text-sm font-medium">{scene.title}</span>
                </div>
                {scene.selected_choice_id && (
                  <Check className="text-green-500" size={16} />
                )}
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SceneList;
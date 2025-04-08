import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Expand, Shrink } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatSceneContent } from "@/components/story-related/format-text-scene";
import { Component } from "@/lib/types";
import { Prisma } from "@prisma/client";
import { useTranslations } from "next-intl";

type SceneContentProps = {
  sceneData: Prisma.SceneGetPayload<{
    include: {
      choices: {
        select: {
          consequence: true;
          description: true;
          loadingMessage: true;
          isCustomChoice: true;
          isPersonalized: true;
          isItemRelated: true;
          text: true;
          id: true;
        };
      };
      items: {
        select: {
          isHidden: true;
          item: {
            select: {
              id: true;
              name: true;
              description: true;
              type: true;
              rarity: true;
              effect: true;
              useCount: true;
              imageUrl: true;
            };
          };
        };
      };
      dialogues?: {
        select: {
          id: true;
          speaker: true;
          text: true;
          emotion: true;
        };
      };
    };
  }>;
  storyData: any;
  loading: boolean;
  showFullImage: boolean;
  setShowFullImage: (show: boolean) => void;
};

const SceneContent: Component<SceneContentProps> = ({
  sceneData,
  storyData,
  loading,
  showFullImage,
  setShowFullImage,
}) => {
  const t = useTranslations("Pages.Story");

  const prepareContentWithDialogues = () => {
    if (!sceneData.dialogues || sceneData.dialogues.length === 0) {
      return sceneData.content;
    }

    let content = sceneData.content;
    const dialogueMarker = "__DIALOGUE__";
    const dialogues = [...sceneData.dialogues].sort((a, b) => (a.order || 0) - (b.order || 0));

    let i = 0;
    while (content.includes(dialogueMarker)) {
      if (i < dialogues.length) {
        content = content.replace(dialogueMarker, `__DIALOGUE:${i}__`);
        i++;
      } else {
        content = content.replace(dialogueMarker, "");
      }
    }

    return content;
  };

  return (
    <Card className={cn("w-full bg-gray-100/5", { "pt-0": sceneData.imageUrl })}>
      {sceneData.imageUrl && (
        <div className="relative">
          <Image
            src={sceneData.imageUrl}
            alt={t("SceneImage")}
            width={500}
            height={300}
            className={cn("w-full object-cover rounded-t-md", {
              "animate-pulse": loading,
              "h-56": !showFullImage,
              "h-auto": showFullImage,
            })}
          />
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 bg-white/10 hover:bg-white/20"
            onClick={() => setShowFullImage(!showFullImage)}
          >
            {showFullImage ? <Shrink size={16} /> : <Expand size={16} />}
          </Button>
        </div>
      )}
      <CardHeader>
        <CardTitle className={cn({ "animate-pulse": loading })}>
          {sceneData.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <CardDescription className={cn({ "animate-pulse": loading })}>
          {formatSceneContent(
            prepareContentWithDialogues(),
            storyData.characters,
            [
              ...storyData.items,
              ...sceneData.items.filter((si) => !si.isHidden).map((si) => si.item),
            ],
            sceneData.dialogues || [],
            loading
          )}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default SceneContent;
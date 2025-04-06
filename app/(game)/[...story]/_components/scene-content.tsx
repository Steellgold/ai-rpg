import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Expand, Shrink } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatSceneContent } from "@/components/format-text-scene";
import { Component } from "@/lib/types";

interface SceneContentProps {
  sceneData: any;
  storyData: any;
  loading: boolean;
  showFullImage: boolean;
  setShowFullImage: (show: boolean) => void;
}

const SceneContent: Component<SceneContentProps> = ({ sceneData, storyData, loading, showFullImage, setShowFullImage }) => {
  return (
    <Card className={cn("w-full bg-gray-100/5", { "pt-0": sceneData.imageUrl })}>
      {sceneData.imageUrl && (
        <div className="relative">
          <Image
            src={sceneData.imageUrl}
            alt="Scene Image"
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
        <CardTitle className={cn({ "animate-pulse": loading })}>{sceneData.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <CardDescription className={cn({ "animate-pulse": loading })}>
          {formatSceneContent(
            sceneData.content,
            storyData.characters,
            [
              ...storyData.items,
              ...sceneData.items.filter(si => !si.isHidden).map(si => si.item)
            ],
            loading
          )}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default SceneContent;
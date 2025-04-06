import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Check, ChevronRight, PanelRightClose, PanelRightOpen } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Component } from "@/lib/types";

interface SceneListProps {
  scenes: any[];
  storyId: string;
  showPreviousScenes: boolean;
  toggle: () => void;
}

const SceneList: Component<SceneListProps> = ({
  scenes, storyId, showPreviousScenes, toggle
}) => {
  if (!scenes || scenes.length <= 1) {
    return <></>;
  }

  return (
    <div className={cn({ "xl:w-1/5": showPreviousScenes })}>
      {showPreviousScenes ? (
        <Card className="w-full bg-gray-100/5">
          <CardHeader className="pb-0 -mb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Scènes</CardTitle>
              <Button variant="outline" size="icon" className="bg-white/10 hover:bg-white/20" onClick={toggle}>
                <PanelRightClose size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-row xl:flex-col gap-0.5 xl:gap-2 items-center flex-wrap">
            {scenes.map((scene) => (
              <>
                <Link key={scene.id} href={`/${storyId}/${scene.id}`} className="buttonVariants">
                  {scene.title}
                  {scene.selected_choice_id && <Check className="ml-2" size={16} color="green" />}
                </Link>
                {scene.id !== scenes[scenes.length - 1].id && <ChevronRight className="block xl:hidden" size={16} color="gray" />}
              </>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" size="icon" className="bg-white/10 hover:bg-white/20" onClick={toggle}>
          <PanelRightOpen size={16} />
        </Button>
      )}
    </div>
  );
};

export default SceneList;
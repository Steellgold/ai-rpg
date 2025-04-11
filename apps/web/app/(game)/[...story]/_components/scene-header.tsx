import { Badge } from "@/components/ui/badge";
import { ChildrenStoryTag } from "@/components/story/children-story.tag";
import type { Component } from "@/lib/types";

interface SceneHeaderProps {
  title: string;
  isChildrenStory: boolean;
  currentScene: number;
  maxScenes: number;
}

const SceneHeader: Component<SceneHeaderProps> = ({ title, isChildrenStory, currentScene, maxScenes }) => {
  return (
    <div className="flex flex-row gap-2 bg-gray-100/5 p-4 rounded-md flex-wrap">
      <Badge variant="outline" className="text-md">
        {title}
        {isChildrenStory && <ChildrenStoryTag className="ml-2" />}
      </Badge>
      <Badge variant="outline" className="text-md">{currentScene}&nbsp;/&nbsp;{maxScenes}</Badge>
    </div>
  );
};

export default SceneHeader;

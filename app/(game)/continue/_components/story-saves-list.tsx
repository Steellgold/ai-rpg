"use client";

import { useEffect, useState } from "react";
import { getGameSaves } from "@/lib/services/game-save.service";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Trash2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/lib/hooks/use-toast";

export const GameSaveList = () => {
  const [saves, setSaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const t = useTranslations("Pages.Continue");

  useEffect(() => {
    const loadSaves = async () => {
      try {
        const gameSaves = await getGameSaves();
        setSaves(gameSaves);
      } catch (err) {
        console.error("Error loading game saves:", err);
        setError(err instanceof Error ? err.message : "Failed to load saved games");
      } finally {
        setLoading(false);
      }
    };
    
    loadSaves();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-pulse flex flex-col gap-4 w-full max-w-md">
          <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
          <div className="h-32 bg-gray-700/50 rounded"></div>
          <div className="h-32 bg-gray-700/50 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }
  
  if (!saves || saves.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="mb-4">{t("NoGame")}</p>
        <p className="mb-8">{t("NoGameDescription")}</p>
        <Link href="/" className={buttonVariants({ variant: "default" })}>
          {t("NewGame")}
        </Link>
      </div>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-8">
      {saves.map((save) => (
        <Card
          key={save.id}
          className={cn("w-[350px] relative", {
            "pt-0": save.story.coverImageUrl,
          })}
        >
          {save.story.coverImageUrl && (
            <Link href={`/${save.id}/${save.currentSceneId}`}>
              <Image
                src={save.story.coverImageUrl}
                alt={save.story.title}
                width={350}
                height={200}
                className="rounded-t-lg object-cover h-[200px] w-full"
              />
            </Link>
          )}
          
          <div className="absolute top-2 right-2 flex items-center gap-2">
            <Badge variant="secondary" className="bg-black/50 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(save.lastPlayed), { addSuffix: true })}
            </Badge>
          </div>

          <CardContent className="flex flex-col gap-4 mt-4">
            <div>
              <h3 className="text-lg font-bold">{save.story.title}</h3>
              <p className="text-sm text-muted-foreground">
                {save.characterName}
                {save.characterClass && ` - ${save.characterClass}`}
              </p>
            </div>
            
            <p className="line-clamp-2 text-sm">{save.story.synopsis}</p>

            {save.story.max_scenes !== 0 && save.progress !== 0 && (
              <div className="flex flex-row items-center justify-between gap-2">
                <Progress 
                  value={save.progress} 
                  max={save.story.max_scenes ?? 0} 
                  className="h-2"
                />
                <Badge variant="secondary">
                  {save.progress}/{save.story.max_scenes ?? 0}
                </Badge>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex gap-2">
            <Link href={`/${save.id}/${save.currentSceneId}`} className={buttonVariants({ variant: "default", className: "flex-1" })}>
              {t("Continue")}
            </Link>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="text-red-500 hover:text-red-700"
              onClick={() => toast({
                title: "Coming soon",
                description: "This feature is not yet implemented"
              })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}

      <Link 
        href="/new" 
        className="w-[350px] h-[350px] relative flex items-center justify-center border-border border-dashed border-2 rounded-lg hover:bg-accent transition-colors duration-300 ease-in-out"
      >
        {t("NewGame")}
      </Link>
    </div>
  );
};
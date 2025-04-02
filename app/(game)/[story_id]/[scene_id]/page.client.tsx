"use client";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateNextScene, handleCustomChoice } from "@/lib/actions/generate.scene.action";
import { Component } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { Check, Expand, ImageUpscale, Pen, Shrink } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type PageClientProps = {
  story_data: Prisma.StoryGetPayload<{
    include: {
      scenes: {
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
              description: true
            }
          },
          selected_choice_id: true,
        }
      }
    }
  }>;
  scene_data: Prisma.SceneGetPayload<{
    include: {
      choices: {
        select: {
          consequence: true,
          description: true,
          loadingMessage: true,
          text: true,
          isCustomChoice: true,
          isPersonalized: true,
          id: true
        }
      }
    }
  }>;
};

export const PageClient: Component<PageClientProps> = ({ story_data: storyData, scene_data: sceneData }) => {
  const [selectedChoice, setSelectedChoice] = useState<typeof sceneData.choices[0] | null>(null);
  const [confirmChoice, setConfirmChoice] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [currentFace, setCurrentFace] = useState(1);
  const [diceRolled, setDiceRolled] = useState(false);

  const [show_fullImage, setShowFullImage] = useState(false);

  const t = useTranslations("Pages.Story");

  const formatSceneContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className={cn("mb-4 last:mb-0", { "animate-pulse": loading })}>
        {paragraph}
      </p>
    ));
  };
  
  const handleRollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    setDiceRolled(false);
    
    const rollInterval = setInterval(() => {
      setCurrentFace(Math.floor(Math.random() * 6) + 1);
    }, 100);
    
    setTimeout(() => {
      clearInterval(rollInterval);
      const result = Math.floor(Math.random() * 6) + 1;
      setCurrentFace(result);
      setDiceResult(result);
      setIsRolling(false);
      setDiceRolled(true);
    }, 1500);
  };
  
  const handleSubmitChoice = async () => {
    if (!selectedChoice || !diceRolled || loading) return;
    
    setLoading(true);
    
    try {
      if (!selectedChoice.isCustomChoice) await generateNextScene(storyData.id, sceneData.id, selectedChoice.id, diceResult || undefined);
      else await handleCustomChoice(storyData.id, sceneData.id, selectedChoice.text, diceResult || undefined);

    } catch (error) {
      console.error("An error occurred while generating the next scene:", error);
      setLoading(false);
    }
  };
  
  const renderDiceFace = (face: number) => {
    const dotPositions = {
      1: ["center"],
      2: ["top-left", "bottom-right"],
      3: ["top-left", "center", "bottom-right"],
      4: ["top-left", "top-right", "bottom-left", "bottom-right"],
      5: ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
      6: ["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right"],
    };

    const positions = dotPositions[face as keyof typeof dotPositions] || [];

    return (
      <div className="w-16 h-16 bg-white rounded-lg shadow-lg flex flex-wrap justify-center items-center p-2 relative">
        {positions.map((position, index) => {
          let positionClass = "";

          switch (position) {
            case "top-left":
              positionClass = "absolute top-2 left-2";
              break;
            case "top-right":
              positionClass = "absolute top-2 right-2";
              break;
            case "middle-left":
              positionClass = "absolute top-1/2 left-2 -translate-y-1/2";
              break;
            case "middle-right":
              positionClass = "absolute top-1/2 right-2 -translate-y-1/2";
              break;
            case "bottom-left":
              positionClass = "absolute bottom-2 left-2";
              break;
            case "bottom-right":
              positionClass = "absolute bottom-2 right-2";
              break;
            case "center":
              positionClass = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
              break;
            default:
              positionClass = "";
          }

          return <div key={index} className={`w-2.5 h-2.5 bg-black rounded-full ${positionClass}`} />;
        })}
      </div>
    );
  };
  
  const getDiceImpactDescription = (result: number | null) => {
    if (!result) return "";
    
    if (result <= 2) {
      return "Impact minimal sur l'histoire";
    } else if (result <= 4) {
      return "Impact modéré sur l'histoire";
    } else {
      return "Impact majeur sur l'histoire";
    }
  };

  return (
    <div className="flex flex-col mt-16 p-4">
      <div className="flex flex-row gap-2 bg-gray-100/5 p-4 rounded-md">
        <Badge variant="outline" className="text-md">{storyData.title}</Badge>
        <Badge variant="outline" className="text-md">{storyData.current_scene}&nbsp;/&nbsp;{storyData.max_scenes}</Badge>
      </div>

      <div className="flex flex-row gap-4 mt-4">
        <div className="w-1/5">
          <Card className="w-full bg-gray-100/5">
            <CardHeader>
              <CardTitle>{t("Scenes")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {storyData.scenes.map((scene) => (
                <Link key={scene.id} href={`/${storyData.id}/${scene.id}`} className={buttonVariants({ variant: "outline", className: "w-full" })}>
                  {scene.title}
                  {scene.selected_choice_id && (
                    <Check className="ml-2" size={16} color="green" />
                  )}
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="w-4/5">
          <Card className={cn(
            "w-full bg-gray-100/5", {
              "pt-0": sceneData.imageUrl,
            }
          )}>
            {sceneData.imageUrl && (
              <div className="relative">
                <Image
                  src={sceneData.imageUrl}
                  alt="Scene Image"
                  width={500}
                  height={300}
                  className={cn(
                    "w-full object-cover rounded-t-md", {
                      "animate-pulse": loading,
                      "h-56": !show_fullImage,
                      "h-auto": show_fullImage,
                    }
                  )}
                />

                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/10 hover:bg-white/20"
                  onClick={() => setShowFullImage(!show_fullImage)}
                >
                  {show_fullImage ? <Shrink size={16} /> : <Expand size={16} />}
                </Button>
              </div>
            )}

            <CardHeader>
              <CardTitle className={cn({
                "animate-pulse": loading,
              })}>
                {sceneData.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
              <CardDescription className={cn({
                "animate-pulse": loading,
              })}>
                {formatSceneContent(sceneData.content)}
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {!sceneData.selected_choice_id && (
          <div className="w-2/5">
            <Card className="w-full bg-gray-100/5">
              {!confirmChoice ? (
                <>
                  <CardHeader>
                    <CardTitle>{t("Choose")}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    {sceneData.choices.map((choice) => (
                      <div key={choice.id} className="border border-border rounded-md p-2">
                        <Button
                          variant="outline"
                          className={cn("w-full", selectedChoice?.id === choice.id ? "bg-yellow-500/10 hover:bg-yellow-500/5 text-white" : "hover:bg-yellow-500/30")}
                          onClick={() => {
                            if (selectedChoice?.id === choice.id) setSelectedChoice(null);
                            else setSelectedChoice(choice);
                          }}
                        >
                          {choice.text}
                          {choice.isCustomChoice && <Pen className="ml-2" />}
                        </Button>

                        {choice.isCustomChoice && selectedChoice?.id === choice.id && (
                          <>
                            <Input
                              placeholder="Votre choix personnalisé"
                              className={cn("mt-2 w-full", selectedChoice?.id === choice.id ? "bg-yellow-500/10 hover:bg-yellow-500/5 text-white" : "hover:bg-yellow-500/30")}
                              onChange={(e) => {
                                setSelectedChoice({
                                  ...choice,
                                  text: e.target.value,
                                });
                              }}
                              value={selectedChoice?.id === choice.id ? selectedChoice.text : ""}
                              disabled={selectedChoice?.id !== choice.id}
                            />
                          </>
                        )}
  
                        <CardDescription className="mt-2">{choice.description}</CardDescription>
                      </div>
                    ))}

                    {selectedChoice && (
                      <Card className="w-full bg-gray-100/5 mt-4">
                        <CardHeader>
                          <CardTitle>{t("Consequences")}</CardTitle>
                          <CardDescription>{selectedChoice.consequence}</CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-end">
                          <Button variant="outline" className="w-full" onClick={() => setConfirmChoice(true)}>
                            {t("Confirm")}
                          </Button>
                        </CardFooter>
                      </Card>
                    )}
                  </CardContent>
                </>
              ) : (
                <>
                  <CardHeader>
                    <CardTitle>{t("DiceRoll.Title")}</CardTitle>
                    <CardDescription>
                      {t("DiceRoll.Description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-4">
                    <div className="h-20 flex items-center justify-center">
                      {renderDiceFace(currentFace)}
                    </div>
                    
                    {diceRolled && (
                      <div className="text-center w-full">
                        <p className="font-bold text-lg">
                          {t("DiceRoll.Result")}&nbsp;<span className="text-yellow-500">{diceResult}</span>/6
                        </p>
                        <p className="text-sm opacity-80 mt-1">
                          {getDiceImpactDescription(diceResult)}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-2 w-full">
                      {!diceRolled ? (
                        <Button 
                          variant="outline" 
                          className="w-full col-span-2" 
                          onClick={handleRollDice}
                          disabled={isRolling}
                        >
                          {isRolling
                            ? t("DiceRoll.Rolling")
                            : t("DiceRoll.Roll")
                          }
                        </Button>
                      ) : (
                        <>
                          <Button 
                            variant="default" 
                            className="w-full bg-yellow-500 hover:bg-yellow-600" 
                            onClick={handleSubmitChoice}
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <span className="animate-pulse">
                                  {t("Generating")}
                                </span>
                              </>
                            ) : (
                              <>
                                {t("DiceRoll.Continue")}
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                    
                    {loading && selectedChoice?.loadingMessage && (
                      <div className="text-sm mt-4 p-3 bg-yellow-500/10 rounded-md">
                        <p className="italic">{selectedChoice?.loadingMessage}</p>
                      </div>
                    )}
                  </CardContent>
                </>
              )}
            </Card>
          </div>
        )}

        {sceneData.selected_choice_id && (
          <div className="w-2/5">
            <Card className="w-full bg-gray-100/5">
              <CardHeader>
                <CardTitle>{t("Previous.Choices")}</CardTitle>
                <CardDescription>{t("Previous.ChoiceSelected")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {sceneData.choices.map((choice) => (
                  <div key={choice.id} className="border border-border rounded-md p-2">
                    <Button
                      variant="outline"
                      className={cn("w-full", choice.id === sceneData.selected_choice_id ? "bg-yellow-500/10 hover:bg-yellow-500/5 text-white" : "hover:bg-yellow-500/30")}
                    >
                      {choice.text}
                      {choice.isCustomChoice && <Pen className="ml-2" />}
                    </Button>
                    <CardDescription className="mt-2">{choice.description}</CardDescription>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
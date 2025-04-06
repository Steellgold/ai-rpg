"use client";

import { ChildrenStoryTag } from "@/components/children-story.tag";
import { formatSceneContent } from "@/components/format-text-scene";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { generateNextScene, handleCustomChoice } from "@/lib/actions/generate.scene.action";
import useShowScenes from "@/lib/hooks/use-show-p.scenes";
import { Component } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { Check, ChevronRight, Expand, PanelRightClose, PanelRightOpen, Shrink } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChoiceComponent } from "@/components/choice";
import { DiceCube } from "@/components/dice";
import { Inventory } from "@/components/inventory";
import { useItem } from "@/lib/actions/use-item";

export type PageClientProps = {
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
              isItemRelated: true,
              description: true
            }
          },
          selected_choice_id: true,
        }
      },
      characters: {
        select: {
          id: true,
          name: true,
          description: true,
          personality: true,
          outfit: true,
          age: true,
          background: true,
          abilities: true,
          relationships: true,
          motivations: true,
          flaws: true,
          backstory: true,
          isMain: true,
          imageUrl: true
        }
      },
      items: {
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          rarity: true,
          effect: true,
          useCount: true,
          imageUrl: true
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
          isItemRelated: true,
          id: true
        }
      },
      items: {
        select: {
          isHidden: true,
          item: {
            select: {
              id: true,
              name: true,
              description: true,
              type: true,
              rarity: true,
              effect: true,
              useCount: true,
              imageUrl: true
            }
          }
        }
      }
    }
  }>;
  player_inventory?: {
    id: string;
    itemId: string;
    quantity: number;
    isEquipped: boolean;
    remainingUses: number | null;
    isBroken: boolean;
    item: {
      id: string;
      name: string;
      description: string;
      type: string;
      rarity: string;
      effect?: string;
      durability?: number;
      isBroken: boolean;
      imageUrl?: string;
      brokenImageUrl?: string;
    }
  }[];
};

export const PageClient: Component<PageClientProps> = ({
  story_data: storyData, scene_data: sceneData,
  player_inventory: playerInventory
}) => {
  const [selectedChoice, setSelectedChoice] = useState<typeof sceneData.choices[0] | null>(null);
  const [confirmChoice, setConfirmChoice] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [currentFace, setCurrentFace] = useState(1);
  const [diceRolled, setDiceRolled] = useState(false);
  const [show_fullImage, setShowFullImage] = useState(false);

  const getInventoryItemId = (itemId: string): string | null => {
    if (!playerInventory || !itemId) return null;
    
    const inventoryItem = playerInventory.find(invItem => invItem.itemId === itemId);
    return inventoryItem ? inventoryItem.id : null;
  };
  
  const getItemName = (itemId: string): string => {
    if (!playerInventory) return "Item";
    const item = playerInventory.find(invItem => invItem.itemId === itemId);
    return item ? item.item.name : "Item";
  };

  const { showPreviousScenes, toggle } = useShowScenes();

  const t = useTranslations("Pages.Story");

  const handleRollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    setDiceRolled(false);
    
    const rollInterval = setInterval(() => setCurrentFace(Math.floor(Math.random() * 6) + 1), 100);
    
    setTimeout(() => {
      clearInterval(rollInterval);
      const result = Math.floor(Math.random() * 6) + 1;
      setCurrentFace(result);
      setDiceResult(result);
      setIsRolling(false);
      setDiceRolled(true);
    }, 1500);
  };
  
  const handleUseItem = async (itemId: string) => {
    const result = await useItem(itemId, getInventoryItemId(itemId));
    return result.success;
  };

  const handleSubmitChoice = async () => {
    if (!selectedChoice || !diceRolled || loading) return;
    
    setLoading(true);
    
    try {
      if (!selectedChoice.isCustomChoice) {
        await generateNextScene(
          storyData.id, 
          sceneData.id, 
          selectedChoice.id, 
          diceResult || undefined, 
          gameSaveId, 
          activeItem
        );
      } else {
        await handleCustomChoice(
          storyData.id, 
          sceneData.id, 
          selectedChoice.text, 
          diceResult || undefined, 
          gameSaveId,
          activeItem
        );
      }
    } catch (error) {
      console.error("An error occurred while generating the next scene:", error);
      setLoading(false);
    }
  };
  
  const handleSelectChoice = (choice: typeof sceneData.choices[0]) => {
    setSelectedChoice(choice);
  };

  const handleCustomTextChange = (text: string) => {
    if (selectedChoice) {
      setSelectedChoice({
        ...selectedChoice,
        text: text,
      });
    }
  };

  return (
    <div className="flex flex-col mt-16 p-4">
      <div className="flex flex-row gap-2 bg-gray-100/5 p-4 rounded-md flex-wrap">
        <Badge variant="outline" className="text-md">
          {storyData.title}
          {storyData.isChildrenStory && <ChildrenStoryTag className="ml-2" />}
        </Badge>
        <Badge variant="outline" className="text-md">{storyData.current_scene}&nbsp;/&nbsp;{storyData.max_scenes}</Badge>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 mt-4">
        <div className={cn({
          "xl:w-1/5": showPreviousScenes
        })}>
          {showPreviousScenes ? (
            <Card className="w-full bg-gray-100/5">
              <CardHeader className="pb-0 -mb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>{t("Scenes.Title")}</CardTitle>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/10 hover:bg-white/20"
                    onClick={toggle}
                  >
                    <PanelRightClose size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-row xl:flex-col gap-0.5 xl:gap-2 items-center flex-wrap">
                {storyData.scenes.map((scene) => (
                  <>
                    <Link key={scene.id} href={`/${storyData.id}/${scene.id}`} className={buttonVariants({
                      variant: "outline", className: "xl:w-full h-auto justify-start", wrap: true
                    })}>
                      {scene.title}
                      {scene.selected_choice_id && (
                        <Check className="ml-2" size={16} color="green" />
                      )}
                    </Link>

                    {scene.id !== storyData.scenes[storyData.scenes.length - 1].id && (
                      <ChevronRight className="block xl:hidden" size={16} color="gray" />
                    )}
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

        <div className={cn({
          "w-full xl:w-3/5": showPreviousScenes,
          "w-full xl:w-5/5": !showPreviousScenes
        })}>
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
                {formatSceneContent(
                  sceneData.content,
                  storyData.characters,
                  [
                    ...storyData.items, 
                    ...sceneData.items.filter(si => !si.isHidden).map(si => si.item),
                  ],
                  loading
                )}
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {!sceneData.selected_choice_id && (
          <div className="w-full xl:w-2/5">
            <Card className="w-full bg-gray-100/5">
              {!confirmChoice ? (
                <>
                  <CardHeader>
                    <CardTitle>{t("Choose")}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    {sceneData.choices.map((choice) => (
                      <ChoiceComponent
                        key={choice.id}
                        choice={choice}
                        isSelected={selectedChoice?.id === choice.id}
                        // @ts-ignore
                        onSelect={handleSelectChoice}
                        onCustomTextChange={handleCustomTextChange}
                      />
                    ))}

                    {selectedChoice && (
                      <div className="flex flex-col gap-2 mt-4">
                        <Button variant="navbar" className="w-full" onClick={() => setConfirmChoice(true)}>
                          {t("Confirm")}
                        </Button>
                      </div>
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
                      <DiceCube face={currentFace} size="md" displayType="dots" />
                    </div>
                    
                    <div className="flex flex-col gap-2 w-full">
                      {!diceRolled ? (
                        <Button 
                          variant="outline" 
                          className="w-full col-span-2" 
                          onClick={handleRollDice}
                          disabled={isRolling}
                        >
                          {isRolling ? t("DiceRoll.Rolling") : t("DiceRoll.Roll")}
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

            <Inventory
              items={storyData.items}
              onEquipItem={() => console.log("Equip item")} 
              onActiveItemChange={() => console.log("Active item changed")}
              onUseItem={async (itemId: string) => {
                console.log("Use item");
                return true;
              }}
            />
          </div>
        )}

        {sceneData.selected_choice_id && (
          <div className="w-2/5">
            <Card className="w-full bg-gray-100/5">
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle>{t("Previous.Choices")}</CardTitle>
                  <CardDescription>{t("Previous.ChoiceSelected")}</CardDescription>
                </div>

                {sceneData.diceRoll !== 0 && <DiceCube face={sceneData.diceRoll ?? 1} size="md" displayType="dots" />}
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {sceneData.choices.map((choice) => (
                  <ChoiceComponent
                    key={choice.id}
                    choice={choice}
                    isSelected={choice.id === sceneData.selected_choice_id}
                    isPrevious={true}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
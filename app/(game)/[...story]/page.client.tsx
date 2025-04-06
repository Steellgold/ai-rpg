"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { generateNextScene } from "@/lib/actions/generate.scene.action";
import { useItem } from "@/lib/actions/use-item";
import { Component } from "@/lib/types";
import { Prisma } from "@prisma/client";
import SceneHeader from "./_components/scene-header";
import SceneList from "./_components/scene-list";
import { cn } from "@/lib/utils";
import SceneContent from "./_components/scene-content";
import ChoiceSection from "./_components/choice";
import DiceRollSection from "./_components/dice-roll";
import InventorySection from "./_components/inventory";
import PreviousChoices from "./_components/previous-choices";
import { equipItem } from "@/lib/services/game-save.service";
import { toast } from "@/lib/hooks/use-toast";

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
    inventoryItemId?: string;
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
  gameSaveId: string;
};

export const PageClient: Component<PageClientProps> = ({
  scene_data: sceneData,
  story_data: storyData,
  player_inventory: playerInventory = [],
  gameSaveId
}) => {
  const [selectedChoice, setSelectedChoice] = useState<typeof sceneData.choices[0] | null>(null);
  const [confirmChoice, setConfirmChoice] = useState(false);
  const [loading, setLoading] = useState(false);

  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [currentFace, setCurrentFace] = useState(1);
  const [diceRolled, setDiceRolled] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  
  const [showFullImage, setShowFullImage] = useState(false);
  
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
  
  const getInventoryItemId = (itemId: string): string | null => {
    if (!playerInventory || !itemId) return null;
      
    const inventoryItem = playerInventory.find(invItem => invItem.itemId === itemId);
    return inventoryItem ? (inventoryItem.inventoryItemId || inventoryItem.id) : null;
  };

  const handleUseItem = async (itemId: string) => {
    const itemToUse = getInventoryItemId(itemId);
    if (!itemToUse) {
      toast({
        title: "Item not found",
        description: "This item is not in your inventory",
        variant: "destructive"
      });
      return false;
    }

    try {
      const result = await useItem(itemId, itemToUse);
      
      if (!result.success) {
        toast({
          title: "Error using item",
          description: result.error || "Failed to use item",
          variant: "destructive"
        });
        return false;
      }
      
      if (result.isBroken) {
        toast({
          title: "Item broken",
          description: "This item is now broken and can't be used anymore",
          variant: "destructive"
        });
      }
      
      return result.success;
    } catch (error) {
      console.error("Error using item:", error);
      toast({
        title: "Error using item",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const handleEquipItem = async (itemId: string, equip: boolean) => {
    const inventoryItemId = getInventoryItemId(itemId);
    if (!inventoryItemId) {
      toast({
        title: "Item not found",
        description: "This item is not in your inventory",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const result = await equipItem(inventoryItemId, equip);
      
      if (result.success) {
        toast({
          title: equip ? "Item equipped" : "Item unequipped",
          description: `The item has been ${equip ? 'equipped' : 'unequipped'} successfully`
        });
      }
    } catch (error) {
      console.error("Error equipping item:", error);
      toast({
        title: "Error equipping item",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleSubmitChoice = async () => {
    if (!selectedChoice || !diceRolled || loading) return;
    setLoading(true);

    try {
      await generateNextScene(
        storyData.id,
        sceneData.id,
        selectedChoice.isCustomChoice ? undefined : selectedChoice.id, // choiceId
        selectedChoice.isCustomChoice ? selectedChoice.text : undefined, // customText
        diceResult || undefined,
        gameSaveId,
        activeItemId || undefined
      );      
    } catch (error) {
      console.error("An error occurred while generating the next scene:", error);
      setLoading(false);
      
      toast({
        title: "Error generating next scene",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleSelectChoice = (choice: typeof sceneData.choices[0]) => {
    setSelectedChoice(choice);
  };

  const handleCustomTextChange = (text: string) => {
    if (selectedChoice) {
      setSelectedChoice({ ...selectedChoice, text: text });
    }
  };
  
  const handleActiveItemChange = (itemId: string | null) => {
    setActiveItemId(itemId);
  };

  return (
    <div className="flex flex-col mt-16 p-4">
      <SceneHeader
        title={storyData.title}
        isChildrenStory={storyData.isChildrenStory}
        currentScene={storyData.current_scene || 1}
        maxScenes={storyData.max_scenes || 1}
      />
      <div className="flex flex-col xl:flex-row gap-4 mt-4">
        <SceneList
          scenes={storyData.scenes}
          storyId={gameSaveId || storyData.id}
          selectedSceneId={sceneData.id}
        />
        
        <div className={"w-full xl:w-3/5"}>
          <SceneContent 
            sceneData={sceneData}
            storyData={storyData}
            loading={loading}
            showFullImage={showFullImage}
            setShowFullImage={setShowFullImage}
          />
        </div>
        
        {!sceneData.selected_choice_id && (
          <div className="w-full xl:w-2/5">
            <ChoiceSection
              choices={sceneData.choices}
              selectedChoice={selectedChoice}
              confirmChoice={confirmChoice}
              handleSelectChoice={handleSelectChoice}
              handleCustomTextChange={handleCustomTextChange}
              setConfirmChoice={setConfirmChoice}
            />
            
            {confirmChoice && (
              <DiceRollSection
                currentFace={currentFace}
                isRolling={isRolling}
                diceRolled={diceRolled}
                handleRollDice={handleRollDice}
                handleSubmitChoice={handleSubmitChoice}
                loading={loading}
                selectedChoice={selectedChoice}
              />
            )}
            
            <InventorySection
              items={storyData.items}
              gameSaveId={gameSaveId}
              onEquipItem={handleEquipItem}
              onActiveItemChange={handleActiveItemChange}
              onUseItem={handleUseItem}
            />
          </div>
        )}
        
        {sceneData.selected_choice_id && (
          <div className="w-2/5">
            <PreviousChoices
              choices={sceneData.choices}
              selectedChoiceId={sceneData.selected_choice_id}
              diceRoll={sceneData.diceRoll || 0}
            />
          </div>
        )}
      </div>
    </div>
  );
};
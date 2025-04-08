import { notFound, unauthorized } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { PageClient } from "./page.client";
import { NotesButton } from "@/components/story-related/notes-button";
import { createGameSave } from "@/lib/services/game-save.service";

type PageProps = {
  params: Promise<{
    story: string[];
  }>
};

const Page = async ({ params }: PageProps) => {
  const { story: storyParams } = await params;

  const storyOrSaveId = storyParams[0];
  const sceneId = storyParams[1] ?? null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const gameSave = await prisma.gameSave.findUnique({
    where: { id: storyOrSaveId, userId: user.id }
  });

  let storyId;
  let gameSaveId;

  if (gameSave) {
    storyId = gameSave.storyId;
    gameSaveId = gameSave.id;
  } else {
    storyId = storyOrSaveId;
    
    const storyExists = await prisma.story.findUnique({
      where: { id: storyId, creatorId: user.id }
    });
    
    if (!storyExists) return notFound();
    
    try {
      const saveResult = await createGameSave(storyId);
      gameSaveId = saveResult.gameSaveId;
    } catch (error) {
      console.error("Error creating game save:", error);
    }
  }

  const story = await prisma.story.findUnique({
    where: {
      id: storyId,
      creatorId: user.id
    },
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
          dialogues: {
            select: {
              id: true,
              speaker: true,
              text: true,
              emotion: true,
              order: true
            },
            orderBy: {
              order: 'asc'
            }
          },
          selected_choice_id: true,
        },
        orderBy: {
          createdAt: "asc"
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
  });
  if (!story) return notFound();
  
  let targetSceneId = sceneId;
  
  if (!targetSceneId) {
    if (gameSave && gameSave.currentSceneId) {
      targetSceneId = gameSave.currentSceneId;
    } else if (story.current_scene_id) {
      targetSceneId = story.current_scene_id;
    } else if (story.scenes.length > 0) {
      targetSceneId = story.scenes[0].id;
    } else {
      return notFound();
    }
  }
  
  const scene = await prisma.scene.findUnique({
    where: {
      id: targetSceneId,
      storyId: story.id
    },
    include: {
      choices: {
        select: {
          consequence: true,
          description: true,
          loadingMessage: true,
          isCustomChoice: true,
          isPersonalized: true,
          isItemRelated: true,
          text: true,
          id: true
        }
      },
      dialogues: {
        select: {
          id: true,
          speaker: true,
          text: true,
          emotion: true,
          order: true
        },
        orderBy: {
          order: 'asc'
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
  });
  if (!scene) return notFound();

  let player_inventory: any[] = [];
  if (gameSaveId) {
    player_inventory = await prisma.inventoryItem.findMany({
      where: {
        gameSaveId: gameSaveId
      },
      select: {
        id: true,
        itemId: true,
        quantity: true,
        isEquipped: true,
        remainingUses: true,
        isBroken: true,
        item: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            rarity: true,
            effect: true,
            durability: true,
            isBroken: true,
            imageUrl: true,
            brokenImageUrl: true,
            useCount: true
          }
        }
      }
    });

    await prisma.gameSave.update({
      where: { id: gameSaveId },
      data: { lastPlayed: new Date() }
    })
  }

  return (
    <>
      <PageClient
        story_data={story}
        scene_data={scene}
        player_inventory={player_inventory}
        gameSaveId={gameSaveId ?? ""}
      />
      <NotesButton notes={story.notes ?? ""} storyId={story.id} userId={user.id} />
    </>
  );
}

export default Page;
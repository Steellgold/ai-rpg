import { notFound, unauthorized } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { PageClient } from "./page.client";
import { NotesButton } from "@/components/notes-button";

type PageProps = {
  params: Promise<{
    story: string[];
  }>
};

const Page = async ({ params }: PageProps) => {
  const { story: storyParams } = await params;

  const saveId = storyParams[0];
  const sceneId = storyParams[1] ?? null;

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const save = await prisma.gameSave.findUnique({ where: { id: saveId, userId: user.id } });
  if (!save) return notFound();

  const story = await prisma.story.findUnique({
    where: {
      id: save?.storyId,
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
  });
  if (!story) return notFound();
  
  const scene = await prisma.scene.findUnique({
    where: {
      id: sceneId ?? story.scenes[0]?.id,
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

  // const player_inventory = await prisma.inventoryItem.findMany({
  //   where: {
  //     gameSaveId: save.id
  //   },
  //   select: {
  //     id: true,
  //     itemId: true,
  //     quantity: true,
  //     isEquipped: true,
  //     remainingUses: true,
  //     isBroken: true,
  //     item: {
  //       select: {
  //         id: true,
  //         name: true,
  //         description: true,
  //         type: true,
  //         rarity: true,
  //         effect: true,
  //         durability: true,
  //         isBroken: true,
  //         imageUrl: true,
  //         brokenImageUrl: true,
  //         useCount: true
  //       }
  //     }
  //   }
  // });

  return (
    <>
      <PageClient
        story_data={story}
        scene_data={scene}
      />
      <NotesButton notes={story.notes ?? ""} storyId={story.id} userId={user.id} />
    </>
  );
}

export default Page;
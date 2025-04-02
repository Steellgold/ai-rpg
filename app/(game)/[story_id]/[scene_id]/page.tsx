import { notFound, unauthorized } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { PageClient } from "./page.client";

type PageProps = {
  params: Promise<{
    story_id: string;
    scene_id: string;
  }>;
};

const Page = async ({ params }: PageProps) => {
  const { story_id, scene_id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const story = await prisma.story.findUnique({ where: { id: story_id, creatorId: user.id } });
  if (!story) return notFound();
  
  const scene = await prisma.scene.findUnique({
    where: { id: scene_id, storyId: story.id },
    include: {
      choices: {
        select: {
          consequence: true,
          description: true,
          loadingMessage: true,
          isCustomChoice: true,
          isPersonalized: true,
          text: true,
          id: true
        }
      }
    }
  });
  if (!scene) return notFound();

  return (
    <PageClient story_data={story} scene_data={scene} />
  );
}

export default Page;
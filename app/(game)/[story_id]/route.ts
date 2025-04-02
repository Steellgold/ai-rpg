import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env/env";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: Promise<{
    story_id: string;
  }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  const { story_id: storyId } = await params;
  console.log("Story ID:", storyId);
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error("User not authenticated");
    return NextResponse.redirect(`${env.NEXT_PUBLIC_BASE_URL}`);
  }
  
  try {
    const story = await prisma.story.findUnique({
      where: { 
        id: storyId,
        creatorId: user.id 
      },
      include: {
        scenes: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    if (!story) {
      return NextResponse.redirect(new URL("/continue", request.url));
    }
    
    if (story.scenes.length > 0) {
      const targetSceneId = story.current_scene_id || story.scenes[0].id;
      return NextResponse.redirect(`${env.NEXT_PUBLIC_BASE_URL}/${storyId}/${targetSceneId}`);
    } else {
      console.warn(`Story ${storyId} has no scenes`);
      // That means normally never happen, but if it does, we redirect to continue
      return NextResponse.redirect(`${env.NEXT_PUBLIC_BASE_URL}/continue`);
    }
  } catch (error) {
    console.error("Error in story route handler:", error);
    return NextResponse.redirect(`${env.NEXT_PUBLIC_BASE_URL}/continue`);
  }
}
import { prisma } from "@/lib/db/prisma";
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
    return NextResponse.redirect(new URL("/", request.url));
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
      return NextResponse.redirect(new URL(`/${storyId}/${targetSceneId}`, request.url));
    } else {
      console.warn(`Story ${storyId} has no scenes`);
      return NextResponse.redirect(new URL("/continue", request.url));
    }
  } catch (error) {
    console.error("Error in story route handler:", error);
    return NextResponse.redirect(new URL("/continue", request.url));
  }
}
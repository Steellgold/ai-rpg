import { useTranslations } from "next-intl";
import { PageLayout } from "./_l";
import { Glitch } from "@/components/glitch";
import { AiTextarea } from "@/components/textarea";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { StoryCard } from "@/components/story.card";
import { Badge } from "@/components/ui/badge";

const Page = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let user_data = null;
  if (user) {
    const { data, error } = await supabase.from("User").select("*").eq("id", user?.id).single();
    if (error) {
      console.error("Error fetching user data:", error);
    } else {
      user_data = data;
    }
  }
  
  const t = await getTranslations("Page");

  const stories = await prisma.story.findMany({
    where: {
      isPublic: true
    },
    select: {
      synopsis: true,
      title: true,
      isChildrenStory: true,
      genre: true,
      characters: {
        select: {
          _count: true
        }
      },
      creator: {
        select: {
          id: true,
          display_name: true,
          image_url: true
        }
      },
      createdAt: true,
      coverImageUrl: true,
      goal: true,
      id: true
    }
  });

  return (
    <PageLayout>
      <section className="flex flex-col items-center max-w-2xl mx-auto">
        <h1 className="text-5xl -motion-translate-x-in-100 motion-translate-y-in-75">
          <Glitch>{t("Title")}</Glitch>
        </h1>
        <p className="text-lg">{t("Description")}</p>

        <div className="h-12" />

        <AiTextarea isPremium={user_data?.premium} />
      </section>

      {/* <hr className="my-56 border-t border-[#161616]" />

      <section className="flex flex-col items-center w-full max-w-6xl mx-auto">
        <h2 className="flex flex-row gap-2 text-3xl items-center">
          {t("Marketplace.Title")}
          <Badge className="border-indigo-500 bg-indigo-500 text-white" variant="outline">BETA</Badge>
        </h2>

        <p className="text-lg mb-8">{t("Marketplace.Description")}</p>

        <div className="flex flex-wrap justify-center gap-4 w-full">
          {stories.map((story) => (
            <div key={story.id} className="w-[calc(100%/3-1rem)] flex justify-center">
              <StoryCard {...story} />
            </div>
          ))}
        </div>
      </section> */}
    </PageLayout>
  );
}

export default Page;
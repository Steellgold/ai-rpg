import { useTranslations } from "next-intl";
import { PageLayout } from "./_l";
import { Glitch } from "@/components/glitch";
import { AiTextarea } from "@/components/textarea";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { StoryCard } from "@/components/story.card";

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

      <hr className="my-12 border-t border-[#161616]" />

      <section className="flex flex-col items-center w-full max-w-6xl mx-auto">
        <h2 className="text-3xl">{t("Marketplace.Title")}</h2>
        <p className="text-lg mb-8">{t("Marketplace.Description")}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {stories.map((story) => (
            <StoryCard key={story.id} {...story} />
          ))}
        </div>
      </section>
    </PageLayout>
  );
}

export default Page;

{/* <Card className="pt-0 pb-0 w-full relative z-[100] mx-auto flex flex-row items-center justify-between mt-4 animate-in fade-in-50 slide-in-from-top-16">
        <div className="p-6">
          <CardTitle>
            {t("Marketplace.Title")} <Badge variant="outline" className="ml-2">{t("Marketplace.CommingSoon")}</Badge>
          </CardTitle>
          <CardDescription className="mt-2">{t("Marketplace.Description")}</CardDescription>

          <div className="flex flex-col items-center mt-4">
            <Button className="w-full" disabled>
              {t("Marketplace.Button")}
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
  
        <Image 
          src="/marketplace.jpg" alt="Marketplace"
          width={300} height={300}
          className="rounded-tr-lg rounded-br-lg h-[200px] w-[300px] object-cover"
        />
      </Card> */}
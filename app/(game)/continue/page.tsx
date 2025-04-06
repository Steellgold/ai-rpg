import { PageLayout } from "@/app/_l";
import { Glitch } from "@/components/glitch";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { unauthorized } from "next/navigation";
import { GameSaveList } from "./_components/story-saves-list";

const ContinuePage = async() => {
  const t = await getTranslations("Pages.Continue");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return unauthorized();

  return (
    <PageLayout>
      <section className="flex flex-col items-center">
        <h1 className="text-5xl -motion-translate-x-in-100 motion-translate-y-in-75">
          <Glitch>{t("Title")}</Glitch>
        </h1>
        <p className="text-lg">{t("Description")}</p>
      </section>

      <GameSaveList />
    </PageLayout>
  );
};

export default ContinuePage;
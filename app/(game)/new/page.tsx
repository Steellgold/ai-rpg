import { PageLayout } from "@/app/_l";
import { AiTextarea } from "@/components/ai-textarea";
import { Glitch } from "@/components/glitch";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { unauthorized } from "next/navigation";

const Page = async() => {
  const t = await getTranslations("Pages.New");

  const supabase = await createClient();

  const { data: session } = await supabase.auth.getSession();
  if (!session) return unauthorized();

  return (
    <PageLayout>
      <section className="flex flex-col items-center">
        <h1 className="text-5xl -motion-translate-x-in-100 motion-translate-y-in-75">
          <Glitch>{t("Title")}</Glitch>
        </h1>
        <p className="text-lg">{t("Description")}</p>
      </section>

      <div className="flex flex-col items-center mt-4">
        <AiTextarea />
      </div>
    </PageLayout>
  );
}

export default Page;
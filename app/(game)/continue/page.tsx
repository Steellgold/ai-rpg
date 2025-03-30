import { PageLayout } from "@/app/_l";
import { Glitch } from "@/components/glitch";
import Aurora from "@/components/ui/aurora";
import { buttonVariants } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { unauthorized } from "next/navigation";

const Page = async() => {
  const t = await getTranslations("Pages.Continue");

  const { data: session } = await supabase.auth.getSession();
  if (!session) return unauthorized();

  const { data } = await supabase.from("GameState").select("*").eq("user_id", session.session?.user.id ?? "");
  if (!data || data.length === 0) return (
    <PageLayout aurora={["#db161a", "#8e0e10", "#5b080a", "#0e0101", "#f21010"]}>
      <section className="flex flex-col items-center">
        <h1 className="text-5xl -motion-translate-x-in-100 motion-translate-y-in-75">
          <Glitch>{t("NoGame")}</Glitch>
        </h1>
        <p className="text-lg">{t("NoGameDescription")}</p>

        <div className="flex flex-col items-center mt-4">
          <Link href="/game/new" className={buttonVariants({ variant: "navbar" })}>
            {t("NewGame")}
          </Link>
        </div>
      </section>
    </PageLayout>
  )

  return (
    <PageLayout>
      <section className="flex flex-col items-center">
        <h1 className="text-5xl -motion-translate-x-in-100 motion-translate-y-in-75">
          <Glitch>{t("Title")}</Glitch>
        </h1>
        <p className="text-lg">{t("Description")}</p>
      </section>
    </PageLayout>
  );
}

export default Page;
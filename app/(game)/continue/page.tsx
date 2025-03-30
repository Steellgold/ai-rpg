import { PageLayout } from "@/app/_l";
import { Glitch } from "@/components/glitch";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { unauthorized } from "next/navigation";

const Page = async() => {
  const t = await getTranslations("Pages.Continue");

  const supabase = await createClient();

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

      <div className="flex flex-col items-center mt-4">
        {data.map((game, index) => (
          <Card
            className={cn("w-[350px] relative z-[100]", {
              "pt-0": game.currentImageUrl
            })}
            key={index}
          >
            {game.currentImageUrl && (
              <Image
                src={game.currentImageUrl} alt={game.currentImageUrl}
                width={500} height={300}
                className="rounded-lg h-[200px] object-cover"
              />
            )}

            <CardContent className="line-clamp-3">{game.currentScene}</CardContent>

            <CardFooter>
              <Link className={buttonVariants({ variant: "default" })} href={`/game/${game.id}`}>
                {t("Continue")}
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}

export default Page;
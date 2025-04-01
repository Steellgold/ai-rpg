import { PageLayout } from "@/app/_l";
import { Glitch } from "@/components/glitch";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { unauthorized } from "next/navigation";

const Page = async() => {
  const t = await getTranslations("Pages.Continue");

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const data = await prisma.story.findMany({
    where: { creatorId: user.id },
    select: {
      id: true,
      title: true,
      synopsis: true,
      coverImageUrl: true,
      max_scenes: true,
      current_scene: true
    },
  });

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

      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {data.map((game, index) => (
          <Card
            className={cn("w-[350px] relative", {
              "pt-0": game.coverImageUrl,
            })}
            key={index}
          >
            {game.coverImageUrl && (
              <Link href={`/game/${game.id}`}>
                <Image
                  src={game.coverImageUrl}
                  alt={game.title}
                  width={350}
                  height={200}
                  className="rounded-t-lg object-cover"
                />
              </Link>
            )}

            <CardContent className="flex flex-col gap-4">
              <p className="line-clamp-3">{game.synopsis}</p>

              <div className="flex flex-row items-center justify-between gap-2">
                <Progress value={game.current_scene} max={game.max_scenes ?? 0} />
                <Badge variant={"secondary"}>
                  {game.current_scene}/{game.max_scenes ?? 0}
                </Badge>
              </div>
            </CardContent>


            <CardFooter>
              <Link className={buttonVariants({ variant: "default", className: "w-full" })} href={`/game/${game.id}`}>
                {t("Continue")}
              </Link>
            </CardFooter>
          </Card>
        ))}

        <Link href="/new" className="w-[350px] relative flex items-center justify-center border-border border-dashed border-2 rounded-lg hover:bg-accent transition-colors duration-300 ease-in-out">
          <>
            {t("NewGame")}
          </>
        </Link>
      </div>
    </PageLayout>
  );
}

export default Page;
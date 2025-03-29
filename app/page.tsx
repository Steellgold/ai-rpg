"use client";

import { Glitch } from "@/components/glitch";
import Aurora from "@/components/ui/aurora";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/hooks/use-session";
import { cn } from "@/lib/utils";
import { ArrowRight, User } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

const Page = () => {
  const t = useTranslations("Page");
  const [selectedHistory, setSelectedHistory] = useState<typeof histories[0] | null>(null);
  const { error, isLoading, user } = useSession();

  const histories = [
    {
      title: "Nexus: 2187",
      description: "A thrilling sci-fi adventure set in a dystopian future.",
      content: "Explore the depths of space and the mysteries of the universe.",
      goal: "To uncover the secrets of the Nexus and save humanity.",
      // 
      image: "/nexus.jpg",
      players: "1-4",
      //
      aurora: ["#1a254f", "#1b274d", "#233161", "#16264d", "#2f9dd8"]
    },
    {
      title: "Workbench",
      description: "Let your imagination run wild with AI-generated stories.",
      content: "Create your own adventures and characters with the power of AI.",
      // 
      image: "/workbench.jpg",
      players: "1",
      // 
      aurora: ["#12121E", "#d0d0d0", "#020202", "#505050"]
    }
  ];

  return (
    <main className="relative overflow-hidden">
      <div className="h-[300px]">
        <Aurora
          colorStops={
            selectedHistory?.aurora || histories[0].aurora
          }
          blend={0.5}
          amplitude={1.5}
          speed={0.5}
        />
      </div>

      <section className="flex flex-col items-center">
        <h1 className="text-5xl -motion-translate-x-in-100 motion-translate-y-in-75">
          <Glitch>{t("Title")}</Glitch>
        </h1>
        <p className="text-lg">{t("Description")}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {histories.map((history, index) => (
            <Card
              className={cn("pt-0 mt-4 w-[350px]")}
              key={index}
              onClick={() => setSelectedHistory(history)}
            >
              <Image
                src={history.image} alt={history.title}
                width={500} height={300}
                className="rounded-lg h-[200px] object-cover"
              />

              <CardHeader className="flex flex-col">
                <CardTitle>{history.title}</CardTitle>
                <CardDescription>{history.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <>{history.content}</>
              </CardContent>

              {selectedHistory?.title === history.title && (
                <CardFooter className="flex justify-between">
                  <Button className="w-full">
                    {
                      history.title === "Workbench" ?
                        (<>{t("Buttons.WriteNow")}</>) :
                        <>{t("Buttons.PlayNow")}</>
                    }
                    <ArrowRight size={16} />
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>

        {!user && (
          <div className="mt-8 flex flex-col items-center gap-4 bg-white/5 p-4 rounded-lg shadow-md border border-white/10">
            <p className="text-lg">{t("Login.Why")}</p>
            
            <Button onClick={() => console.log("Sign in clicked")}>
              <User size={16} />
              {t("Login.Button")}
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Page;
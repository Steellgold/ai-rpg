"use client";

import { AuthButton } from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/hooks/use-session";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { PageLayout } from "./_l";
import { Glitch } from "@/components/glitch";
import { Badge } from "@/components/ui/badge";

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

const Page = () => {
  const { user } = useSession();
  const [selectedHistory, setSelectedHistory] = useState<typeof histories[0] | null>(histories[1]);
  const t = useTranslations("Page");

  return (
    <PageLayout aurora={selectedHistory?.aurora || histories[0].aurora}>
      <section className="flex flex-col items-center">
        <h1 className="text-5xl -motion-translate-x-in-100 motion-translate-y-in-75">
          <Glitch>{t("Title")}</Glitch>
        </h1>
        <p className="text-lg">{t("Description")}</p>
      </section>

      <div className={cn("mt-8 w-full flex justify-center gap-4 animate-in fade-in-50 slide-in-from-top-16")}>
        {histories.map((history, index) => (
          <Card  className="pt-0 w-[350px] relative z-[100]" key={index} onClick={() => setSelectedHistory(history)}>
            <Image 
              src={history.image} alt={history.title}
              width={500} height={300}
              className="rounded-lg h-[200px] object-cover"
            />

            <CardHeader className="flex flex-col">
              <CardTitle>{history.title}</CardTitle>
              <CardDescription>{history.description}</CardDescription>
            </CardHeader>
                
            <CardContent>{history.content}</CardContent>

            {selectedHistory?.title === history.title && (
              <CardFooter className="flex justify-between">
                {!user ? (
                  <AuthButton Navbar={false} className="w-full" />
                ) : (
                  <Button className="w-full">
                    {history.title === "Workbench" ? (<>{t("Buttons.WriteNow")}</>) : <>{t("Buttons.PlayNow")}</>}
                    <ArrowRight size={16} />
                  </Button>
                )}
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      <Card className="pt-0 pb-0 w-full relative z-[100] max-w-[720px] mx-auto flex flex-row items-center justify-between mt-4 animate-in fade-in-50 slide-in-from-top-16">
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
      </Card>
    </PageLayout>
  );
}

export default Page;
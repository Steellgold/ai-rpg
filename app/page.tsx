"use client";

import { Glitch } from "@/components/glitch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

const Page = () => {
  const t = useTranslations("Page");

  return (
    <section className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">
        <Glitch>{t("Title")}</Glitch>
      </h1>
      <p className="text-lg">{t("Description")}</p>

      {/* 2 defaults histories, and 1 card to open a writing prompt */}
      <div className="flex flex-row">
        <Card>
          <CardHeader>
            <CardTitle>{t("History")}</CardTitle>
            <CardDescription>{t("HistoryDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">{t("HistoryContent")}</CardContent>
          <CardFooter className="justify-center">{t("HistoryFooter")}</CardFooter>
        </Card>        
      </div>
    </section>
  );
}

export default Page;
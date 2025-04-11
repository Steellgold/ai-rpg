import { ReactElement } from "react";
import { PageLayout } from "./_l";
import { AiTextarea } from "@/components/story/textarea";
import { Syne } from "next/font/google";
import { getTranslations } from "next-intl/server";

const syne = Syne({ subsets: ["latin"], weight: ["800", "500"] });

const Page = async(): Promise<ReactElement>=> {
  const t = await getTranslations("Home");

  return (
    <PageLayout>
      <section className="flex flex-col items-center max-w-2xl mx-auto mt-10">
        <div className="flex flex-col items-center text-center">
          <h1 className={`${syne.className} text-5xl font-extrabold`}>{t("Title")}</h1>
          <p className={`${syne.className} text-lg font-medium`}>{t("Subtitle")}</p>
        </div>

        <div className="h-8" />

        <AiTextarea />
      </section>
    </PageLayout>
  );
}

export default Page;

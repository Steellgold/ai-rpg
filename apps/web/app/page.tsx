import { ReactElement } from "react";
import { Syne } from "next/font/google";
import { getTranslations } from "next-intl/server";
import { PageLayout } from "@workspace/ui/components/page-layout";
import { AiTextarea } from "@/components/ai/textarea";

const syne = Syne({ subsets: ["latin"] });

const Page = async(): Promise<ReactElement>=> {
  const t = await getTranslations("Home");

  return (
    <>
      <PageLayout>
        <section className="flex flex-col items-center max-w-2xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <h1 className={`${syne.className} text-2xl lg:text-4xl font-extrabold`}>{t("Top.title")}</h1>
            <p className={`${syne.className} text-sm lg:text-lg font-medium`}>{t("Top.subtitle")}</p>
          </div>

          <div className="h-6" />

          <div className="px-4 lg:px-0 w-full">
            <AiTextarea />
          </div>
        </section>
      </PageLayout>
    </>
  );
}

export default Page;
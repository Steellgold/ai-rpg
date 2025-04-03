"use client";

import { useTranslations } from "next-intl";
import { PageLayout } from "./_l";
import { Glitch } from "@/components/glitch";
import { AiTextarea } from "@/components/textarea";

const Page = () => {
  const t = useTranslations("Page");

  return (
    <PageLayout>
      <section className="flex flex-col items-center max-w-2xl mx-auto">
        <h1 className="text-5xl -motion-translate-x-in-100 motion-translate-y-in-75">
          <Glitch>{t("Title")}</Glitch>
        </h1>
        <p className="text-lg">{t("Description")}</p>

        <div className="h-12" />

        <AiTextarea />
      </section>
    </PageLayout>
  );
}

export default Page;

{/* <Card className="pt-0 pb-0 w-full relative z-[100] mx-auto flex flex-row items-center justify-between mt-4 animate-in fade-in-50 slide-in-from-top-16">
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
      </Card> */}
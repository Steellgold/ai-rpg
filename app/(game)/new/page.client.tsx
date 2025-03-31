"use client"

import { PageLayout } from "@/app/_l";
import { AiTextarea } from "@/components/ai-textarea";
import { Glitch } from "@/components/glitch";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

export const PageClient = () => {
  const t = useTranslations("Pages.New");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const handleGenerating = (e: CustomEvent) => {
      setIsGenerating(e.detail.isGenerating);
    };

    window.addEventListener('story-generating' as any, handleGenerating);
    
    return () => {
      window.removeEventListener('story-generating' as any, handleGenerating);
    };
  }, []);

  return (
    <PageLayout>
      <section className="flex flex-col items-center">
        <h1 className="text-5xl -motion-translate-x-in-100 motion-translate-y-in-75">
          <Glitch>{isGenerating ? t("GeneratingTitle") : t("Title")}</Glitch>
        </h1>
        <p className="text-lg">{isGenerating ? t("GeneratingDescription") : t("Description")}</p>
      </section>

      <div className="flex flex-col items-center mt-4">
        <AiTextarea />
      </div>
    </PageLayout>
  );
}
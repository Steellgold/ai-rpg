"use client";

import { Glitch } from "@/components/glitch";
import Aurora from "@/components/ui/aurora";
import { Component } from "@/lib/types";
import { useTranslations } from "next-intl";
import { PropsWithChildren as DefaultPropsWithChildren } from "react";

type PropsWithChildren = DefaultPropsWithChildren & {
  aurora?: string[];
};

export const PageLayout: Component<PropsWithChildren> = ({ children, aurora }) => {
  const t = useTranslations("Page");

  return (
    <main className="relative overflow-hidden">
      <div className="h-[300px]">
        <Aurora colorStops={aurora} blend={0.5} amplitude={1.5} speed={0.5} />
      </div>
    
      <section className="flex flex-col items-center">
        <h1 className="text-5xl -motion-translate-x-in-100 motion-translate-y-in-75">
          <Glitch>{t("Title")}</Glitch>
        </h1>
        <p className="text-lg">{t("Description")}</p>
      </section>

      <div className="mt-8 mb-8 w-full flex justify-center gap-4 animate-in fade-in-50 slide-in-from-top-16">
        {children}
      </div>
    </main>
  );
}
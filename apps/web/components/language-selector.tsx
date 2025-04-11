"use client";

import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { useLanguageStore } from "@/lib/hooks/use-lang";
import { useRouter } from "next/navigation";
import type { ISOLang } from "@/lib/types/lang";

export const LanguageSelector = () => {
  const t = useTranslations("Navbar.LanguageSelector");
  const { lang, setLang } = useLanguageStore();
  const router = useRouter();

  return (
    <Select onValueChange={(e: ISOLang) => {
      setLang(e);
      router.refresh();
    }} value={lang}>
      <SelectTrigger className="w-[120px] rounded-md">
        <SelectValue placeholder={t("Placeholder")} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{t("Label")}</SelectLabel>
          <SelectItem value="en">{t("Options.en")}</SelectItem>
          <SelectItem value="fr">{t("Options.fr")}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

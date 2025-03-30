"use client";

import { ReactElement } from "react";
import { ThemeLanguageSwitcher } from "./theme-and-language";
import { Button } from "./ui/button";
import { User } from "lucide-react";
import { useSession } from "@/lib/hooks/use-session";
import { useTranslations } from "next-intl";

export const Navbar = (): ReactElement => {
  const { error, isLoading, user } = useSession();
  const t = useTranslations("Navbar");

  return (
    <nav className="absolute top-3 right-3 z-50 flex flex-row justify-between items-center p-2 flex items-center space-x-4">
      <ThemeLanguageSwitcher />
        
      <Button onClick={() => console.log("Sign in clicked")} className="dark:backdrop-blur-sm dark:bg-white/5 dark:text-white dark:hover:bg-white/10 transition dark:duration-200 dark:ease-in-out">
        <User size={16} />
        {t("SignIn.Label")}
      </Button>
    </nav>
  )
}
"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, ChevronDown, Globe, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { useTranslations } from "next-intl"
import { useLanguageStore } from "@/lib/hooks/use-lang"
import { useRouter } from "next/navigation"
import { Skeleton } from "./ui/skeleton"
import { cn } from "@/lib/utils"

type Language = {
  code: string
  name: string
}

const languages: Language[] = [
  { code: "fr", name: "Français" },
  { code: "en", name: "English" }
]

export const ThemeLanguageSwitcher = () => {
  const { theme, setTheme } = useTheme()
  const { lang, setLang } = useLanguageStore();

  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0])
  const [mounted, setMounted] = useState(false)
  
  const t = useTranslations("Navbar.LanguageSelector");
  const router = useRouter();

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <Skeleton className="h-9 w-32" />

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <div className={"flex items-center rounded-md bg-background dark:bg-transparent text-black overflow-hidden"}>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={cn(
          "rounded-l-md rounded-r-none h-9 w-9",
          "dark:backdrop-blur-sm dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:transition dark:duration-200 dark:ease-in-out"
        )}
      >
        {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        <span className="sr-only">Toggle theme</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={cn("rounded-r-md rounded-l-none h-9 px-3 flex items-center gap-1 font-normal",
            "dark:backdrop-blur-sm dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:transition dark:duration-200 dark:ease-in-out"
          )}>
            <Globe className="h-3.5 w-3.5 mr-1 opacity-70" />
            {/* {currentLanguage.name} */}
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => {
                setCurrentLanguage(lang);
                setLang(lang.code as any);
                router.refresh();
              }}
              className={currentLanguage.code === lang.code ? "bg-accent" : ""}
            >
              {t(`Options.${lang.code}`)}
              {lang.code === currentLanguage.code && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}


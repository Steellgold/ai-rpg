"use client"

import { PropsWithChildren, useId, useState } from "react"
import { GlobeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Component } from "@/lib/types"
import { useLanguageStore } from "@/lib/hooks/use-lang"
import { ISOLang } from "@/lib/types/lang"
import { useRouter } from "next/navigation"

type Language = {
  id: ISOLang
  name: string
  flag: string
}

const LANGUAGES: Language[] = [
  { id: "fr", name: "Français", flag: "🇫🇷" },
  { id: "en", name: "English", flag: "🇺🇸" },
  { id: "es", name: "Español", flag: "🇪🇸" },
  { id: "de", name: "Deutsch", flag: "🇩🇪" }
]

export const LanguageDialog: Component<PropsWithChildren> = ({ children }) => {
  const id = useId();

  const [selectedLanguage, setSelectedLanguage] = useState<ISOLang>("en")
  const { setLang } = useLanguageStore();
  const router = useRouter();

  const handleLanguageChange = () => {
    const newLanguage = LANGUAGES.find((language) => language.id === selectedLanguage)
    if (newLanguage) {
      setLang(newLanguage.id);
      router.refresh();
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div className="mb-2 flex flex-col gap-2">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full border bg-primary/10" aria-hidden="true">
            <GlobeIcon className="text-primary" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-left">Changer de langue</DialogTitle>
            <DialogDescription className="text-left">
              Sélectionnez la langue de votre choix pour l&apos;interface.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5">
          <RadioGroup
            className="gap-2"
            defaultValue={selectedLanguage}
            onValueChange={(value) => setSelectedLanguage(value as ISOLang)}
          >
            {LANGUAGES.map((language) => (
              <div key={language.id}
                className="border-input has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-accent relative flex w-full items-center gap-2 rounded-md border px-4 py-3 shadow-xs outline-none">
                <RadioGroupItem
                  value={language.id}
                  id={`${id}-${language.id}`}
                  aria-describedby={`${id}-${language.id}-description`}
                  className="order-1 after:absolute after:inset-0"
                />

                <div className="grid grow gap-1">
                  <p id={`${id}-${language.id}-description`} className="text-sm">
                  {language.flag} {language.name}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>

          <div className="grid gap-2">
            <Button type="button" className="w-full" onClick={handleLanguageChange}>
              Appliquer
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="w-full">
                Annuler
              </Button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
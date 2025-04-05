"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Component } from "@/lib/types"
import { PageClientProps } from "@/app/(game)/[story_id]/[scene_id]/page.client"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

type CharacterCardProps = {
  character: PageClientProps["story_data"]["characters"][0]
}

export const CharacterMention: Component<CharacterCardProps> = ({ character }) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Pages.Story.CharacterCard");

  return (
    <>
      <span
        className={cn(
          "cursor-pointer",
          "bg-zinc-800",
          "text-zinc-200 hover:text-zinc-100",
          "px-2 py-0.5 rounded-md",
          "inline-flex items-center"
        )}
        onClick={() => setOpen(true)}
      >
        <Avatar className="inline-block w-5 h-5 mr-1">
          <AvatarImage src={character.imageUrl || ""} alt={character.name} />
          <AvatarFallback className="text-sm">
            {character.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {character.name}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
          <div className="flex flex-col md:flex-row h-[80vh] md:h-[500px]">
            <DialogHeader className="w-full md:w-[250px] p-6 flex flex-col items-center border-r border-zinc-800 bg-zinc-900">
              <div className="flex flex-col justify-between h-full w-full">
                <div className="flex flex-col gap-2">
                  <Avatar className="w-32 h-32 !rounded-md">
                    <AvatarImage src={character.imageUrl || ""} alt={character.name} />
                    <AvatarFallback className="text-3xl !rounded-none">
                      {character.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <DialogTitle className="text-lg font-bold text-zinc-200">{character.name}</DialogTitle>
                  <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400">
                    {character.description}
                  </DialogDescription>

                  <div className="flex flex-row items-center gap-1">
                    <Badge variant={character.isMain ? "default" : "secondary"}>
                      {character.isMain ? t("type.Main") : t("type.Secondary")}
                    </Badge>

                    {character.age &&
                      <Badge variant="outline" className="text-xs">
                        {t("age", { age: character.age })}
                      </Badge>
                    }
                  </div>
                </div>
                
                {character.abilities.length > 0 && (
                  <div className="mt-auto border border-border p-2 rounded-md bg-zinc-800">
                    <h3 className="text-xs font-semibold uppercase text-zinc-500 mb-1">{t("abilities")}</h3>
                    <div className="flex flex-wrap gap-1">
                      {character.abilities.map((ability, index) => (
                        <Badge key={index} variant="outline">
                          {ability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogHeader>

            <div className="flex-1 p-0">
              <ScrollArea className="h-[calc(80vh-2rem)] md:h-[500px] p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold uppercase text-zinc-500 mb-1">{t("description")}</h3>
                    <p className="text-sm">{character.description}</p>
                  </div>

                  {character.personality && (
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-zinc-500 mb-1">{t("personality")}</h3>
                      <p className="text-sm">{character.personality}</p>
                    </div>
                  )}

                  {character.outfit && (
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-zinc-500 mb-1">{t("outfit")}</h3>
                      <p className="text-sm">{character.outfit}</p>
                    </div>
                  )}

                  {character.background && (
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-zinc-500 mb-1">{t("background")}</h3>
                      <p className="text-sm">{character.background}</p>
                    </div>
                  )}

                  {character.relationships.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-zinc-500 mb-1">{t("relationships")}</h3>
                      <div className="flex flex-wrap gap-1">
                        {character.relationships.map((relationship, index) => (
                          <Badge key={index} variant="outline">
                            {relationship}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {character.motivations && (
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-zinc-500 mb-1">{t("motivations")}</h3>
                      <p className="text-sm">{character.motivations}</p>
                    </div>
                  )}

                  {character.flaws && (
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-zinc-500 mb-1">{t("flaws")}</h3>
                      <p className="text-sm">{character.flaws}</p>
                    </div>
                  )}

                  {character.backstory && (
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-zinc-500 mb-1">{t("backstory")}</h3>
                      <p className="text-sm">{character.backstory}</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Component } from "@/lib/types"
import { PageClientProps } from "@/app/(game)/[story_id]/[scene_id]/page.client"

type CharacterCardProps = {
  character: PageClientProps["story_data"]["characters"][0]
}

export const CharacterMention: Component<CharacterCardProps> = ({ character }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/50 cursor-pointer hover:bg-zinc-800 transition-colors"
        onClick={() => setOpen(true)}>
        <span className="font-medium text-white">{character.name}</span>
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
          <div className="flex flex-col md:flex-row h-[80vh] md:h-[500px]">
            <div className="w-full md:w-[250px] p-6 flex flex-col items-center border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src={character.imageUrl || "/placeholder.svg?height=128&width=128"} alt={character.name} />
                <AvatarFallback className="text-3xl">
                  {character.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-xl font-bold text-center mb-2">{character.name}</h2>

              <Badge variant={character.isMain ? "default" : "secondary"} className="mb-4">
                {character.isMain ? "Principal" : "Secondaire"}
              </Badge>

              {character.age && <div className="text-sm text-center text-zinc-500 dark:text-zinc-400 mb-2">{character.age} ans</div>}

              {character.abilities.length > 0 && (
                <div className="w-full mt-auto">
                  <h3 className="text-xs font-semibold uppercase text-zinc-500 mb-1 text-center">Capacités</h3>
                  <div className="flex flex-wrap justify-center gap-1">
                    {character.abilities.map((ability, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {ability}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 p-0">
              <ScrollArea className="h-[calc(80vh-2rem)] md:h-[500px] p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold uppercase text-zinc-500 mb-1">Description</h3>
                    <p className="text-sm">{character.description}</p>
                  </div>

                  {character.personality && (
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-zinc-500 mb-1">Personnalité</h3>
                      <p className="text-sm">{character.personality}</p>
                    </div>
                  )}

                  {character.outfit && (
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-zinc-500 mb-1">Tenue</h3>
                      <p className="text-sm">{character.outfit}</p>
                    </div>
                  )}

                  {character.background && (
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-zinc-500 mb-1">Background</h3>
                      <p className="text-sm">{character.background}</p>
                    </div>
                  )}

                  {character.relationships.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-zinc-500 mb-1">Relations</h3>
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
                      <h3 className="text-sm font-semibold uppercase text-zinc-500 mb-1">Motivations</h3>
                      <p className="text-sm">{character.motivations}</p>
                    </div>
                  )}

                  {character.flaws && (
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-zinc-500 mb-1">Défauts</h3>
                      <p className="text-sm">{character.flaws}</p>
                    </div>
                  )}

                  {character.backstory && (
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-zinc-500 mb-1">Histoire</h3>
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
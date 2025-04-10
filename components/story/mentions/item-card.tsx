"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Component } from "@/lib/types"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { ShoppingBag } from "lucide-react"
import Image from "next/image"

type ItemType = "WEAPON" | "ARMOR" | "POTION" | "KEY" | "TOOL" | "DOCUMENT" | "QUEST" | "MISC"
type ItemRarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY"

type ItemProps = {
  item: {
    id: string
    name: string
    description: string
    type: ItemType
    rarity: ItemRarity
    effect?: string
    useCount?: number
    imageUrl?: string
    quantity?: number
    isEquipped?: boolean
  }
  onClick?: () => void
  isInventoryItem?: boolean
}

export const ItemMention: Component<ItemProps> = ({ item, onClick, isInventoryItem = false }) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Pages.Story.ItemCard");

  const rarityColors = {
    COMMON: "border border-zinc-600 text-zinc-200",
    UNCOMMON: "border border-green-700 text-green-100",
    RARE: "border border-blue-700 text-blue-100",
    EPIC: "border border-purple-700 text-purple-100",
    LEGENDARY: "border border-orange-600 text-orange-100"
  };

  const typeIcons = {
    WEAPON: "⚔️",
    ARMOR: "🛡️",
    POTION: "🧪",
    KEY: "🔑",
    TOOL: "🔧",
    DOCUMENT: "📜",
    QUEST: "⚝",
    MISC: "✨"
  };

  return (
    <>
      <span
        className={cn(
          "cursor-pointer",
          "bg-card border",
          rarityColors[item.rarity] || "border-border",
          isInventoryItem ? "bg-zinc-800" : "",
          "text-zinc-200",
          "px-1 rounded-sm",
          "inline-flex items-center"
        )}
        onClick={() => setOpen(true)}
      >
        <span className="mr-1">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.name} className="w-4 h-4 rounded-md" width={16} height={16} />
          ) : (
            <>{typeIcons[item.type]}</>
          )}
        </span>

        {item.name}
        {isInventoryItem && item.quantity && item.quantity > 1 && (
          <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-[10px]">
            {item.quantity}
          </Badge>
        )}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
          <div className="flex flex-col md:flex-row h-[80vh] md:h-[500px]">
            <DialogHeader className="w-full md:w-[250px] p-6 flex flex-col items-center border-r border-zinc-800 bg-zinc-900">
              <div className="flex flex-col justify-between h-full w-full">
                <div className="flex flex-col gap-4">
                  {item.imageUrl ? (
                    <div className="w-32 h-32 bg-zinc-800 rounded-md overflow-hidden">
                      <Image src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" width={128} height={128} />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-zinc-800 rounded-md flex items-center justify-center text-4xl">
                      {typeIcons[item.type]}
                    </div>
                  )}

                  <div>
                    <DialogTitle className="text-lg font-bold text-zinc-200">{item.name}</DialogTitle>
                    <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400">
                      {item.description}
                    </DialogDescription>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Badge className={cn("w-fit bg-transparent", rarityColors[item.rarity])}>
                      {t(`rarity.${item.rarity.toLowerCase()}`)}
                    </Badge>

                    <Badge variant="outline" className="w-fit">
                      {t(`type.${item.type.toLowerCase()}`)}
                    </Badge>

                    {isInventoryItem && (
                      <Badge variant={item.isEquipped ? "default" : "secondary"} className="w-fit">
                        {item.isEquipped ? t("status.equipped") : t("status.unequipped")}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {isInventoryItem && (
                  <div className="mt-auto border border-border p-2 rounded-md bg-zinc-800">
                    <h3 className="text-xs font-semibold uppercase text-zinc-500 mb-1">{t("quantity")}</h3>
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-zinc-400" />
                      <span className="text-sm">{item.quantity || 1}</span>
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
                    <p className="text-sm">{item.description}</p>
                  </div>

                  {item.effect && (
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-zinc-500 mb-1">{t("effect")}</h3>
                      <p className="text-sm">{item.effect}</p>
                    </div>
                  )}

                  {item.useCount !== undefined && (
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-zinc-500 mb-1">{t("uses")}</h3>
                      <p className="text-sm">
                        {item.useCount === 0 ? 
                          t("unlimited_uses") : 
                          t("remaining_uses", { count: item.useCount })}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold uppercase text-zinc-500 mb-1">{t("rarity_description")}</h3>
                    <p className="text-sm">{t(`rarity_desc.${item.rarity.toLowerCase()}`)}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold uppercase text-zinc-500 mb-1">{t("type_description")}</h3>
                    <p className="text-sm">{t(`type_desc.${item.type.toLowerCase()}`)}</p>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
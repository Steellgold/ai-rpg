"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Component } from "@/lib/types"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Backpack, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ItemMention } from "./item-card"

type ItemType = "WEAPON" | "ARMOR" | "POTION" | "KEY" | "TOOL" | "DOCUMENT" | "QUEST" | "MISC"

type InventoryItem = {
  id: string
  name: string
  description: string
  type: ItemType
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY"
  effect?: string
  useCount?: number
  imageUrl?: string
  quantity: number
  isEquipped: boolean
}

type InventoryProps = {
  items: InventoryItem[]
  onEquipItem?: (itemId: string, equip: boolean) => void
  onUseItem?: (itemId: string) => void
  className?: string
  trigger?: React.ReactNode
}

export const Inventory: Component<InventoryProps> = ({ 
  items, 
  onEquipItem, 
  onUseItem,
  className,
  trigger
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const t = useTranslations("Pages.Story.Inventory");
  
  // Group items by type for the tabs
  const itemsByType = items.reduce((acc, item) => {
    const type = item.type.toLowerCase();
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>);
  
  // Get unique item types present in inventory
  const uniqueTypes = [...new Set(items.map(item => item.type.toLowerCase()))];
  
  // Filter items by search term and type
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || item.type.toLowerCase() === filterType;
    return matchesSearch && matchesType;
  });
  
  // Sort items: equipped first, then by rarity (highest to lowest), then by name
  const rarityOrder = { "LEGENDARY": 5, "EPIC": 4, "RARE": 3, "UNCOMMON": 2, "COMMON": 1 };
  const sortedItems = [...filteredItems].sort((a, b) => {
    // Equipped items first
    if (a.isEquipped && !b.isEquipped) return -1;
    if (!a.isEquipped && b.isEquipped) return 1;
    
    // Then by rarity (highest to lowest)
    const rarityDiff = (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
    if (rarityDiff !== 0) return rarityDiff;
    
    // Then alphabetically by name
    return a.name.localeCompare(b.name);
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            size="icon"
            className={cn("relative", className)}
          >
            <Backpack className="h-5 w-5" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{t("title")}</DialogTitle>
          <div className="relative mt-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder={t("search_placeholder")}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="all" className="p-6 pt-4">
          <TabsList className="mb-4">
            <TabsTrigger value="all" onClick={() => setFilterType("all")}>
              {t("all_items")}
            </TabsTrigger>
            
            {uniqueTypes.map(type => (
              <TabsTrigger 
                key={type} 
                value={type}
                onClick={() => setFilterType(type)}
              >
                {t(`type.${type}`)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <ScrollArea className="h-[400px]">
            {sortedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
                {searchTerm || filterType !== "all" ? (
                  <>
                    <Search className="h-12 w-12 mb-2 opacity-20" />
                    <p>{t("no_items_found")}</p>
                  </>
                ) : (
                  <>
                    <Backpack className="h-12 w-12 mb-2 opacity-20" />
                    <p>{t("empty_inventory")}</p>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedItems.map(item => (
                  <div 
                    key={item.id}
                    className={cn(
                      "p-4 rounded-lg flex items-start gap-3",
                      "border border-zinc-800",
                      "hover:bg-zinc-800/30 transition-colors",
                      item.isEquipped && "bg-zinc-800/50"
                    )}
                  >
                    <div className="flex-1">
                      <ItemMention item={item} isInventoryItem={true} />
                      <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{item.description}</p>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      {onEquipItem && (
                        <Button
                          variant={item.isEquipped ? "default" : "outline"}
                          size="sm"
                          onClick={() => onEquipItem(item.id, !item.isEquipped)}
                        >
                          {item.isEquipped ? t("unequip") : t("equip")}
                        </Button>
                      )}
                      
                      {onUseItem && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onUseItem(item.id)}
                        >
                          {t("use")}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
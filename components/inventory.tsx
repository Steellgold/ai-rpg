"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Backpack, Search, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useTranslations } from "next-intl"
import { ItemMention } from "./item-card"
import { cn } from "@/lib/utils"
import { ItemRarity, ItemType } from "@prisma/client"

type InventoryItemType = {
  id: string
  name: string
  description: string
  type: ItemType;
  rarity: ItemRarity;
  effect?: string
  durability?: number
  remainingUses?: number
  isBroken: boolean
  imageUrl?: string
  brokenImageUrl?: string
  quantity: number
  isEquipped: boolean
}

type InventoryProps = {
  items: InventoryItemType[]
  onEquipItem?: (itemId: string, equip: boolean) => void
  onUseItem?: (itemId: string) => Promise<boolean>
  onActiveItemChange?: (itemId: string | null) => void
  trigger?: React.ReactNode
}

export const Inventory = ({ 
  items, 
  onEquipItem, 
  onUseItem,
  onActiveItemChange,
  trigger 
}: InventoryProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [isUsing, setIsUsing] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const t = useTranslations("Pages.Story.Inventory")
  
  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === "all" || item.type.toLowerCase() === filterType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      if (a.isBroken && !b.isBroken) return 1
      if (!a.isBroken && b.isBroken) return -1
      if (a.isEquipped && !b.isEquipped) return -1
      if (!a.isEquipped && b.isEquipped) return 1

      const rarityOrder = { "LEGENDARY": 5, "EPIC": 4, "RARE": 3, "UNCOMMON": 2, "COMMON": 1 }
      return ((rarityOrder as any)[b.rarity] || 0) - ((rarityOrder as any)[a.rarity] || 0)
    })
  
  const uniqueTypes = [...new Set(items.map(item => item.type.toLowerCase()))]
  
  useEffect(() => {
    if (onActiveItemChange) {
      onActiveItemChange(activeItem)
    }
  }, [activeItem, onActiveItemChange])
  
  const handleUseItem = async (itemId: string) => {
    if (!onUseItem || isUsing) return
    
    setIsUsing(itemId)
    try {
      const success = await onUseItem(itemId)
      if (success) {
        setActiveItem(activeItem === itemId ? null : itemId)
      }
    } finally {
      setIsUsing(null)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon" className="relative">
            <Backpack className="h-5 w-5" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {items.filter(i => !i.isBroken).length}
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
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
                <Search className="h-12 w-12 mb-2 opacity-20" />
                <p>{t("no_items_found")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredItems.map(item => (
                  <div 
                    key={item.id}
                    className={`p-4 rounded-lg border ${
                      item.isBroken ? 'border-red-800 bg-red-900/20' : 
                      item.isEquipped ? 'border-blue-800 bg-blue-900/20' :
                      activeItem === item.id ? 'border-green-800 bg-green-900/20' :
                      'border-zinc-800 hover:bg-zinc-800/30'
                    } transition-colors`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 flex-shrink-0">
                        {item.imageUrl && (
                          <img 
                            src={item.isBroken && item.brokenImageUrl ? item.brokenImageUrl : item.imageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover rounded-md"
                          />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <ItemMention item={item} isInventoryItem={true} />
                            <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{item.description}</p>
                          </div>
                          
                          {item.isBroken && (
                            <span className="flex items-center text-red-500 text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {t("broken")}
                            </span>
                          )}
                        </div>
                        
                        {(item.durability && item.remainingUses !== undefined) && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{t("durability")}</span>
                              <span>{item.remainingUses}/{item.durability}</span>
                            </div>
                            <Progress 
                              value={(item.remainingUses / item.durability) * 100} 
                              className={cn(
                                "h-1.5", {
                                  "bg-red-500": item.remainingUses < item.durability * 0.25,
                                  "bg-yellow-500": item.remainingUses < item.durability * 0.5 && item.remainingUses >= item.durability * 0.25,
                                  "bg-green-500": item.remainingUses >= item.durability * 0.5
                                }
                              )}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        {onEquipItem && !item.isBroken && (
                          <Button
                            variant={item.isEquipped ? "default" : "outline"}
                            size="sm"
                            onClick={() => onEquipItem(item.id, !item.isEquipped)}
                          >
                            {item.isEquipped ? t("unequip") : t("equip")}
                          </Button>
                        )}
                        
                        {onUseItem && !item.isBroken && (
                          <Button
                            variant={activeItem === item.id ? "default" : "secondary"}
                            size="sm"
                            onClick={() => handleUseItem(item.id)}
                            disabled={isUsing !== null}
                            className={activeItem === item.id ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            {isUsing === item.id ? t("using") : 
                             activeItem === item.id ? t("active") : t("use")}
                          </Button>
                        )}
                      </div>
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
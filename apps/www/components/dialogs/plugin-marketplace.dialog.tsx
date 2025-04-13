"use client"

import type React from "react";
import { useState, useEffect, useTransition } from "react";
import {
  Search, Heart, BarChart3, Globe, FileText,
  User, Loader2, LucideIcon, PencilRuler,
  SwatchBook, MountainSnow, MessageCircleQuestion,
  Wand, Briefcase
} from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Component } from "@/lib/types/component";
import { Skeleton } from "@/components/ui/skeleton";
import { PluginType } from "@imagine/types/plugin";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { searchPlugins } from "@/lib/actions/plugin-search";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { capitalizeFirstLetter } from "@/lib/utils";

export type Plugin = {
  id: string
  title: string
  description: string
  icon: React.ReactNode | string
  author: {
    id: string
    name: string
    avatar?: string
  }
  likes: number
  downloads: number
  type: PluginType
  isOfficial: boolean
  featured?: boolean
  pricing?: string
  creditPrice?: number | null
  euroPrice?: number | null
  usageCredits?: number | null
  tags?: Array<{ id: string; name: string }>
  gradientColors: string
}

type PluginMarketplaceProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd?: (plugin: Plugin) => void
  onRemove?: (pluginId: string) => void
  children?: React.ReactNode
  selectedPlugins?: string[]
}

export const PluginMarketplace: Component<PluginMarketplaceProps> = ({
  open, onOpenChange,
  onAdd, onRemove,
  selectedPlugins = [],
}) => {
  type Category = "NARRATIVE" | "INTRIGUE" | "CHARACTER" | "WORLD" | "OBJECT" | "THEME" | "STYLE" | "MECHANICS" | "all"

  const t = useTranslations("MarketplaceDialog");

  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<Category>("all")
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [initialLoading, setInitialLoading] = useState(true)
  
  const debouncedQuery = useDebounce(searchQuery, 300)
  
  const loadPlugins = async (query: string, category: string, pageNum: number = 1, append: boolean = false) => {
    try {
      let pluginType: PluginType | undefined
      if (category !== "all") {
        pluginType = category.toUpperCase() as PluginType
      }
      
      const result = await searchPlugins({ query, type: pluginType, limit: 12, offset: (pageNum - 1) * 12 })
      
      if (append) {
        setPlugins(prev => [...prev, ...result.plugins])
      } else {
        setPlugins(result.plugins)
      }
      
      setTotal(result.total)
      setInitialLoading(false)
    } catch (error) {
      console.error("Error loading plugins:", error)
      setInitialLoading(false)
    }
  }
  
  useEffect(() => {
    if (open) loadPlugins("", "all")
  }, [open])
  
  useEffect(() => {
    if (!open) return
    
    setPage(1)
    startTransition(() => {
      loadPlugins(debouncedQuery, activeCategory)
    })
  }, [debouncedQuery, activeCategory, open])
  
  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    startTransition(() => {
      loadPlugins(debouncedQuery, activeCategory, nextPage, true)
    })
  }

  const handleAddPlugin = (plugin: Plugin) => {
    if (onAdd) onAdd(plugin)
  }

  const handleRemovePlugin = (pluginId: string) => {
    if (onRemove) onRemove(pluginId)
  }

  const isPluginSelected = (pluginId: string) => {
    return selectedPlugins.includes(pluginId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-6xl min-w-[60vw] p-0 overflow-hidden bg-[#0a0b14] text-white border-[#2a2c3a]"
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <div className="flex h-[85vh]">
          {/* Left sidebar */}
          <div className="w-64 border-r border-[#2a2c3a] p-6">
            <h3 className="text-lg font-semibold mb-4">{t("Sidebar.Title")}</h3>
            <div className="space-y-1">
              <PluginCategoryButton
                onClick={() => setActiveCategory("all")}
                icon={Globe} label={t("Categories.All")} isActive={activeCategory === "all"} />

              <PluginCategoryButton
                onClick={() => setActiveCategory("NARRATIVE")}
                icon={FileText} label={t("Categories.Narrative")} isActive={activeCategory === "NARRATIVE"} />

              <PluginCategoryButton
                onClick={() => setActiveCategory("INTRIGUE")}
                icon={MessageCircleQuestion} label={t("Categories.Intrigue")} isActive={activeCategory === "INTRIGUE"} />

              <PluginCategoryButton
                onClick={() => setActiveCategory("CHARACTER")}
                icon={User} label={t("Categories.Character")} isActive={activeCategory === "CHARACTER"} />

              <PluginCategoryButton
                onClick={() => setActiveCategory("WORLD")}
                icon={MountainSnow} label={t("Categories.World")} isActive={activeCategory === "WORLD"} />

              <PluginCategoryButton
                onClick={() => setActiveCategory("OBJECT")}
                icon={PencilRuler} label={t("Categories.Object")} isActive={activeCategory === "OBJECT"} />

              <PluginCategoryButton
                onClick={() => setActiveCategory("THEME")}
                icon={SwatchBook} label={t("Categories.Theme")} isActive={activeCategory === "THEME"} />

              <PluginCategoryButton
                onClick={() => setActiveCategory("STYLE")}
                icon={Briefcase} label={t("Categories.Style")} isActive={activeCategory === "STYLE"} />

              <PluginCategoryButton
                onClick={() => setActiveCategory("MECHANICS")}
                icon={Wand} label={t("Categories.Mechanics")} isActive={activeCategory === "MECHANICS"} />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-[#2a2c3a]">
              <div className="flex items-center justify-between mb-6 border border-[#2a2c3a] rounded-lg p-4 bg-[#12131f]">
                <div>
                  <h2 className="text-2xl font-bold">{t("Creator.Title")}</h2>
                  <p className="text-gray-400 mt-1 max-w-2xl">
                    {t("Creator.Description")}
                  </p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => onOpenChange(false)}>
                  {t("Creator.Button")}
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder={t("Search.Placeholder")}
                  className="pl-10 bg-[#1a1b29] border-[#2a2c3a] text-white placeholder:text-gray-400 focus-visible:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {isPending && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">
                      {t("Categories." + capitalizeFirstLetter(activeCategory, true))}
                    </h3>
                    
                    <div className="text-sm text-gray-400">
                      {t("PluginCount", { count: total })}
                    </div>
                  </div>

                  {initialLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <PluginCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : plugins.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-[#2a2c3a] rounded-full flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium mb-2">{t("NoResults.Title")}</h4>
                      <p className="text-gray-400 max-w-md">
                        {t("NoResults.Description")}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plugins.map((plugin) => (
                          <PluginCard
                            key={plugin.id}
                            plugin={plugin}
                            isSelected={isPluginSelected(plugin.id)}
                            onAdd={handleAddPlugin}
                            onRemove={handleRemovePlugin}
                          />
                        ))}
                      </div>
                      
                      {plugins.length < total && (
                        <div className="mt-8 flex justify-center">
                          <Button 
                            variant="outline" 
                            className="border-[#2a2c3a] text-white hover:bg-[#2a2c3a]"
                            onClick={handleLoadMore}
                            disabled={isPending}
                          >
                            {isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("LoadMore.Loading")}
                              </>
                            ) : (
                              t("LoadMore.Button")
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="p-4 border-t border-[#2a2c3a] bg-[#12131f]">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">{t("Footer.Selected", { count: selectedPlugins.length })}</p>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="bg-[#1a1b29] text-white border-[#2a2c3a] hover:bg-[#2a2c3a] hover:text-white"
                >
                  {t("Footer.Done")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

type PluginCardProps = {
  plugin: Plugin
  isSelected: boolean
  onAdd: (plugin: Plugin) => void
  onRemove: (pluginId: string) => void
}

const PluginCard: Component<PluginCardProps> = ({
  plugin, isSelected,
  onAdd, onRemove,
}) => {
  const t = useTranslations("MarketplaceDialog");
  
  const renderPrice = () => {
    if (!plugin.pricing) return null;
    
    switch (plugin.pricing) {
      case 'FREE':
        return (
          <Badge className="bg-green-700 text-white border-none">
            {plugin.usageCredits ? t("Plugin.Price.CreditsPerUse", { credits: plugin.usageCredits }) : t("Plugin.Price.Free")}
          </Badge>
        );
      case 'PREMIUM':
        return (
          <Badge className="bg-indigo-700 text-white border-none">
            {t("Plugin.Price.Credits", { credits: plugin.creditPrice ?? 0 })}
          </Badge>
        );
      case 'PAID':
        return (
          <Badge className="bg-amber-700 text-white border-none">
            {t("Plugin.Price.Euros", { price: plugin.euroPrice?.toFixed(2) ?? 0 })}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col rounded-lg overflow-hidden border border-[#2a2c3a]">
      <div className={`h-16 bg-gradient-to-r ${plugin.gradientColors} relative p-4`}>
        {plugin.featured && (
          <Badge className="absolute top-2 left-2 bg-amber-700 border-none text-white">
            {t("Plugin.Featured")}
          </Badge>
        )}
        <div className="absolute bottom-0 left-4 transform translate-y-1/2">
          <div className="bg-[#0a0b14] rounded-full p-3 w-12 h-12 flex items-center justify-center text-xl border border-[#2a2c3a] select-none">
            {typeof plugin.icon === 'string' ? plugin.icon : plugin.icon}
          </div>
        </div>
        <div className="absolute top-2 right-2">
          {renderPrice()}
        </div>
      </div>
      <div className="p-4 pt-8 flex-1 bg-[#12131f]">
        <div className="flex items-center mb-1">
          <h4 className="font-semibold text-lg">{plugin.title}</h4>
        </div>
        <div className="flex items-center mb-3">
          <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-xs mr-2">
            {plugin.author.avatar ? (
              <Image
                src={plugin.author.avatar} 
                alt={plugin.author.name} 
                className="w-full h-full rounded-full object-cover"
                width={20}
                height={20}
              />
            ) : (
              plugin.author.name.charAt(0)
            )}
          </div>
          <span className="text-sm text-gray-400">{plugin.author.name}</span>
        </div>
        <p className="text-sm text-gray-300 mb-4 line-clamp-2">{plugin.description}</p>
        
        {plugin.tags && plugin.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {plugin.tags.slice(0, 3).map(tag => (
              <Badge 
                key={tag.id} 
                variant="outline" 
                className="text-xs bg-[#1a1b29] border-[#2a2c3a] text-gray-300"
              >
                {tag.name}
              </Badge>
            ))}
            {plugin.tags.length > 3 && (
              <Badge variant="outline" className="text-xs bg-[#1a1b29] border-[#2a2c3a] text-gray-300">
                +{plugin.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-gray-400 text-sm">
              <Heart className="h-3.5 w-3.5 mr-1" />
              {plugin.likes.toLocaleString()}
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <BarChart3 className="h-3.5 w-3.5 mr-1" />
              {plugin.downloads.toLocaleString()}
            </div>
          </div>
          {plugin.isOfficial && (
            <Badge className={`${plugin.isOfficial ? "bg-[#2a2c3a]" : "bg-[#2a2c3a]"} text-gray-300 border-none`}>
              {t("Plugin.Official")}
            </Badge>
          )}
        </div>
      </div>
      <div className="p-3 bg-[#12131f] border-t border-[#2a2c3a] flex flex-row gap-2">
        {isSelected ? (
          <Button
            variant="destructive"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={() => onRemove(plugin.id)}
          >
            {t("Plugin.Actions.Remove")}
          </Button>
        ) : (
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => onAdd(plugin)}
          >
            {t("Plugin.Actions.Add")}
          </Button>
        )}

        <Button
          variant="ghost"
          className="w-full bg-[#1a1b29] text-gray-300 hover:bg-[#2a2c3a]"
          onClick={() => window.open(`/plugins/${plugin.id}`, "_blank")}
        >
          {t("Plugin.Actions.View")}
        </Button>
      </div>
    </div>
  )
}

const PluginCardSkeleton = () => {
  return (
    <div className="flex flex-col rounded-lg overflow-hidden border border-[#2a2c3a]">
      <Skeleton className="h-32 bg-[#1a1b29]" />
      <div className="p-4 pt-8 flex-1 bg-[#12131f]">
        <Skeleton className="h-6 w-3/4 bg-[#1a1b29] mb-3" />
        <Skeleton className="h-4 w-1/2 bg-[#1a1b29] mb-3" />
        <Skeleton className="h-4 w-full bg-[#1a1b29] mb-2" />
        <Skeleton className="h-4 w-full bg-[#1a1b29] mb-4" />
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-5 w-12 bg-[#1a1b29]" />
            <Skeleton className="h-5 w-12 bg-[#1a1b29]" />
          </div>
          <Skeleton className="h-5 w-16 bg-[#1a1b29]" />
        </div>
      </div>
      <div className="p-3 bg-[#12131f] border-t border-[#2a2c3a]">
        <Skeleton className="h-9 w-full bg-[#1a1b29]" />
      </div>
    </div>
  )
}

type CategoryButtonProps = {
  icon: LucideIcon;
  label: string
  isActive: boolean
  onClick: () => void
}

const PluginCategoryButton: Component<CategoryButtonProps> = ({ icon: Icon, label, isActive, onClick }) => {
  return (
    <button
      className={`flex items-center w-full rounded-md px-3 py-2 text-sm ${isActive ? "bg-[#3b3d51] text-white" : "text-gray-300 hover:bg-[#2a2c3a]"}`}
      onClick={onClick}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </button>
  )
}
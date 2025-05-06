"use client"

import type React from "react";
import { useState, useEffect, useTransition } from "react";
import {
  Search, Globe, FileText,
  User, Loader2, LucideIcon, PencilRuler,
  SwatchBook, MountainSnow, MessageCircleQuestion,
  Wand, Briefcase,
  Heart
} from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Component } from "@/lib/types/component";
import { Skeleton } from "@/components/ui/skeleton";
import { PluginType } from "@imagine/types/plugin";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { getLikedPlugins, searchPlugins, UIPlugin } from "@/lib/actions/plugin-search";
import { useTranslations } from "next-intl";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import { PluginCard } from "../plugins/plugin.card";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useSession } from "@/lib/hooks/use-session";
import { PluginView } from "../plugins/plugin.view";
import { Input } from "../ui/input";

type PluginMarketplaceProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd?: (plugin: UIPlugin) => void
  onRemove?: (pluginId: string) => void
  children?: React.ReactNode
  selectedPlugins?: string[]
}

type Category = "NARRATIVE" | "INTRIGUE" | "CHARACTER" | "WORLD" | "OBJECT" | "THEME" | "STYLE" | "MECHANICS" | "all" | "LIKED"

export const PluginMarketplace: Component<PluginMarketplaceProps> = ({
  open, onOpenChange,
  onAdd, onRemove,
  selectedPlugins = [],
}) => {

  const t = useTranslations("MarketplaceDialog");
  const { loading, user } = useSession();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [plugins, setPlugins] = useState<UIPlugin[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [initialLoading, setInitialLoading] = useState(true);
  // 
  const [likedCount, setLikedCount] = useState(0);
  const [likedList, setLikedList] = useState<string[]>([]);
  // 
  const [pluginView, setPluginView] = useState<UIPlugin | null>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);

  const loadLikedCount = async () => {
    if (!user?.id) return;
    
    try {
      const { count, likedPlugins } = await getLikedPlugins(user.id);
      setLikedCount(count);
      setLikedList(likedPlugins);
    } catch (error) {
      console.error("Error loading liked count:", error);
    }
  };

  const loadPlugins = async (query: string, category: string, pageNum: number = 1, append: boolean = false) => {
    try {
      let pluginType: PluginType | undefined
      if (category !== "all") {
        pluginType = category.toUpperCase() as PluginType
      }

      const result = await searchPlugins({
        query,
        type: category === "LIKED" ? undefined : pluginType,
        limit: 12,
        offset: (pageNum - 1) * 12,
        liked: category === "LIKED"
      });

      if (append) setPlugins(prev => [...prev, ...result.plugins])
      else setPlugins(result.plugins)

      setTotal(result.total)
      setInitialLoading(false)
    } catch (error) {
      console.error("Error loading plugins:", error)
      setInitialLoading(false)
    }
  }

  useEffect(() => {
    if (open && user?.id) {
      loadLikedCount();
    }
  }, [open, user?.id]);
  
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

  const handleAddPlugin = (plugin: UIPlugin) => {
    if (onAdd) onAdd(plugin)
  }

  const handleRemovePlugin = (pluginId: string) => {
    if (onRemove) onRemove(pluginId)
  }

  const isPluginSelected = (pluginId: string) => {
    return selectedPlugins.includes(pluginId)
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl min-w-[60vw] max-h-screen overflow-y-auto p-0 bg-[#0a0b14] text-white border-[#2a2c3a]">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onOpenChange(false)
          setPluginView(null)
        }
      }}
    >
      <DialogContent
        className={cn(
          "max-w-6xl min-w-[80vw] max-h-screen overflow-y-auto p-0 text-white border-[#2a2c3a]", {
            "bg-[#0a0b14]": !pluginView,
            "bg-background": pluginView
          }
        )}
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <div className="h-[85vh]">
          {pluginView ? (
            <PluginView
              plugin={pluginView}
              onClose={() => setPluginView(null)}
              onAdd={handleAddPlugin}
              onRemove={handleRemovePlugin}
              onView={setPluginView}
            />
          ) : (
            <div className="flex flex-col md:flex-row h-full">
              {/* Left sidebar */}
              <div className="w-full md:w-64 border-r border-[#2a2c3a] p-4 flex flex-col h-full">
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

                <Separator className="hidden md:block my-2 border-[#2a2c3a]" />

                <div className="md:hidden">
                  <ScrollArea className="w-96 whitespace-nowrap rounded-md border border-[#2a2c3a] bg-[#12131f]">
                    <div className="flex w-max space-x-4 p-2">
                      <CategoriesButtons
                        setActiveCategory={(category) => setActiveCategory(category)}
                        activeCategory={activeCategory}
                        likedCount={likedCount}
                      />
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>

                <div className="hidden md:flex md:flex-col space-y-1 flex-grow">
                  <CategoriesButtons
                    setActiveCategory={(category) => setActiveCategory(category)}
                    activeCategory={activeCategory}
                    likedCount={likedCount}
                  />
                </div>
                
                {/* <div className={cn(
                  "hidden md:block mt-auto p-4 border-2 border-[#2a2c3a] rounded-md",
                  "bg-gradient-to-tl from-[#12131f] to-[#1a1b29]"
                )}>
                  <p className="text-sm text-white mb-2">{t("Creator.Title")}</p>
                  <p className="text-xs text-gray-400 mb-4">{t("Creator.Description")}</p>

                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                  >
                    <PencilRuler className="h-4 w-4" />
                    {t("Creator.Button")}
                  </Button>
                </div> */}
              </div>

              <div className="flex-1 flex flex-col">
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
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {plugins.map((plugin) => (
                              <PluginCard
                                key={plugin.id}
                                plugin={plugin}
                                isSelected={isPluginSelected(plugin.id)}
                                onAdd={handleAddPlugin}
                                onRemove={handleRemovePlugin}
                                onView={setPluginView}
                                liked={likedList.includes(plugin.id)}
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

type CategoriesButtonsProps = {
  setActiveCategory: (category: Category) => void;
  activeCategory: string;
  likedCount?: number;
}

const CategoriesButtons: Component<CategoriesButtonsProps> = ({ setActiveCategory, activeCategory, likedCount }) => {
  const t = useTranslations("MarketplaceDialog");

  return (
    <>
      <PluginCategoryButton
        onClick={() => setActiveCategory("all")}
        icon={Globe} label={t("Categories.All")} isActive={activeCategory === "all"} />
        
      <PluginCategoryButton
        onClick={() => setActiveCategory("LIKED")}
        icon={Heart} label={t("Categories.Liked")} isActive={activeCategory === "LIKED"}
        info={likedCount ? likedCount : undefined}
      />

      <Separator className="hidden md:block my-2 border-[#2a2c3a]" />

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
    </>
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
  label: string;
  isActive: boolean;
  info?: string | number | undefined;
  onClick: () => void;
}

const PluginCategoryButton: Component<CategoryButtonProps> = ({ icon: Icon, label, isActive, onClick, info }) => {
  return (
    <button
      className={cn(
        "flex items-center justify-between w-full rounded-md px-3 py-2 text-sm",
        `${isActive ? "bg-[#3b3d51] text-white" : "text-gray-300 hover:bg-[#2a2c3a]"}`
      )}
      onClick={onClick}
    >
      <div className="flex items-center">
        <Icon className="mr-2 h-4 w-4" />
        <span className="truncate">{label}</span>
      </div>

      {info && (
        <Badge
          variant="secondary"
          className="ml-2 text-xs font-medium"
          style={{ backgroundColor: "#3b3d51", color: "#fff" }}
        >
          {info}
        </Badge>
      )}
    </button>
  )
}

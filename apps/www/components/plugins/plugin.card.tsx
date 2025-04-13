import { Heart, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Component } from "@/lib/types/component";
import { getPluginGradient } from "@/lib/plugin-gradients";
import { UIPlugin } from "@/lib/actions/plugin-search";
import { Button } from "../ui/button";

type PluginCardProps = {
  plugin: UIPlugin
  isSelected: boolean
  onAdd: (plugin: UIPlugin) => void
  onRemove: (pluginId: string) => void
}

export const PluginCard: Component<PluginCardProps> = ({
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
            {plugin.usage ? t("Plugin.Price.CreditsPerUse", { credits: plugin.usage }) : t("Plugin.Price.Free")}
          </Badge>
        );
      case "CREDITS":
        return (
          <Badge className="bg-indigo-700 text-white border-none">
            {t("Plugin.Price.Credits", { credits: plugin.price ?? 0 })}
          </Badge>
        );
      case 'PAID':
        return (
          <Badge className="bg-amber-700 text-white border-none">
            {t("Plugin.Price.Euros", { price: plugin.price?.toFixed(2) ?? 0 })}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col rounded-lg overflow-hidden border border-[#2a2c3a]">
      <div className={`h-16 bg-gradient-to-r ${getPluginGradient(plugin.type)} relative p-4`}>
        {plugin.isFeatured && (
          <Badge className="absolute top-2 left-2 bg-amber-700 border-none text-white">
            {t("Plugin.Featured")}
          </Badge>
        )}
        <div className="absolute bottom-0 left-4 transform translate-y-1/2">
          <div className="bg-[#0a0b14] rounded-full p-3 w-12 h-12 flex items-center justify-center text-xl border border-[#2a2c3a] select-none">
            {plugin.emoji}
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
            {plugin.author.image_url ? (
              <Image
                src={plugin.author.image_url}
                alt={plugin.author.display_name}
                className="w-full h-full rounded-full object-cover"
                width={20}
                height={20}
              />
            ) : (
              plugin.author.display_name?.charAt(0).toUpperCase()
            )}
          </div>
          <span className="text-sm text-gray-400">{plugin.author.display_name}</span>
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
              {plugin._count.likes.toLocaleString()}
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
          <span className="hidden sm:inline">{t("Plugin.Actions.ViewFull")}</span>
          <span className="inline sm:hidden">{t("Plugin.Actions.View")}</span>
        </Button>
      </div>
    </div>
  )
}
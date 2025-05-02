"use client";

import { fetchRelatedPlugins, likePlugin, RelatedPlugin } from "@/lib/actions/plugin";
import { UIPlugin } from "@/lib/actions/plugin-search";
import { Component } from "@/lib/types/component";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { getPluginGradient } from "@/lib/plugin-gradients";
import { Badge } from "../ui/badge";
import { ArrowLeft, Download, Eye, Star, Heart, User, Tag } from "lucide-react";
import { dayJS } from "@/lib/dayjs";

type PluginViewProps = {
  plugin: UIPlugin;
  onAdd: (plugin: UIPlugin) => void;
  onRemove: (pluginId: string) => void;
  onView?: (plugin: UIPlugin) => void;
  onClose?: () => void;
};

export const PluginView: Component<PluginViewProps> = ({ plugin, onAdd, onRemove, onClose }) => {
  const [relatedPlugins, setRelatedPlugins] = useState<RelatedPlugin[]>([]);
  const [isAdded, setIsAdded] = useState(false);

  const [isLiked, setIsLiked] = useState(false);

  const fetchPlugin = async () => {
    try {
      const related = await fetchRelatedPlugins(plugin.id);
      if (related) {
        setRelatedPlugins(related);
      }
    } catch (error) {
      console.error("Error fetching related plugins:", error);
    }
  }

  useEffect(() => {
    fetchPlugin();
  }, []);

  const handleAdd = () => {
    onAdd(plugin);
    setIsAdded(true);
  };

  const handleRemove = () => {
    onRemove(plugin.id);
    setIsAdded(false);
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#0a0b14] text-white">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onClose}
          className="bg-[#1a1b29] text-white border-[#2a2c3a] hover:bg-[#2a2c3a] hover:text-white flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Revenir à la liste
        </Button>
        
        {isAdded ? (
          <Button 
            variant="destructive" 
            onClick={handleRemove}
            className="bg-red-900 hover:bg-red-800 text-white"
          >
            Supprimer de l&apos;histoire
          </Button>
        ) : (
          <Button 
            onClick={handleAdd} 
            className="bg-blue-700 hover:bg-blue-600 text-white"
          >
            Ajouter à mon histoire
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className={cn(
            "h-48 bg-gradient-to-r relative rounded-xl flex items-center justify-center shadow-lg",
            getPluginGradient(plugin.type)
          )}>
            <span className="bg-black/30 backdrop-blur-sm p-4 text-6xl rounded-full w-28 h-28 flex items-center justify-center select-none shadow-inner">
              {plugin.emoji}
            </span>
          </div>

          <div className="flex flex-col gap-4 bg-[#121320] p-6 rounded-xl shadow-md">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{plugin.title}</h1>
                <div className="flex items-center gap-2">
                  {plugin.rating && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" />
                      <span>{plugin.rating}/5</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 text-red-400 mr-1" fill="currentColor" />
                    <span>{plugin._count?.likes || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-[#1a1b29] text-white border-[#2a2c3a]">
                  {plugin.type}
                </Badge>

                <Badge variant="outline" className={cn({
                  "bg-green-800 border-green-700 text-green-100": plugin.pricing === "FREE",
                  "bg-yellow-800 border-yellow-700 text-yellow-100": plugin.pricing === "PAID",
                  "bg-blue-800 border-blue-700 text-blue-100": plugin.pricing === "CREDITS"
                })}>
                  {plugin.pricing === "FREE" && (
                    <span className="text-sm">Gratuit ({plugin.usage} crédit par utilisation)</span>
                  )}
                  {
                    plugin.pricing === "PAID" || plugin.pricing === "CREDITS" ? (
                      <span className="flex flex-row items-center">
                        <span className="text-sm">{plugin.price ?? 0}</span>
                        {plugin.pricing === "PAID" && <span className="text-sm ml-0.5">€</span>}
                        {plugin.pricing === "CREDITS" && <span className="text-sm ml-0.5">Crédits</span>}
                      </span>
                    ) : null
                  }
                </Badge>
                
                {plugin.isFeatured && (
                  <Badge className="bg-purple-700 text-white">Mis en avant</Badge>
                )}
                
                {plugin.isOfficial && (
                  <Badge className="bg-blue-700 text-white">Officiel</Badge>
                )}
              </div>
            </div>

            <p className="text-gray-300 text-base leading-relaxed">{plugin.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Eye size={14} />
                <span>{plugin.views || 0} vues</span>
              </div>
              <div className="flex items-center gap-1">
                <Download size={14} />
                <span>{plugin.downloads || 0} utilisations</span>
              </div>
              <div className="flex items-center gap-1">
                <User size={14} />
                <span>Créé par {plugin.author?.display_name || "Auteur inconnu"}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="bg-[#121320] p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full overflow-hidden">
                <img 
                  src={plugin.author?.image_url || "/api/placeholder/40/40"} 
                  alt={plugin.author?.display_name || "Auteur"} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{plugin.author?.display_name || "Auteur inconnu"}</h3>
                <p className="text-xs text-gray-400">Créateur</p>
              </div>
            </div>
            <div className="text-sm text-gray-300 space-y-2">
              <div className="flex justify-between">
                <span>Date de création:</span>
                <span>{dayJS(plugin.createdAt).format("DD/MM/YYYY")}</span>
              </div>
              <div className="flex justify-between">
                <span>Dernière mise à jour:</span>
                <span>{dayJS(plugin.updatedAt).format("DD/MM/YYYY")}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span>{plugin.type}</span>
              </div>
              <div className="flex justify-between">
                <span>ID:</span>
                <span className="text-xs">{plugin.id.substring(0, 10)}...</span>
              </div>
            </div>

            <Button
              variant="outline"
              className={cn(
                "mt-4 w-full bg-[#1a1b29] text-white border-[#2a2c3a] hover:bg-[#2a2c3a] hover:text-white flex items-center gap-2", 
                isLiked ? "bg-red-900 hover:bg-red-800 border-red-700" : ""
              )}
              onClick={async () => {
                const { liked, success } = await likePlugin(plugin.id);
                if (success) {
                  setIsLiked(liked ? true : false);
                } else {
                  alert("Une erreur est survenue lors de l'ajout aux favoris.");
                }
              }}

            >
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
              {isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
            </Button>
          </div>
          
          {plugin.tags && plugin.tags.length > 0 && (
            <div className="bg-[#121320] p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Tag size={16} />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {plugin.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-[#1a1b29] text-white border-[#2a2c3a]">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {relatedPlugins && relatedPlugins.length > 0 && (
            <div className="bg-[#121320] p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-bold mb-4">Plugins similaires</h3>
              <div className="space-y-3">
                {relatedPlugins.map((related, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1a1b29] transition-colors">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      getPluginGradient(related.type)
                    )}>
                      <span className="text-lg">{related.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{related.title}</h4>
                      <p className="text-xs text-gray-400 truncate">{related.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
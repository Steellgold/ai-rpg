"use client";

import { fetchRelatedPlugins, RelatedPlugin } from "@/lib/actions/plugin";
import { UIPlugin } from "@/lib/actions/plugin-search";
import { Component } from "@/lib/types/component";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { getPluginGradient } from "@/lib/plugin-gradients";
import { Badge } from "../ui/badge";

type PluginViewProps = {
  plugin: UIPlugin;
  onAdd: (plugin: UIPlugin) => void;
  onRemove: (pluginId: string) => void;
  onView?: (plugin: UIPlugin) => void;
  onClose?: () => void;
};

export const PluginView: Component<PluginViewProps> = ({ plugin, onAdd, onRemove, onView, onClose }) => {
  const [relatedPlugins, setRelatedPlugins] = useState<RelatedPlugin[]>([]);

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

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#0a0b14] text-white">
      <div className="bg-[#0a0b14]">
        <Button
          variant="outline"
          onClick={onClose}
          className="bg-[#1a1b29] text-white border-[#2a2c3a] hover:bg-[#2a2c3a] hover:text-white"
        >
          Revenir à la liste
        </Button>
      </div>

      <div className="flex flex-row gap-4">
        <div className="flex flex-col gap-4 w-2/3">
          <div className={cn(
            "h-32 bg-gradient-to-r relative rounded-lg flex items-center justify-center",
            getPluginGradient(plugin.type)
          )}>
            <span className="bg-black/10 p-4 text-4xl rounded-full w-20 h-20 flex items-center justify-center select-none">
              {plugin.emoji}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">{plugin.title}</h1>
            <p className="text-gray-400 text-sm">{plugin.description}</p>

            <div className="flex flex-row items-center gap-2">
              <Badge variant="outline" className="bg-[#1a1b29] text-white border-[#2a2c3a]">
                {plugin.type}
              </Badge>

              <Badge variant="outline" className={cn({
                "bg-green-800 border-green-700": plugin.pricing === "FREE",
                "bg-yellow-800 border-yellow-700": plugin.pricing === "PAID",
                "bg-blue-800 border-blue-700": plugin.pricing === "CREDITS"
              })}>
                {/* FREE: Is usage by use */}
                {plugin.pricing === "FREE" && (
                  <span className="text-sm">Free ({plugin.usage} credit per uses)</span>
                )}
                {/* one-time payment for CREDITS or PAID */}
                {
                  plugin.pricing === "PAID" || plugin.pricing === "CREDITS" ? (
                    <span className="flex flex-row items-center">
                      <span className="text-sm">{plugin.price ?? 0}</span>
                      {plugin.pricing === "PAID" && <span className="text-sm ml-0.5">$</span>}
                      {plugin.pricing === "CREDITS" && <span className="text-sm ml-0.5">Credits</span>}
                    </span>
                  ) : null
                }
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
import { PluginType as DBPluginType } from "@imagine/database/prisma-client";
import { PluginType as UIPluginType } from "@imagine/types/plugin";

type PluginType = UIPluginType | DBPluginType | string;

export const getPluginGradient = (type: PluginType): string => {
  const gradients: Record<PluginType, string> = {
    NARRATIVE: "from-indigo-600 via-purple-500 to-blue-700",
    INTRIGUE: "from-red-600 via-pink-500 to-rose-600",
    CHARACTER: "from-blue-500 via-sky-400 to-cyan-500",
    WORLD: "from-emerald-500 via-green-600 to-teal-700",
    OBJECT: "from-yellow-500 via-amber-500 to-orange-600",
    THEME: "from-violet-600 via-purple-600 to-indigo-500",
    STYLE: "from-fuchsia-500 via-pink-600 to-rose-500",
    MECHANICS: "from-purple-500 via-indigo-500 to-blue-600"
  }
  
  return gradients[type] || "from-blue-500 to-purple-600"
}

export const getAlternativeGradient = (type: PluginType): string => {
  const alternativeGradients: Record<PluginType, string[]> = {
    NARRATIVE: [
      "from-violet-600 via-indigo-600 to-blue-600",
      "from-blue-600 via-indigo-600 to-purple-600",
      "from-purple-800 via-violet-700 to-indigo-600"
    ],

    INTRIGUE: [
      "from-red-700 via-rose-600 to-pink-500",
      "from-pink-600 via-red-600 to-rose-600",
      "from-rose-700 via-pink-600 to-red-500"
    ],

    CHARACTER: [
      "from-cyan-600 via-sky-500 to-blue-500",
      "from-blue-600 via-cyan-500 to-teal-500",
      "from-sky-600 via-blue-500 to-indigo-500"
    ],

    WORLD: [
      "from-teal-600 via-emerald-500 to-green-600",
      "from-green-700 via-teal-600 to-emerald-500",
      "from-emerald-700 via-green-600 to-lime-500"
    ],

    OBJECT: [
      "from-orange-600 via-amber-500 to-yellow-500",
      "from-amber-700 via-orange-600 to-red-500",
      "from-yellow-600 via-amber-600 to-orange-500"
    ],

    THEME: [
      "from-indigo-700 via-violet-600 to-purple-600",
      "from-purple-800 via-indigo-600 to-violet-500",
      "from-violet-900 via-purple-700 to-fuchsia-600"
    ],

    STYLE: [
      "from-rose-600 via-fuchsia-500 to-pink-600",
      "from-pink-700 via-rose-600 to-red-500",
      "from-fuchsia-700 via-pink-600 to-rose-500"
    ],

    MECHANICS: [
      "from-gray-700 via-slate-600 to-zinc-600",
      "from-slate-800 via-gray-700 to-neutral-600",
      "from-zinc-700 via-slate-600 to-gray-700"
    ]
  }
  
  const alternatives = alternativeGradients[type] || ["from-blue-500 to-purple-600"]
  const randomIndex = Math.floor(Math.random() * alternatives.length)
  
  return alternatives[randomIndex]
}

export const getFeaturedGradient = (type: PluginType): string => {
  const featuredGradients: Record<PluginType, string> = {
    NARRATIVE: "from-violet-500 via-purple-400 to-indigo-500 bg-gradient-to-r",
    INTRIGUE: "from-red-500 via-rose-400 to-pink-500 bg-gradient-to-r",
    CHARACTER: "from-sky-400 via-blue-500 to-indigo-500 bg-gradient-to-r",
    WORLD: "from-emerald-400 via-green-500 to-lime-500 bg-gradient-to-r",
    OBJECT: "from-amber-400 via-yellow-400 to-orange-500 bg-gradient-to-r",
    THEME: "from-violet-500 via-purple-400 to-fuchsia-500 bg-gradient-to-r",
    STYLE: "from-pink-400 via-rose-400 to-fuchsia-500 bg-gradient-to-r",
    MECHANICS: "from-slate-500 via-gray-400 to-blue-gray-500 bg-gradient-to-r"
  }
  
  return featuredGradients[type] || "from-indigo-500 via-purple-400 to-pink-500 bg-gradient-to-r"
}

export const getPricingGradient = (pricing: string): string => {
  const pricingGradients: Record<string, string> = {
    FREE: "from-green-600 via-emerald-500 to-teal-600",
    PREMIUM: "from-indigo-600 via-blue-500 to-sky-600",
    PAID: "from-amber-500 via-yellow-500 to-orange-500"
  }
  
  return pricingGradients[pricing] || "from-gray-600 via-slate-500 to-gray-700"
}
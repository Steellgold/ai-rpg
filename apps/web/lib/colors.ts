import { COLOR } from "@/types/color"
import { cn } from "@workspace/ui/lib/utils"

const colorMap = {
  red: "red",
  orange: "orange",
  amber: "amber",
  yellow: "yellow",
  lime: "lime",
  green: "green",
  emerald: "emerald",
  teal: "teal",
  cyan: "cyan",
  sky: "sky",
  blue: "blue",
  indigo: "indigo",
  violet: "violet",
  purple: "purple",
  fuchsia: "fuchsia",
  pink: "pink",
  rose: "rose",
  slate: "slate",
  gray: "gray",
  zinc: "zinc",
  neutral: "neutral",
  stone: "stone"
} as const

export const getColorClasses = (color: COLOR, variant: "bg" | "text" | "border" = "bg") => {
  const colorName = colorMap[color]
  const opacity = variant === "bg" ? "/10" : variant === "border" ? "/30" : ""
  
  return `${variant}-${colorName}-500${opacity}`
}

export const getColorStyles = (color: COLOR) => {
  return {
    container: cn(
      "p-4",
      getColorClasses(color, "bg"),
      getColorClasses(color, "border"),
      getColorClasses(color, "text")
    ),
    icon: cn(getColorClasses(color, "text")),
    text: cn(getColorClasses(color, "text").replace("400", "300")),
    badge: cn(
      getColorClasses(color, "bg").replace("/10", "/20"),
      getColorClasses(color, "text"),
      getColorClasses(color, "border")
    )
  }
}

export const getFeatureIconStyles = (color: COLOR) => {
  return cn(
    "p-2 rounded-lg border",
    getColorClasses(color, "text"),
    getColorClasses(color, "bg").replace("/10", "/20"),
    getColorClasses(color, "border")
  )
}

export const getFeatureButtonStyles = (color: COLOR, active: boolean) => {
  if (!active) return ""
  
  return cn(
    "bg-gradient-to-br from-transparent to-opacity-10 shadow-sm",
    getColorClasses(color, "bg"),
    `hover:${getColorClasses(color, "bg").replace("500", "400")}`
  )
}

export const getFeatureIconColor = (color: COLOR, active: boolean) => {
  if (!active) return "";
  return `text-${color}-300`;
} 
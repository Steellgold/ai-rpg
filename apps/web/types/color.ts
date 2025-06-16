export type COLOR =
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose"
  | "slate"
  | "gray"
  | "zinc"
  | "neutral"
  | "stone";

export const ShineColors: Record<COLOR, string[]> = {
  red: ["#ef4444", "#f87171", "#dc2626"],
  orange: ["#f97316", "#fb923c", "#f59e0b"],
  amber: ["#eab308", "#f59e0b", "#d97706"],
  yellow: ["#eab308", "#f59e0b", "#d97706"],
  lime: ["#84cc16", "#a3e635", "#84cc16"],
  green: ["#10b981", "#22c55e", "#16a34a"],
  emerald: ["#10b981", "#22c55e", "#16a34a"],
  teal: ["#10b981", "#22c55e", "#16a34a"],
  cyan: ["#06b6d4", "#2dd4bf", "#0e7490"],
  sky: ["#0ea5e9", "#3b82f6", "#2563eb"],
  blue: ["#3b82f6", "#60a5fa", "#2563eb"],
  indigo: ["#6366f1", "#818cf8", "#4f46e5"],
  violet: ["#8b5cf6", "#a855f7", "#86198f"],
  purple: ["#a855f7", "#c084fc", "#86198f"],
  fuchsia: ["#d946ef", "#f472b6", "#86198f"],
  pink: ["#f472b6", "#f9a8d4", "#86198f"],
  rose: ["#f472b6", "#f9a8d4", "#86198f"],
  slate: ["#64748b", "#94a3b8", "#475569"],
  gray: ["#64748b", "#94a3b8", "#475569"],
  zinc: ["#64748b", "#94a3b8", "#475569"],
  neutral: ["#64748b", "#94a3b8", "#475569"],
  stone: ["#64748b", "#94a3b8", "#475569"],
}
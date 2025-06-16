import { COLOR } from "@/types/color";

type ColorClassMap = {
  container: string;
  iconContainer: string;
  icon: string;
  text: string;
  badge: string;
  button: string;
}

export const colorClassMap: Record<COLOR, ColorClassMap> = {
  red: {
    container: "bg-red-500/10 border-red-500/30 text-red-300",
    iconContainer: "p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300",
    icon: "text-red-300",
    text: "text-red-300",
    badge: "bg-red-500/20 text-red-500 border-red-500/30",
    button: "bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30"
  },
  orange: {
    container: "bg-orange-500/10 border-orange-500/30 text-orange-300",
    iconContainer: "p-2 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-300",
    icon: "text-orange-300",
    text: "text-orange-300",
    badge: "bg-orange-500/20 text-orange-500 border-orange-500/30",
    button: "bg-orange-500/20 text-orange-500 border-orange-500/30 hover:bg-orange-500/30"
  },
  amber: {  
    container: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    iconContainer: "p-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300",
    icon: "text-amber-300",
    text: "text-amber-300",
    badge: "bg-amber-500/20 text-amber-500 border-amber-500/30",
    button: "bg-amber-500/20 text-amber-500 border-amber-500/30 hover:bg-amber-500/30"
  },
  yellow: {
    container: "bg-yellow-500/10 border-yellow-500/30 text-yellow-300",
    iconContainer: "p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-300",
    icon: "text-yellow-300",
    text: "text-yellow-300",
    badge: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    button: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/30"
  },
  lime: {
    container: "bg-lime-500/10 border-lime-500/30 text-lime-300",
    iconContainer: "p-2 rounded-lg bg-lime-500/20 border border-lime-500/30 text-lime-300",
    icon: "text-lime-300",
    text: "text-lime-300",
    badge: "bg-lime-500/20 text-lime-500 border-lime-500/30",
    button: "bg-lime-500/20 text-lime-500 border-lime-500/30 hover:bg-lime-500/30"
  },
  green: {
    container: "bg-green-500/10 border-green-500/30 text-green-300",
    iconContainer: "p-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300",
    icon: "text-green-300",
    text: "text-green-300",
    badge: "bg-green-500/20 text-green-500 border-green-500/30",
    button: "bg-green-500/20 text-green-500 border-green-500/30 hover:bg-green-500/30"
  },
  emerald: {
    container: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    iconContainer: "p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300",
    icon: "text-emerald-300",
    text: "text-emerald-300",
    badge: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
    button: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/30"
  },
  teal: {
    container: "bg-teal-500/10 border-teal-500/30 text-teal-300",
    iconContainer: "p-2 rounded-lg bg-teal-500/20 border border-teal-500/30 text-teal-300",
    icon: "text-teal-300",
    text: "text-teal-300",
    badge: "bg-teal-500/20 text-teal-500 border-teal-500/30",
    button: "bg-teal-500/20 text-teal-500 border-teal-500/30 hover:bg-teal-500/30"
  },
  cyan: {
    container: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
    iconContainer: "p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300",
    icon: "text-cyan-300",
    text: "text-cyan-300",
    badge: "bg-cyan-500/20 text-cyan-500 border-cyan-500/30",
    button: "bg-cyan-500/20 text-cyan-500 border-cyan-500/30 hover:bg-cyan-500/30"
  },
  sky: {
    container: "bg-sky-500/10 border-sky-500/30 text-sky-300",
    iconContainer: "p-2 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-300",
    icon: "text-sky-300",
    text: "text-sky-300",
    badge: "bg-sky-500/20 text-sky-500 border-sky-500/30",
    button: "bg-sky-500/20 text-sky-500 border-sky-500/30 hover:bg-sky-500/30"
  },
  blue: {
    container: "bg-blue-500/10 border-blue-500/30 text-blue-300",
    iconContainer: "p-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300",
    icon: "text-blue-300",
    text: "text-blue-300",
    badge: "bg-blue-500/20 text-blue-500 border-blue-500/30",
    button: "bg-blue-500/20 text-blue-500 border-blue-500/30 hover:bg-blue-500/30"
  },
  indigo: {
    container: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
    iconContainer: "p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300",
    icon: "text-indigo-300",
    text: "text-indigo-300",
    badge: "bg-indigo-500/20 text-indigo-500 border-indigo-500/30",
    button: "bg-indigo-500/20 text-indigo-500 border-indigo-500/30 hover:bg-indigo-500/30"
  },
  violet: {
    container: "bg-violet-500/10 border-violet-500/30 text-violet-300",
    iconContainer: "p-2 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300",
    icon: "text-violet-300",
    text: "text-violet-300",
    badge: "bg-violet-500/20 text-violet-500 border-violet-500/30",
    button: "bg-violet-500/20 text-violet-500 border-violet-500/30 hover:bg-violet-500/30"
  },
  purple: {
    container: "bg-purple-500/10 border-purple-500/30 text-purple-300",
    iconContainer: "p-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300",
    icon: "text-purple-300",
    text: "text-purple-300",
    badge: "bg-purple-500/20 text-purple-500 border-purple-500/30",
    button: "bg-purple-500/20 text-purple-500 border-purple-500/30 hover:bg-purple-500/30"
  },
  fuchsia: {
    container: "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-300",
    iconContainer: "p-2 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300",
    icon: "text-fuchsia-300",
    text: "text-fuchsia-300",
    badge: "bg-fuchsia-500/20 text-fuchsia-500 border-fuchsia-500/30",
    button: "bg-fuchsia-500/20 text-fuchsia-500 border-fuchsia-500/30 hover:bg-fuchsia-500/30"
  },
  pink: {
    container: "bg-pink-500/10 border-pink-500/30 text-pink-300",
    iconContainer: "p-2 rounded-lg bg-pink-500/20 border border-pink-500/30 text-pink-300",
    icon: "text-pink-300",
    text: "text-pink-300",
    badge: "bg-pink-500/20 text-pink-500 border-pink-500/30",
    button: "bg-pink-500/20 text-pink-500 border-pink-500/30 hover:bg-pink-500/30"
  },
  rose: {
    container: "bg-rose-500/10 border-rose-500/30 text-rose-300",
    iconContainer: "p-2 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300",
    icon: "text-rose-300",
    text: "text-rose-300",
    badge: "bg-rose-500/20 text-rose-500 border-rose-500/30",
    button: "bg-rose-500/20 text-rose-500 border-rose-500/30 hover:bg-rose-500/30"
  },
  slate: {
    container: "bg-slate-500/10 border-slate-500/30 text-slate-300",
    iconContainer: "p-2 rounded-lg bg-slate-500/20 border border-slate-500/30 text-slate-300",
    icon: "text-slate-300",
    text: "text-slate-300",
    badge: "bg-slate-500/20 text-slate-500 border-slate-500/30",
    button: "bg-slate-500/20 text-slate-500 border-slate-500/30 hover:bg-slate-500/30"
  },
  gray: {
    container: "bg-gray-500/10 border-gray-500/30 text-gray-300",
    iconContainer: "p-2 rounded-lg bg-gray-500/20 border border-gray-500/30 text-gray-300",
    icon: "text-gray-300",
    text: "text-gray-300",
    badge: "bg-gray-500/20 text-gray-500 border-gray-500/30",
    button: "bg-gray-500/20 text-gray-500 border-gray-500/30 hover:bg-gray-500/30"
  },
  zinc: {
    container: "bg-zinc-500/10 border-zinc-500/30 text-zinc-300",
    iconContainer: "p-2 rounded-lg bg-zinc-500/20 border border-zinc-500/30 text-zinc-300",
    icon: "text-zinc-300",
    text: "text-zinc-300",
    badge: "bg-zinc-500/20 text-zinc-500 border-zinc-500/30",
    button: "bg-zinc-500/20 text-zinc-500 border-zinc-500/30 hover:bg-zinc-500/30"
  },
  neutral: {
    container: "bg-neutral-500/10 border-neutral-500/30 text-neutral-300",
    iconContainer: "p-2 rounded-lg bg-neutral-500/20 border border-neutral-500/30 text-neutral-300",
    icon: "text-neutral-300",
    text: "text-neutral-300",
    badge: "bg-neutral-500/20 text-neutral-500 border-neutral-500/30",
    button: "bg-neutral-500/20 text-neutral-500 border-neutral-500/30 hover:bg-neutral-500/30"
  },
  stone: {
    container: "bg-stone-500/10 border-stone-500/30 text-stone-300",
    iconContainer: "p-2 rounded-lg bg-stone-500/20 border border-stone-500/30 text-stone-300",
    icon: "text-stone-300",
    text: "text-stone-300",
    badge: "bg-stone-500/20 text-stone-500 border-stone-500/30",
    button: "bg-stone-500/20 text-stone-500 border-stone-500/30 hover:bg-stone-500/30"
  }
} as const; 
"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { Component } from "@/lib/types"
import type { ThemeProviderProps } from "next-themes"

export const ThemeProvider: Component<ThemeProviderProps> = ({ children, ...props }) => {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
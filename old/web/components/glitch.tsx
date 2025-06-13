import type { Component } from "@/lib/types"
import { Rubik_Glitch } from "next/font/google"
import type { PropsWithChildren } from "react"

const rubikGlitch = Rubik_Glitch({ weight: "400", subsets: ["latin"] });

export const Glitch: Component<PropsWithChildren> = ({ children }) => {
  return (
    <span className={`${rubikGlitch.className}`}>
      {children}
    </span>
  )
}
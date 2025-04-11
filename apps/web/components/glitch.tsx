import { Component } from "@/lib/types"
import { Geist, Geist_Mono, Rubik_Glitch } from "next/font/google"
import { PropsWithChildren } from "react"

const rubikGlitch = Rubik_Glitch({ weight: "400", subsets: ["latin"] });

export const Glitch: Component<PropsWithChildren> = ({ children }) => {
  return (
    <span className={`${rubikGlitch.className}`}>
      {children}
    </span>
  )
}

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", weight: ["100" , "200", "300", "400", "500", "600", "700", "800", "900"] });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", weight: ["100" , "200", "300", "400", "500", "600", "700", "800", "900"] });

export const GeistHackBecauseWTFWhyNewTimesRomanAlwaysAppear: Component<PropsWithChildren> = ({ children }) => {
  return (
    <div className={`${geistSans.className} ${geistMono.variable} font-sans antialiased`}>
      {children}
    </div>
  )
}
import "@workspace/ui/globals.css"

import { metadata as defaultMetadata } from "@/lib/metadata"
import { Geist, Geist_Mono } from "next/font/google"
import { Providers } from "@/components/providers"
import { AsyncComponent } from "@/lib/component"
import { PropsWithChildren } from "react"
import { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { Toaster } from "@workspace/ui/components/sonner"
import { Navbar } from "@/components/navigation/navbar"

const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"],variable: "--font-mono" })

export const metadata: Metadata = { ...defaultMetadata };

const RootLayout: AsyncComponent<PropsWithChildren> = async({ children }) => {
  const locale = await getLocale();

  return (
    <html lang={locale} style={{ scrollBehavior: "smooth"}} suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased bg-background text-foreground`}>
        <Providers>
          <Navbar />
          <Toaster richColors closeButton />
          {children}
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
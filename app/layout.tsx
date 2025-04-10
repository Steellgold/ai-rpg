import { ThemeProvider } from "@/components/theme/theme-provider";
import { PropsWithChildren } from "react";
import { AsyncComponent } from "@/lib/types";
import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/naviguation/footer";
import { Navbar } from "@/components/naviguation/navbar";
import { Geist, Geist_Mono } from "next/font/google"


// const geistSans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-geist-sans", weight: "100 900" });
// const geistMono = localFont({ src: "./fonts/GeistMonoVF.woff", variable: "--font-geist-mono", weight: "100 900" });
const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", weight: ["100" , "900"] });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", weight: ["100" , "900"] });

export const metadata: Metadata = { 
  title: "Chronicles of Destiny", 
  description: "Interactive AI-powered storytelling platform for immersive adventures." 
};

const RootLayout: AsyncComponent<PropsWithChildren> = async({ children }) => {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} style={{ scrollBehavior: "smooth" }} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider messages={messages}>
            <Navbar />

            {children}

            <Toaster />
            <Footer />
          </NextIntlClientProvider>          
        </ThemeProvider>
      </body>
    </html>
  );
}

export default RootLayout;
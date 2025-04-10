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
import { GeistHackBecauseWTFWhyNewTimesRomanAlwaysAppear } from "@/components/glitch";

export const metadata: Metadata = { 
  title: "Imagine | AI-powered Interactive Storytelling",
  description: "Dive into immersive adventures where your choices shape the narrative with our interactive storytelling platform.",
  metadataBase: new URL("https://image.place"),
  openGraph: {
    title: "Imagine | AI-powered Interactive Storytelling",
    description: "Dive into immersive adventures where your choices shape the narrative with our interactive storytelling platform.",
    url: "https://image.place",
    siteName: "Imagine",
    images: [
      { url: "/og-image.jpg", width: 1200, height: 630 },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Imagine | AI-powered Interactive Storytelling",
    description: "Dive into immersive adventures where your choices shape the narrative with our interactive storytelling platform.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/site.webmanifest",
  keywords: ["interactive story", "adventure", "storytelling", "AI", "text", "role-playing", "choices", "fiction"],
  authors: [
    { name: "Gaëtan Huszovits" }
  ],
  creator: "Imagine Team",
  publisher: "image.place",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

const RootLayout: AsyncComponent<PropsWithChildren> = async({ children }) => {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} style={{ scrollBehavior: "smooth" }} suppressHydrationWarning>
      <body className={`antialiased min-h-screen flex flex-col`}>
        <GeistHackBecauseWTFWhyNewTimesRomanAlwaysAppear>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <NextIntlClientProvider messages={messages}>
              <Navbar />

              {children}

              <Toaster />
              <Footer />
            </NextIntlClientProvider>          
          </ThemeProvider>
        </GeistHackBecauseWTFWhyNewTimesRomanAlwaysAppear>
      </body>
    </html>
  );
}

export default RootLayout;
import { Geist, Geist_Mono } from "next/font/google";
import { AsyncComponent } from "@/lib/types/component";
import { PropsWithChildren } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = { 
  title: "Imagine | AI-powered Interactive Storytelling",
  description: "Dive into immersive adventures where your choices shape the narrative with our interactive storytelling platform.",
  metadataBase: new URL("https://imagine.place"),
  openGraph: {
    title: "Imagine | AI-powered Interactive Storytelling",
    description: "Dive into immersive adventures where your choices shape the narrative with our interactive storytelling platform.",
    url: "https://imagine.place",
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
  publisher: "imagine.place",
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
    <html lang={locale} style={{ scrollBehavior: "smooth"}} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export default RootLayout;
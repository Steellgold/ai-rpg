import { Geist, Geist_Mono } from "next/font/google";
import { AsyncComponent } from "@/lib/types/component";
import { PropsWithChildren } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { metadata as defaultMetadata } from "@/components/metadata";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = { ...defaultMetadata };

const RootLayout: AsyncComponent<PropsWithChildren> = async({ children }) => {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} style={{ scrollBehavior: "smooth"}} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-[#eaeaea]`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export default RootLayout;
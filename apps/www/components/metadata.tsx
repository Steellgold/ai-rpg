import { Metadata } from "next";

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
      { url: "/og-image.png", width: 1200, height: 630 },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Imagine | AI-powered Interactive Storytelling",
    description: "Dive into immersive adventures where your choices shape the narrative with our interactive storytelling platform.",
    images: ["/og-image.png"],
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
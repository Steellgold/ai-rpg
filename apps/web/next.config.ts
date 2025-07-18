import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin(
  "./lib/i18n/request.ts"
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "lgbrmzxeblvailzgebur.supabase.co", protocol: "https" },
      { hostname: "cdn.discordapp.com", protocol: "https" }
    ]
  },
  experimental: {
    authInterrupts: true
  },
  transpilePackages: ["@workspace/ui"]
};

export default withNextIntl(nextConfig);
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Media in /public keeps its filename when replaced, so no "immutable" — 30 days is a safe middle ground.
        // /_next/static (hashed) is already cached immutably by Next/Vercel; PDFs stay revalidated since they get overwritten.
        source: "/:all*(webp|jpg|jpeg|png|svg|ico|mp4)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;

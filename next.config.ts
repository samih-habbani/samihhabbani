import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit reads its standard-font .afm files from disk next to its own code;
  // bundling it breaks that lookup and PDF text comes out blank.
  serverExternalPackages: ["@react-pdf/renderer", "pdfkit"],
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

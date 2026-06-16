import type { NextConfig } from "next";

const traceExcludes = {
  "*": [
    ".git/**",
    ".next/cache/**",
    "exports/**",
    "docs/assets-source/**",
    "**/*.zip",
    "node_modules/@swc/**"
  ]
};

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }]
  },
  outputFileTracingExcludes: traceExcludes,
  /** Bundle premium worksheet PDFs + logo assets into the worksheet API lambda on Vercel. */
  outputFileTracingIncludes: {
    "/api/lessons/[lessonId]/worksheet/route": [
      "./content/worksheets/**/*",
      "./public/assets/fitdog-academy/logos/**/*"
    ]
  }
};

export default nextConfig;

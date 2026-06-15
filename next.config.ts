import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }]
  },
  /** Bundle premium worksheet PDFs + logo assets into the worksheet API lambda on Vercel. */
  outputFileTracingIncludes: {
    "/api/lessons/[lessonId]/worksheet": [
      "./content/worksheets/**/*",
      "./public/assets/fitdog-academy/logos/**/*"
    ]
  }
};

export default nextConfig;

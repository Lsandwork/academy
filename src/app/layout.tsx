import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { fitdogAcademyAssets } from "@/assets/fitdogAcademyAssets";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fitdog Academy | Online Dog Training for Real Life",
  description: "Practical skills. Happier dogs. Stronger bonds. Proven results.",
  icons: {
    icon: [
      { url: fitdogAcademyAssets.appIcons.favicon16, sizes: "16x16", type: "image/png" },
      { url: fitdogAcademyAssets.appIcons.favicon32, sizes: "32x32", type: "image/png" }
    ],
    apple: fitdogAcademyAssets.appIcons.appIcon180
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

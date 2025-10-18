import "./globals.css";
import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import clsx from "clsx";
import { ReactNode } from "react";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const noto = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-noto" });

export const metadata: Metadata = {
  title: process.env.APP_TITLE ?? "NovaChat",
  description: "Chat with gpt-5-mini in a delightful interface",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className="bg-white">
      <body
        className={clsx(
          "min-h-screen bg-white text-gray-800",
          inter.variable,
          noto.variable,
          "font-sans"
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { MotionRoot } from "@/components/motion";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Bundled locally (Fontshare, ITF Free Font License; see app/fonts/README.md).
const bespoke = localFont({
  variable: "--font-bespoke",
  display: "swap",
  src: [
    { path: "./fonts/BespokeSerif-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/BespokeSerif-Medium.woff2", weight: "500", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "VentureSauce",
  description:
    "A deal inbox for investors: every claim in decks, emails and call notes checked against SEC filings, LinkedIn, press and your other sources.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bespoke.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Reduced motion applies to every page (panel, /report, /panel/states), not just the panel frame. */}
        <MotionRoot>{children}</MotionRoot>
      </body>
    </html>
  );
}

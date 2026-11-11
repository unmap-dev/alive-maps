import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const figtree = Figtree({ subsets: ["latin", "latin-ext"], variable: "--font-figtree" });

export const metadata: Metadata = {
  title: "Alive Maps · Unmap app",
  description:
    "Walking directions that trade a minute for a nicer walk: the fastest walk and livelier detours past parks, the river, streets away from traffic, cafés and public art, built with Unmap and the Unmap component registry. Map data © OpenStreetMap contributors (ODbL).",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={figtree.variable}>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

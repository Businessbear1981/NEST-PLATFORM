import type { Metadata } from "next";
import { Cormorant_Garamond, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Providers from "@/components/Providers";

const display = Cormorant_Garamond({ subsets:["latin"], weight:["300","400","500","600","700"], variable:"--font-display" });
const body    = Space_Grotesk    ({ subsets:["latin"], variable:"--font-body" });
const mono    = IBM_Plex_Mono    ({ subsets:["latin"], weight:["400","500"],   variable:"--font-mono" });

export const metadata: Metadata = {
  title: "NEST Platform",
  description: "Private Bond Structuring · PE Fund · M&A Intelligence · Capital Markets",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="bg-black text-[#EDE8DC] font-body antialiased">
        <Providers>
          <Sidebar />
          <main className="ml-64 min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
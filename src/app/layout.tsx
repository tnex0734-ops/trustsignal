import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SiteFooter } from "@/components/app-shell/SiteFooter";
import { SiteHeader } from "@/components/app-shell/SiteHeader";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TrustSignal — Stop. Check. Stay Safe.",
  description:
    "Privacy-first defensive safety assistant that helps people check suspicious links, scam messages, and password strength locally before they act.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const nonce = headerStore.get("x-nonce") ?? undefined;

  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body
        className="flex min-h-screen flex-col antialiased"
        data-csp-nonce={nonce ? "active" : "none"}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}

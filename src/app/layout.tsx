import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  IBM_Plex_Mono,
  Manrope,
} from "next/font/google";

import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const metadataBase = process.env.NEXT_PUBLIC_APP_URL
  ? new URL(process.env.NEXT_PUBLIC_APP_URL)
  : undefined;

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Atelier",
    template: "%s | Atelier",
  },
  description:
    "Premium private client galleries for photographers, with secure originals, direct uploads, and clear storage-led pricing.",
  applicationName: "Atelier",
  keywords: [
    "photographer client gallery",
    "private photo delivery",
    "secure photo downloads",
    "photography SaaS",
  ],
  openGraph: {
    title: "Atelier",
    description:
      "Premium private client galleries for photographers, with secure originals and direct browser uploads.",
    type: "website",
    images: [
      {
        url: "/atelier-og.svg",
        width: 1200,
        height: 630,
        alt: "Atelier premium client gallery platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atelier",
    description:
      "Premium private client galleries for photographers, with secure originals and direct browser uploads.",
    images: ["/atelier-og.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

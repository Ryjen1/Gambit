import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gambit.vercel.app"),
  title: {
    default: "Gambit — Bet on anything. Just ask.",
    template: "%s · Gambit",
  },
  description:
    "The first AI prediction market assistant on Base. Chat to bet on football, crypto, and politics. Powered by Aomi + Limitless.",
  applicationName: "Gambit",
  keywords: [
    "Gambit", "prediction markets", "AI", "Limitless", "Base",
    "football", "World Cup", "crypto", "betting", "Aomi",
  ],
  openGraph: {
    type: "website",
    title: "Gambit — Bet on anything. Just ask.",
    description:
      "The first AI prediction market assistant on Base. Chat to bet on football, crypto, and politics.",
    siteName: "Gambit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gambit — Bet on anything. Just ask.",
    description:
      "The first AI prediction market assistant on Base.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

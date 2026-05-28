import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gambit — AI Sports Betting Agent on Base",
  description:
    "Custom Aomi SDK plugin that combines bookmaker odds with Limitless Exchange data. Bet on football by chatting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="noise">{children}</body>
    </html>
  );
}

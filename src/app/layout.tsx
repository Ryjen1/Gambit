import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://limitlessbot.vercel.app"),
  title: {
    default: "LimitlessBot — Bet on anything. Just ask.",
    template: "%s · LimitlessBot",
  },
  description:
    "The first AI prediction market assistant on Base. Chat to discover markets, analyze odds, and place bets on Limitless — no crypto expertise required.",
  applicationName: "LimitlessBot",
  keywords: [
    "LimitlessBot", "Limitless", "Base", "prediction markets", "AI",
    "betting", "World Cup", "crypto", "Aomi", "agentic",
  ],
  openGraph: {
    type: "website",
    title: "LimitlessBot — Bet on anything. Just ask.",
    description:
      "The first AI prediction market assistant on Base. Chat to discover markets, analyze odds, and place bets on Limitless.",
    siteName: "LimitlessBot",
  },
  twitter: {
    card: "summary_large_image",
    title: "LimitlessBot — Bet on anything. Just ask.",
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
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <div className="cursor-spotlight" id="cursor-spotlight" />
        <main className="relative flex flex-1 flex-col overflow-x-hidden">
          {children}
        </main>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('mousemove', function(e) {
                var el = document.getElementById('cursor-spotlight');
                if (el) {
                  el.style.setProperty('--x', e.clientX + 'px');
                  el.style.setProperty('--y', e.clientY + 'px');
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}

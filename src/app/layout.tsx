import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gambit — AI Prediction Market Assistant on Base",
  description:
    "Bet on football, crypto, and politics by chatting. Powered by Aomi + Limitless on Base.",
  openGraph: {
    title: "Gambit — AI Prediction Market Assistant on Base",
    description:
      "Bet on football, crypto, and politics by chatting. Powered by Aomi + Limitless on Base.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gambit — AI Prediction Market Assistant on Base",
    description:
      "Bet on football, crypto, and politics by chatting. Powered by Aomi + Limitless on Base.",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="noise grid-bg">{children}</body>
    </html>
  );
}

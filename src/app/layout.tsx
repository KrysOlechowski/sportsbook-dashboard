import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Live sportsbook dashboard",
  description:
    "Live sportsbook dashboard for real-time odds, markets, and match insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

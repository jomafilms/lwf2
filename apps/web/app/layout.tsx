import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FireScape",
  description:
    "Fire-safety-first garden ecosystem. See your fire zones, get compliant plant recommendations, find local nursery pricing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

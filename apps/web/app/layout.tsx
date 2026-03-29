import type { Metadata } from "next";
import { ClientProviders } from "@/components/ui/ClientProviders";
import { DemoRoleSelector } from "@/components/ui/DemoRoleSelector";
import "./globals.css";

export const metadata: Metadata = {
  title: "LWF",
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
      <body className="min-h-screen antialiased">
        <ClientProviders>
          {children}
          <DemoRoleSelector />
        </ClientProviders>
      </body>
    </html>
  );
}

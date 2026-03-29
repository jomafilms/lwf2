import { SiteNav } from "@/components/ui/SiteNav";

export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteNav />
      {children}
    </>
  );
}

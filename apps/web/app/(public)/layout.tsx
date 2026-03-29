import { Suspense } from 'react';
import { SiteNav } from '@/components/ui/SiteNav';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense>
        <SiteNav />
      </Suspense>
      {children}
    </>
  );
}

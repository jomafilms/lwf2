import { DashboardSidebar } from '@/components/ui/DashboardSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 lg:ml-0">
        {children}
      </main>
    </div>
  );
}
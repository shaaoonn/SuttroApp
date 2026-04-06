import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminHeader from '@/components/layout/AdminHeader';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <AdminSidebar adminName={admin.adminName} adminRole={admin.role} />
      <div className="flex-1 ml-64">
        <AdminHeader />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

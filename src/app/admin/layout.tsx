'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/supabase/auth-context';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import { Loader2 } from 'lucide-react';

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // If auth state resolved and not logged in and not on login page -> redirect
    if (!loading && !user && !isLoginPage) {
      router.replace('/admin/login');
    }
  }, [user, loading, isLoginPage, router]);

  // Login page has its own full-screen layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading indicator while determining authentication state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] flex flex-col items-center justify-center text-[#8E9BAE] gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#BBCCD7]" />
        <span className="text-xs">Verifying admin session...</span>
      </div>
    );
  }

  // If not authenticated, prevent flash of admin content while redirecting
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center text-[#8E9BAE]">
        <Loader2 className="w-5 h-5 animate-spin text-[#BBCCD7]" />
      </div>
    );
  }

  // Render authenticated admin workspace
  return (
    <div className="min-h-screen flex bg-[#0C0C0C] text-[#EDEDED]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminAuthGuard>{children}</AdminAuthGuard>
    </AuthProvider>
  );
}

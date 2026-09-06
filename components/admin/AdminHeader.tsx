'use client';

import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <header className="h-16 border-b border-white/10 bg-[#101010]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2 text-xs text-[#8E9BAE]">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>Admin Workspace</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-[#EDEDED] bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[#BBCCD7]">
            <User className="w-3 h-3" />
          </div>
          <span className="font-mono text-[11px] text-[#BBCCD7]">
            {user?.email || 'admin'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title="Sign Out"
          className="p-2 border border-white/10 rounded-full text-white/60 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

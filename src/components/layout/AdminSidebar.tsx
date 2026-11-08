'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  UserCheck,
  FolderGit2,
  Cpu,
  GraduationCap,
  Award,
  Mail,
  ExternalLink,
  LogOut,
  Loader2,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { useState } from 'react';

export const ADMIN_TABS = [
  { id: 'profile', name: 'Profile & Picture', icon: UserCheck },
  { id: 'education', name: 'Education', icon: GraduationCap },
  { id: 'skills', name: 'Skills', icon: Cpu },
  { id: 'certifications', name: 'Certifications', icon: Award },
  { id: 'projects', name: 'Projects', icon: FolderGit2 },
  { id: 'contact', name: 'Contact Info', icon: Mail },
] as const;

export type AdminTabId = (typeof ADMIN_TABS)[number]['id'];

export default function AdminSidebar() {
  const searchParams = useSearchParams();
  const currentTab = (searchParams.get('tab') as AdminTabId) || 'profile';
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
      setLoggingOut(false);
    }
  };

  return (
    <aside className="w-60 bg-[#121212] border-r border-white/10 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand */}
      <div className="p-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Shield className="w-4 h-4 text-[#BBCCD7]" />
        </div>
        <div className="overflow-hidden">
          <span className="font-bold text-sm text-white tracking-wide block">
            Admin Portal
          </span>
          <span className="text-[11px] text-[#8E9BAE] font-mono truncate block">
            {user?.email || 'Authenticated'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
        <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#8E9BAE]/60 block mb-2">
          Management
        </span>
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={`/admin/dashboard?tab=${tab.id}`}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#BBCCD7] text-[#0C0C0C] font-semibold shadow-sm'
                  : 'text-[#8E9BAE] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Quick Actions */}
      <div className="p-3.5 border-t border-white/10 space-y-1.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs text-[#8E9BAE] hover:text-white hover:bg-white/5 rounded-xl transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </span>
        </Link>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl w-full disabled:opacity-50 transition-colors cursor-pointer"
        >
          {loggingOut ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          <span>{loggingOut ? 'Signing Out...' : 'Sign Out'}</span>
        </button>
      </div>
    </aside>
  );
}

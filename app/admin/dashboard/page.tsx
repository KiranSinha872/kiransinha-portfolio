'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ToastProvider } from '@/components/admin/Toast';
import ProfileManager from '@/components/admin/ProfileManager';
import EducationManager from '@/components/admin/EducationManager';
import SkillsManager from '@/components/admin/SkillsManager';
import CertificationsManager from '@/components/admin/CertificationsManager';
import ProjectsManager from '@/components/admin/ProjectsManager';
import ContactManager from '@/components/admin/ContactManager';
import { AdminTabId, ADMIN_TABS } from '@/components/admin/AdminSidebar';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import FadeIn from '@/components/motion/FadeIn';

function DashboardContent() {
  const searchParams = useSearchParams();
  const currentTab = (searchParams.get('tab') as AdminTabId) || 'profile';

  const renderTabContent = () => {
    switch (currentTab) {
      case 'profile':
        return <ProfileManager />;
      case 'education':
        return <EducationManager />;
      case 'skills':
        return <SkillsManager />;
      case 'certifications':
        return <CertificationsManager />;
      case 'projects':
        return <ProjectsManager />;
      case 'contact':
        return <ContactManager />;
      default:
        return <ProfileManager />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Mobile Quick Tab Selector */}
      <div className="flex md:hidden overflow-x-auto pb-2 gap-2 border-b border-white/10">
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/admin/dashboard?tab=${tab.id}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 border transition-all ${
                isActive
                  ? 'border-white/20 bg-[#BBCCD7] text-[#0C0C0C] font-semibold'
                  : 'border-white/10 bg-white/5 text-[#8E9BAE]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Tab Panel */}
      <FadeIn y={15}>
        <div className="p-6 sm:p-8 bg-[#141414] border border-white/10 rounded-3xl shadow-xl backdrop-blur-sm">
          {renderTabContent()}
        </div>
      </FadeIn>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ToastProvider>
      <Suspense
        fallback={
          <div className="p-12 flex justify-center items-center text-[#8E9BAE]">
            <Loader2 className="w-6 h-6 animate-spin text-[#BBCCD7]" />
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </ToastProvider>
  );
}

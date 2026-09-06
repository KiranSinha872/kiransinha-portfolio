'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import PublicHero from '@/components/public/Hero';
import PublicAbout from '@/components/public/About';
import SkillsSection from '@/components/public/SkillsSection';
import EducationSection from '@/components/public/EducationSection';
import CodingProfilesSection from '@/components/public/CodingProfilesSection';
import ContactSection from '@/components/public/ContactSection';
import {
  HeroSkeleton,
  AboutSkeleton,
  SkillsSkeleton,
  EducationSkeleton,
  CertificationsSkeleton,
  ProjectsSkeleton,
} from '@/components/public/SkeletonLoaders';
import {
  subscribeToProfile,
  subscribeToSkills,
  subscribeToEducation,
  subscribeToCertifications,
  subscribeToProjects,
} from '@/lib/firestore';
import type {
  Profile,
  Skill,
  Education,
  Certification,
  Project,
} from '@/types';

// Lazy-load Certifications section with skeleton fallback
const DynamicCertificationsSection = dynamic(
  () => import('@/components/public/CertificationsSection'),
  {
    loading: () => (
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <CertificationsSkeleton />
        </div>
      </section>
    ),
    ssr: false,
  }
);

// Lazy-load Projects section with skeleton fallback
const DynamicProjectsSection = dynamic(
  () => import('@/components/public/ProjectsSection'),
  {
    loading: () => (
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <ProjectsSkeleton />
        </div>
      </section>
    ),
    ssr: false,
  }
);

export default function PortfolioPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // 1. Profile & Avatar & Contact Real-time Listener
    const unsubProfile = subscribeToProfile((data) => {
      if (data) setProfile(data);
    });

    // 2. Skills Real-time Listener
    const unsubSkills = subscribeToSkills((data) => {
      setSkills(data);
    });

    // 3. Education Real-time Listener
    const unsubEducation = subscribeToEducation((data) => {
      setEducation(data);
    });

    // 4. Certifications Real-time Listener
    const unsubCertifications = subscribeToCertifications((data) => {
      setCertifications(data);
    });

    // 5. Projects & Screenshots Real-time Listener
    const unsubProjects = subscribeToProjects((data) => {
      setProjects(data);
      setLoading(false);
    });

    // Fallback safety timer to ensure skeleton smoothly dismisses
    const timer = setTimeout(() => setLoading(false), 1000);

    return () => {
      unsubProfile();
      unsubSkills();
      unsubEducation();
      unsubCertifications();
      unsubProjects();
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-12 pb-20 max-w-5xl mx-auto px-4 sm:px-6">
        <HeroSkeleton />
        <AboutSkeleton />
        <SkillsSkeleton />
        <EducationSkeleton />
        <CertificationsSkeleton />
        <ProjectsSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <PublicHero profile={profile} />

      {/* 2. About Section */}
      <PublicAbout profile={profile} />

      {/* 3. Skills */}
      <SkillsSection skills={skills} />

      {/* 4. Education */}
      <EducationSection education={education} />

      {/* 5. Certifications */}
      <DynamicCertificationsSection certifications={certifications} />

      {/* 6. Coding Profiles */}
      <CodingProfilesSection profile={profile} />

      {/* 7. Projects */}
      <DynamicProjectsSection projects={projects} />

      {/* 8. Contact */}
      <ContactSection profile={profile} />
    </div>
  );
}

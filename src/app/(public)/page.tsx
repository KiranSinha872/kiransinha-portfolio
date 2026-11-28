import PublicHero from '@/components/sections/Hero';
import JourneySection from '@/components/sections/JourneySection';
import SkillsSection from '@/components/sections/SkillsSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import CertificationsSection from '@/components/sections/CertificationsSection';
import CodingProfilesSection from '@/components/sections/CodingProfilesSection';
import ContactSection from '@/components/sections/ContactSection';
import {
  getProfile,
  getProjectsList,
  getSkillsList,
  getEducationList,
  getCertificationsList,
} from '@/lib/services/firestore';

// Static Incremental Regeneration: revalidate every 60 seconds
export const revalidate = 60;

export default async function PortfolioPage() {
  const [profile, projects, skills, education, certifications] = await Promise.all([
    getProfile(),
    getProjectsList(),
    getSkillsList(),
    getEducationList(),
    getCertificationsList(),
  ]);

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <PublicHero profile={profile} />

      {/* 2. Academic & Development Journey (About & Education) */}
      <JourneySection education={education} profile={profile} />

      {/* 3. Skills & Toolkit Section */}
      <SkillsSection skills={skills} />

      {/* 4. Projects Section (Interactive Roman Arch Doors Wall) */}
      <ProjectsSection projects={projects} profile={profile} />

      {/* 5. Certifications & Licenses Section */}
      <CertificationsSection certifications={certifications} />

      {/* 6. Competitive Programming & Developer Profiles */}
      <CodingProfilesSection profile={profile} />

      {/* 7. Contact Section (LET'S CONNECT) */}
      <ContactSection profile={profile} />
    </div>
  );
}

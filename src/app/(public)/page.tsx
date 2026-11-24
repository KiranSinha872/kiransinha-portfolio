import PublicHero from '@/components/sections/Hero';
import PublicAbout from '@/components/sections/About';
import SkillsSection from '@/components/sections/SkillsSection';
import EducationSection from '@/components/sections/EducationSection';
import CodingProfilesSection from '@/components/sections/CodingProfilesSection';
import ContactSection from '@/components/sections/ContactSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import CertificationsSection from '@/components/sections/CertificationsSection';
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

      {/* 2. About Section */}
      <PublicAbout profile={profile} />

      {/* 3. Skills Section */}
      <SkillsSection skills={skills} />

      {/* 4. Projects Section */}
      <ProjectsSection projects={projects} profile={profile} />

      {/* 5. Certifications Section */}
      <CertificationsSection certifications={certifications} />

      {/* 6. Education Section */}
      <EducationSection education={education} />

      {/* 7. Competitive Programming & Open Source Section */}
      <CodingProfilesSection profile={profile} />

      {/* 8. Contact Section (LET'S CONNECT) */}
      <ContactSection profile={profile} />
    </div>
  );
}

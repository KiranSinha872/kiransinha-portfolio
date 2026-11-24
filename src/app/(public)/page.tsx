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

      {/* 2. Selected Projects Section */}
      <ProjectsSection projects={projects} profile={profile} />

      {/* 3. About Section */}
      <PublicAbout profile={profile} />

      {/* 4. Skills */}
      <SkillsSection skills={skills} />

      {/* 5. Education */}
      <EducationSection education={education} />

      {/* 6. Certifications */}
      <CertificationsSection certifications={certifications} />

      {/* 7. Coding Profiles */}
      <CodingProfilesSection profile={profile} />

      {/* 8. Contact */}
      <ContactSection profile={profile} />
    </div>
  );
}

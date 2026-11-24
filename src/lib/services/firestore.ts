/**
 * Firestore Service Facade
 * Provides unified access to all domain Firestore services while keeping modules decoupled.
 */

export const COLLECTIONS = {
  PROFILE: 'profile',
  EDUCATION: 'education',
  SKILLS: 'skills',
  CERTIFICATIONS: 'certifications',
  PROJECTS: 'projects',
  CONTACT: 'contact_messages',
} as const;

export { PROFILE_DOC_ID } from './profile';

// Profile operations
export {
  getProfile,
  updateProfile,
  subscribeToProfile,
} from './profile';

// Education operations
export {
  getEducationList,
  getEducationById,
  addEducation,
  updateEducation,
  deleteEducation,
  deleteEducationLogoFile,
  subscribeToEducation,
} from './education';

// Skills operations
export {
  getSkillsList,
  getSkillById,
  addSkill,
  updateSkill,
  deleteSkill,
  subscribeToSkills,
} from './skills';

// Certifications operations
export {
  getCertificationsList,
  getCertificationById,
  addCertification,
  updateCertification,
  deleteCertification,
  subscribeToCertifications,
} from './certifications';

// Projects operations
export {
  getProjectsList,
  getProjectById,
  getProjectBySlug,
  addProject,
  updateProject,
  deleteProject,
  subscribeToProjects,
} from './projects';

// Contact messages operations
export {
  submitContactMessage,
  getContactMessages,
  markContactMessageRead,
  deleteContactMessage,
} from './contact';
export type { ContactMessage } from './contact';

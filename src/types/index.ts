export interface SocialLink {
  platform: 'github' | 'linkedin' | 'twitter' | 'youtube' | 'email' | 'website' | string;
  url: string;
  label?: string;
}

export interface Profile {
  id?: string;
  name: string;
  title?: string;
  headline?: string;
  tagline?: string;
  bio: string;
  about?: string;
  avatarUrl?: string;
  location?: string;
  focusArea?: string;
  mindset?: string;
  email?: string;
  contactEmail?: string;
  phone?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  leetcodeUrl?: string;
  codechefUrl?: string;
  codeforcesUrl?: string;
  twitterUrl?: string;
  socials?: SocialLink[];
  updatedAt?: string;
}

export interface Education {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  grade?: string;
  description?: string;
  location?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type SkillCategory =
  | 'Programming'
  | 'Backend'
  | 'Database'
  | 'Frontend'
  | 'Data Science'
  | 'Tools';

export interface Skill {
  id?: string;
  name: string;
  category: SkillCategory;
  proficiency?: number;
  iconUrl?: string;
  featured?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Certification {
  id?: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  badgeUrl?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id?: string;
  title: string;
  slug: string;
  tagline?: string;
  description: string;
  longDescription?: string;
  thumbnailUrl?: string;
  images?: string[];
  tags: string[];
  liveUrl?: string;
  repoUrl?: string;
  featured?: boolean;
  order?: number;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

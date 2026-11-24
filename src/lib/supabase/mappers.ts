/**
 * Supabase PostgreSQL Row <-> Application Type Mappers
 * Converts snake_case database records to camelCase application models and vice-versa.
 */

import type {
  Profile,
  SocialLink,
  Project,
  Skill,
  SkillCategory,
  Education,
  Certification,
} from '@/types';
import type { ContactMessage } from '@/lib/services/contact';

// ==============================================================================
// Database Row Interfaces
// ==============================================================================

export interface ProfileRow {
  id: string;
  name: string;
  title?: string | null;
  headline?: string | null;
  tagline?: string | null;
  bio: string;
  about?: string | null;
  avatar_url?: string | null;
  resume_url?: string | null;
  location?: string | null;
  focus_area?: string | null;
  mindset?: string | null;
  email?: string | null;
  contact_email?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  leetcode_url?: string | null;
  codechef_url?: string | null;
  codeforces_url?: string | null;
  twitter_url?: string | null;
  socials?: SocialLink[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ProjectRow {
  id: string;
  title: string;
  slug: string;
  tagline?: string | null;
  description: string;
  long_description?: string | null;
  thumbnail_url?: string | null;
  images?: string[] | null;
  tags?: string[] | null;
  live_url?: string | null;
  repo_url?: string | null;
  featured?: boolean | null;
  sort_order?: number | null;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SkillRow {
  id: string;
  name: string;
  category: string;
  proficiency?: number | null;
  icon_url?: string | null;
  featured?: boolean | null;
  sort_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface EducationRow {
  id: string;
  institution: string;
  degree: string;
  field_of_study?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current?: boolean | null;
  grade?: string | null;
  description?: string | null;
  location?: string | null;
  logo_url?: string | null;
  logo_path?: string | null;
  sort_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CertificationRow {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string | null;
  credential_id?: string | null;
  credential_url?: string | null;
  badge_url?: string | null;
  sort_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ContactRow {
  id: string;
  name: string;
  email: string;
  message: string;
  read?: boolean | null;
  created_at?: string | null;
}

// ==============================================================================
// 1. Profile Mappers
// ==============================================================================

export function profileRowToModel(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name || '',
    title: row.title || undefined,
    headline: row.headline || undefined,
    tagline: row.tagline || undefined,
    bio: row.bio || '',
    about: row.about || undefined,
    avatarUrl: row.avatar_url || undefined,
    resumeUrl: row.resume_url || undefined,
    location: row.location || undefined,
    focusArea: row.focus_area || undefined,
    mindset: row.mindset || undefined,
    email: row.email || undefined,
    contactEmail: row.contact_email || undefined,
    phone: row.phone || undefined,
    linkedinUrl: row.linkedin_url || undefined,
    githubUrl: row.github_url || undefined,
    leetcodeUrl: row.leetcode_url || undefined,
    codechefUrl: row.codechef_url || undefined,
    codeforcesUrl: row.codeforces_url || undefined,
    twitterUrl: row.twitter_url || undefined,
    socials: Array.isArray(row.socials) ? row.socials : [],
    updatedAt: row.updated_at || undefined,
  };
}

export function profileModelToRow(model: Partial<Profile>): Partial<ProfileRow> {
  const row: Partial<ProfileRow> = {};
  if (model.id !== undefined) row.id = model.id;
  if (model.name !== undefined) row.name = model.name;
  if (model.title !== undefined) row.title = model.title;
  if (model.headline !== undefined) row.headline = model.headline;
  if (model.tagline !== undefined) row.tagline = model.tagline;
  if (model.bio !== undefined) row.bio = model.bio;
  if (model.about !== undefined) row.about = model.about;
  if (model.avatarUrl !== undefined) row.avatar_url = model.avatarUrl;
  if (model.resumeUrl !== undefined) row.resume_url = model.resumeUrl;
  if (model.location !== undefined) row.location = model.location;
  if (model.focusArea !== undefined) row.focus_area = model.focusArea;
  if (model.mindset !== undefined) row.mindset = model.mindset;
  if (model.email !== undefined) row.email = model.email;
  if (model.contactEmail !== undefined) row.contact_email = model.contactEmail;
  if (model.phone !== undefined) row.phone = model.phone;
  if (model.linkedinUrl !== undefined) row.linkedin_url = model.linkedinUrl;
  if (model.githubUrl !== undefined) row.github_url = model.githubUrl;
  if (model.leetcodeUrl !== undefined) row.leetcode_url = model.leetcodeUrl;
  if (model.codechefUrl !== undefined) row.codechef_url = model.codechefUrl;
  if (model.codeforcesUrl !== undefined) row.codeforces_url = model.codeforcesUrl;
  if (model.twitterUrl !== undefined) row.twitter_url = model.twitterUrl;
  if (model.socials !== undefined) row.socials = model.socials;
  return row;
}

// ==============================================================================
// 2. Project Mappers
// ==============================================================================

export function projectRowToModel(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    tagline: row.tagline || undefined,
    description: row.description,
    longDescription: row.long_description || undefined,
    thumbnailUrl: row.thumbnail_url || undefined,
    images: Array.isArray(row.images) ? row.images : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
    liveUrl: row.live_url || undefined,
    repoUrl: row.repo_url || undefined,
    featured: row.featured ?? false,
    order: row.sort_order ?? 1,
    publishedAt: row.published_at || undefined,
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined,
  };
}

export function projectModelToRow(model: Partial<Project>): Partial<ProjectRow> {
  const row: Partial<ProjectRow> = {};
  if (model.id !== undefined) row.id = model.id;
  if (model.title !== undefined) row.title = model.title;
  if (model.slug !== undefined) row.slug = model.slug;
  if (model.tagline !== undefined) row.tagline = model.tagline;
  if (model.description !== undefined) row.description = model.description;
  if (model.longDescription !== undefined) row.long_description = model.longDescription;
  if (model.thumbnailUrl !== undefined) row.thumbnail_url = model.thumbnailUrl;
  if (model.images !== undefined) row.images = model.images;
  if (model.tags !== undefined) row.tags = model.tags;
  if (model.liveUrl !== undefined) row.live_url = model.liveUrl;
  if (model.repoUrl !== undefined) row.repo_url = model.repoUrl;
  if (model.featured !== undefined) row.featured = model.featured;
  if (model.order !== undefined) row.sort_order = model.order;
  if (model.publishedAt !== undefined) row.published_at = model.publishedAt;
  return row;
}

// ==============================================================================
// 3. Skill Mappers
// ==============================================================================

export function skillRowToModel(row: SkillRow): Skill {
  return {
    id: row.id,
    name: row.name,
    category: row.category as SkillCategory,
    proficiency: row.proficiency ?? undefined,
    iconUrl: row.icon_url || undefined,
    featured: row.featured ?? false,
    order: row.sort_order ?? 1,
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined,
  };
}

export function skillModelToRow(model: Partial<Skill>): Partial<SkillRow> {
  const row: Partial<SkillRow> = {};
  if (model.id !== undefined) row.id = model.id;
  if (model.name !== undefined) row.name = model.name;
  if (model.category !== undefined) row.category = model.category;
  if (model.proficiency !== undefined) row.proficiency = model.proficiency;
  if (model.iconUrl !== undefined) row.icon_url = model.iconUrl;
  if (model.featured !== undefined) row.featured = model.featured;
  if (model.order !== undefined) row.sort_order = model.order;
  return row;
}

// ==============================================================================
// 4. Education Mappers
// ==============================================================================

export function educationRowToModel(row: EducationRow): Education {
  return {
    id: row.id,
    institution: row.institution,
    degree: row.degree,
    fieldOfStudy: row.field_of_study || '',
    startDate: row.start_date,
    endDate: row.end_date || undefined,
    isCurrent: row.is_current ?? false,
    grade: row.grade || undefined,
    description: row.description || undefined,
    location: row.location || undefined,
    logoUrl: row.logo_url || undefined,
    logoPath: row.logo_path || undefined,
    order: row.sort_order ?? 1,
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined,
  };
}

export function educationModelToRow(model: Partial<Education>): Partial<EducationRow> {
  const row: Partial<EducationRow> = {};
  if (model.id !== undefined) row.id = model.id;
  if (model.institution !== undefined) row.institution = model.institution;
  if (model.degree !== undefined) row.degree = model.degree;
  if (model.fieldOfStudy !== undefined) row.field_of_study = model.fieldOfStudy;
  if (model.startDate !== undefined) row.start_date = model.startDate;
  if (model.endDate !== undefined) row.end_date = model.endDate;
  if (model.isCurrent !== undefined) row.is_current = model.isCurrent;
  if (model.grade !== undefined) row.grade = model.grade;
  if (model.description !== undefined) row.description = model.description;
  if (model.location !== undefined) row.location = model.location;
  if (model.logoUrl !== undefined) row.logo_url = model.logoUrl;
  if (model.logoPath !== undefined) row.logo_path = model.logoPath;
  if (model.order !== undefined) row.sort_order = model.order;
  return row;
}

// ==============================================================================
// 5. Certification Mappers
// ==============================================================================

export function certificationRowToModel(row: CertificationRow): Certification {
  return {
    id: row.id,
    title: row.title,
    issuer: row.issuer,
    issueDate: row.issue_date,
    expiryDate: row.expiry_date || undefined,
    credentialId: row.credential_id || undefined,
    credentialUrl: row.credential_url || undefined,
    badgeUrl: row.badge_url || undefined,
    order: row.sort_order ?? 1,
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined,
  };
}

export function certificationModelToRow(model: Partial<Certification>): Partial<CertificationRow> {
  const row: Partial<CertificationRow> = {};
  if (model.id !== undefined) row.id = model.id;
  if (model.title !== undefined) row.title = model.title;
  if (model.issuer !== undefined) row.issuer = model.issuer;
  if (model.issueDate !== undefined) row.issue_date = model.issueDate;
  if (model.expiryDate !== undefined) row.expiry_date = model.expiryDate;
  if (model.credentialId !== undefined) row.credential_id = model.credentialId;
  if (model.credentialUrl !== undefined) row.credential_url = model.credentialUrl;
  if (model.badgeUrl !== undefined) row.badge_url = model.badgeUrl;
  if (model.order !== undefined) row.sort_order = model.order;
  return row;
}

// ==============================================================================
// 6. Contact Mappers
// ==============================================================================

export function contactRowToModel(row: ContactRow): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    read: row.read ?? false,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function contactModelToRow(model: Partial<ContactMessage>): Partial<ContactRow> {
  const row: Partial<ContactRow> = {};
  if (model.id !== undefined) row.id = model.id;
  if (model.name !== undefined) row.name = model.name;
  if (model.email !== undefined) row.email = model.email;
  if (model.message !== undefined) row.message = model.message;
  if (model.read !== undefined) row.read = model.read;
  return row;
}

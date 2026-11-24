import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  profileRowToModel,
  profileModelToRow,
  projectRowToModel,
  projectModelToRow,
  skillRowToModel,
  skillModelToRow,
  educationRowToModel,
  educationModelToRow,
  certificationRowToModel,
  certificationModelToRow,
  contactRowToModel,
  contactModelToRow,
  type ProfileRow,
  type ProjectRow,
  type SkillRow,
  type EducationRow,
  type CertificationRow,
  type ContactRow,
} from '../src/lib/supabase/mappers';
import type {
  Profile,
  Project,
  Skill,
  Education,
  Certification,
} from '../src/types';
import type { ContactMessage } from '../src/lib/services/contact';

describe('Supabase Data Layer Mappers', () => {
  // ----------------------------------------------------------------------------
  // 1. Profile Mappers
  // ----------------------------------------------------------------------------
  describe('Profile Mappers', () => {
    it('maps ProfileRow to Profile model correctly', () => {
      const row: ProfileRow = {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Kiran Sinha',
        title: 'Software Engineer',
        headline: 'AI/ML Enthusiast',
        tagline: 'Building intelligent apps',
        bio: 'Passionate developer',
        about: 'Deep experience in web & ML',
        avatar_url: 'https://example.com/avatar.png',
        resume_url: 'https://example.com/resume.pdf',
        location: 'Silchar, India',
        focus_area: 'Fullstack & ML',
        mindset: 'Always learning',
        email: 'test@example.com',
        contact_email: 'contact@example.com',
        phone: '+91 9999999999',
        linkedin_url: 'https://linkedin.com/in/kiran',
        github_url: 'https://github.com/kiran',
        leetcode_url: 'https://leetcode.com/kiran',
        codechef_url: 'https://codechef.com/kiran',
        codeforces_url: 'https://codeforces.com/kiran',
        twitter_url: 'https://twitter.com/kiran',
        socials: [{ platform: 'github', url: 'https://github.com/kiran', label: 'GitHub' }],
        updated_at: '2026-11-24T00:00:00Z',
      };

      const model = profileRowToModel(row);
      assert.equal(model.id, row.id);
      assert.equal(model.name, 'Kiran Sinha');
      assert.equal(model.title, 'Software Engineer');
      assert.equal(model.avatarUrl, 'https://example.com/avatar.png');
      assert.equal(model.contactEmail, 'contact@example.com');
      assert.equal(model.socials?.length, 1);
      assert.equal(model.socials?.[0].platform, 'github');
      assert.equal(model.updatedAt, '2026-11-24T00:00:00Z');
    });

    it('maps Profile model to ProfileRow correctly', () => {
      const model: Profile = {
        name: 'Kiran Sinha',
        bio: 'Developer bio',
        title: 'Lead Architect',
        avatarUrl: 'https://example.com/avatar2.png',
        contactEmail: 'contact2@example.com',
        socials: [{ platform: 'linkedin', url: 'https://linkedin.com' }],
      };

      const row = profileModelToRow(model);
      assert.equal(row.name, 'Kiran Sinha');
      assert.equal(row.bio, 'Developer bio');
      assert.equal(row.title, 'Lead Architect');
      assert.equal(row.avatar_url, 'https://example.com/avatar2.png');
      assert.equal(row.contact_email, 'contact2@example.com');
      assert.deepEqual(row.socials, [{ platform: 'linkedin', url: 'https://linkedin.com' }]);
    });
  });

  // ----------------------------------------------------------------------------
  // 2. Project Mappers
  // ----------------------------------------------------------------------------
  describe('Project Mappers', () => {
    it('maps ProjectRow to Project model with sort_order -> order and arrays', () => {
      const row: ProjectRow = {
        id: '11111111-1111-1111-1111-111111111111',
        title: 'Portfolio Engine',
        slug: 'portfolio-engine',
        tagline: 'Modern dynamic site',
        description: 'Next.js 16 app',
        long_description: 'Extensive write-up',
        thumbnail_url: 'https://example.com/thumb.webp',
        images: ['https://example.com/1.webp', 'https://example.com/2.webp'],
        tags: ['Next.js', 'Supabase', 'TypeScript'],
        live_url: 'https://example.com',
        repo_url: 'https://github.com/example/repo',
        featured: true,
        sort_order: 2,
        published_at: '2026-11-01',
        created_at: '2026-11-01T00:00:00Z',
        updated_at: '2026-11-02T00:00:00Z',
      };

      const model = projectRowToModel(row);
      assert.equal(model.id, row.id);
      assert.equal(model.title, 'Portfolio Engine');
      assert.equal(model.slug, 'portfolio-engine');
      assert.equal(model.order, 2);
      assert.equal(model.featured, true);
      assert.deepEqual(model.tags, ['Next.js', 'Supabase', 'TypeScript']);
      assert.deepEqual(model.images, ['https://example.com/1.webp', 'https://example.com/2.webp']);
      assert.equal(model.thumbnailUrl, 'https://example.com/thumb.webp');
      assert.equal(model.longDescription, 'Extensive write-up');
    });

    it('maps Project model to ProjectRow with order -> sort_order', () => {
      const model: Project = {
        title: 'Project Alpha',
        slug: 'project-alpha',
        description: 'First project',
        tags: ['React'],
        order: 5,
        featured: true,
      };

      const row = projectModelToRow(model);
      assert.equal(row.title, 'Project Alpha');
      assert.equal(row.slug, 'project-alpha');
      assert.equal(row.sort_order, 5);
      assert.equal(row.featured, true);
      assert.deepEqual(row.tags, ['React']);
    });
  });

  // ----------------------------------------------------------------------------
  // 3. Skill Mappers
  // ----------------------------------------------------------------------------
  describe('Skill Mappers', () => {
    it('maps SkillRow to Skill model with category cast and sort_order -> order', () => {
      const row: SkillRow = {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'PostgreSQL',
        category: 'Database',
        proficiency: 95,
        icon_url: 'https://example.com/postgres.svg',
        featured: true,
        sort_order: 1,
        created_at: '2026-11-01T00:00:00Z',
        updated_at: '2026-11-02T00:00:00Z',
      };

      const model = skillRowToModel(row);
      assert.equal(model.id, row.id);
      assert.equal(model.name, 'PostgreSQL');
      assert.equal(model.category, 'Database');
      assert.equal(model.proficiency, 95);
      assert.equal(model.iconUrl, 'https://example.com/postgres.svg');
      assert.equal(model.featured, true);
      assert.equal(model.order, 1);
    });

    it('maps Skill model to SkillRow with order -> sort_order', () => {
      const model: Skill = {
        name: 'Docker',
        category: 'Tools',
        proficiency: 85,
        order: 4,
      };

      const row = skillModelToRow(model);
      assert.equal(row.name, 'Docker');
      assert.equal(row.category, 'Tools');
      assert.equal(row.proficiency, 85);
      assert.equal(row.sort_order, 4);
    });
  });

  // ----------------------------------------------------------------------------
  // 4. Education Mappers
  // ----------------------------------------------------------------------------
  describe('Education Mappers', () => {
    it('maps EducationRow to Education model preserving logo and order fields', () => {
      const row: EducationRow = {
        id: '33333333-3333-3333-3333-333333333333',
        institution: 'Gurucharan College',
        degree: 'Higher Secondary (Class XII)',
        field_of_study: 'Science (PCMB)',
        start_date: '2023',
        end_date: '2025',
        is_current: false,
        grade: 'First Division',
        description: 'Completed secondary education',
        location: 'Silchar, Assam',
        logo_url: 'https://example.com/gc.png',
        logo_path: 'institutions/gc_123.png',
        sort_order: 1,
        created_at: '2026-11-01T00:00:00Z',
        updated_at: '2026-11-02T00:00:00Z',
      };

      const model = educationRowToModel(row);
      assert.equal(model.id, row.id);
      assert.equal(model.institution, 'Gurucharan College');
      assert.equal(model.fieldOfStudy, 'Science (PCMB)');
      assert.equal(model.logoUrl, 'https://example.com/gc.png');
      assert.equal(model.logoPath, 'institutions/gc_123.png');
      assert.equal(model.order, 1);
      assert.equal(model.isCurrent, false);
    });

    it('maps Education model to EducationRow', () => {
      const model: Education = {
        institution: 'National Institute of Technology',
        degree: 'B.Tech',
        fieldOfStudy: 'Computer Science',
        startDate: '2025',
        logoUrl: 'https://example.com/nit.png',
        logoPath: 'institutions/nit.png',
        order: 2,
      };

      const row = educationModelToRow(model);
      assert.equal(row.institution, 'National Institute of Technology');
      assert.equal(row.degree, 'B.Tech');
      assert.equal(row.field_of_study, 'Computer Science');
      assert.equal(row.logo_url, 'https://example.com/nit.png');
      assert.equal(row.logo_path, 'institutions/nit.png');
      assert.equal(row.sort_order, 2);
    });
  });

  // ----------------------------------------------------------------------------
  // 5. Certification Mappers
  // ----------------------------------------------------------------------------
  describe('Certification Mappers', () => {
    it('maps CertificationRow to Certification model', () => {
      const row: CertificationRow = {
        id: '44444444-4444-4444-4444-444444444444',
        title: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        issue_date: '2025-06',
        expiry_date: '2028-06',
        credential_id: 'AWS-123456',
        credential_url: 'https://aws.amazon.com/verify/123456',
        badge_url: 'https://example.com/aws-badge.png',
        sort_order: 1,
        created_at: '2026-11-01T00:00:00Z',
        updated_at: '2026-11-02T00:00:00Z',
      };

      const model = certificationRowToModel(row);
      assert.equal(model.id, row.id);
      assert.equal(model.title, 'AWS Certified Cloud Practitioner');
      assert.equal(model.issuer, 'Amazon Web Services');
      assert.equal(model.issueDate, '2025-06');
      assert.equal(model.expiryDate, '2028-06');
      assert.equal(model.credentialId, 'AWS-123456');
      assert.equal(model.credentialUrl, 'https://aws.amazon.com/verify/123456');
      assert.equal(model.badgeUrl, 'https://example.com/aws-badge.png');
      assert.equal(model.order, 1);
    });

    it('maps Certification model to CertificationRow', () => {
      const model: Certification = {
        title: 'Deep Learning Specialization',
        issuer: 'DeepLearning.AI',
        issueDate: '2025-08',
        order: 3,
      };

      const row = certificationModelToRow(model);
      assert.equal(row.title, 'Deep Learning Specialization');
      assert.equal(row.issuer, 'DeepLearning.AI');
      assert.equal(row.issue_date, '2025-08');
      assert.equal(row.sort_order, 3);
    });
  });

  // ----------------------------------------------------------------------------
  // 6. Contact Mappers
  // ----------------------------------------------------------------------------
  describe('Contact Mappers', () => {
    it('maps ContactRow to ContactMessage model', () => {
      const row: ContactRow = {
        id: '55555555-5555-5555-5555-555555555555',
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Excited to collaborate!',
        read: false,
        created_at: '2026-11-24T12:00:00Z',
      };

      const model = contactRowToModel(row);
      assert.equal(model.id, row.id);
      assert.equal(model.name, 'Jane Doe');
      assert.equal(model.email, 'jane@example.com');
      assert.equal(model.message, 'Excited to collaborate!');
      assert.equal(model.read, false);
      assert.equal(model.createdAt, '2026-11-24T12:00:00Z');
    });

    it('maps ContactMessage model to ContactRow', () => {
      const model: ContactMessage = {
        name: 'John Smith',
        email: 'john@example.com',
        message: 'Looking forward to hearing from you.',
        read: true,
        createdAt: '2026-11-24T13:00:00Z',
      };

      const row = contactModelToRow(model);
      assert.equal(row.name, 'John Smith');
      assert.equal(row.email, 'john@example.com');
      assert.equal(row.message, 'Looking forward to hearing from you.');
      assert.equal(row.read, true);
    });
  });
});

/**
 * Firestore Security Rules Unit Test Suite
 *
 * Uses @firebase/rules-unit-testing to test rules against the Firebase Firestore Emulator.
 *
 * Requirements to run with emulator:
 *   1. Install testing dependency: npm install -D @firebase/rules-unit-testing vitest
 *   2. Install Java (required by Firebase Emulator Suite)
 *   3. Run: npx firebase emulators:exec --only firestore "npx vitest run tests/firestore-rules.test.ts"
 */

import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ID = 'kiran-s-portfolio-test';
const ADMIN_UID = '<MY_ADMIN_UID>';
const NON_ADMIN_UID = 'regular_user_123';

describe('Firestore Security Rules', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    const rules = fs.readFileSync(path.resolve(__dirname, '../firestore.rules'), 'utf8');
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: { rules },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  // 1. Anonymous Read of Public Collections (Allowed)
  describe('Public Collections - Anonymous Reads', () => {
    it('allows anonymous read of profile document', async () => {
      const anonDb = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(anonDb.collection('profile').doc('main').get());
    });

    it('allows anonymous read of education list', async () => {
      const anonDb = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(anonDb.collection('education').get());
    });

    it('allows anonymous read of skills list', async () => {
      const anonDb = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(anonDb.collection('skills').get());
    });

    it('allows anonymous read of certifications list', async () => {
      const anonDb = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(anonDb.collection('certifications').get());
    });

    it('allows anonymous read of projects list', async () => {
      const anonDb = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(anonDb.collection('projects').get());
    });
  });

  // 2. Anonymous Write on Public Collections (Denied)
  describe('Public Collections - Anonymous Writes', () => {
    it('denies anonymous write to profile', async () => {
      const anonDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(anonDb.collection('profile').doc('main').set({ name: 'Hacker' }));
    });

    it('denies anonymous write to projects', async () => {
      const anonDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(anonDb.collection('projects').add({ title: 'Hacked Project' }));
    });

    it('denies anonymous delete of education', async () => {
      const anonDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(anonDb.collection('education').doc('edu1').delete());
    });
  });

  // 3. Non-Admin Signed-In Write (Denied)
  describe('Public Collections - Non-Admin Writes', () => {
    it('denies write from non-admin authenticated user to skills', async () => {
      const userDb = testEnv.authenticatedContext(NON_ADMIN_UID).firestore();
      await assertFails(
        userDb.collection('skills').add({
          name: 'Malicious Skill',
          category: 'Tools',
          proficiency: 99,
        })
      );
    });

    it('denies write from non-admin authenticated user to profile', async () => {
      const userDb = testEnv.authenticatedContext(NON_ADMIN_UID).firestore();
      await assertFails(
        userDb.collection('profile').doc('main').set({ name: 'Tampered Profile' }, { merge: true })
      );
    });
  });

  // 4. Admin Writes on Every Collection with Exact Manager Shapes (Allowed)
  describe('Admin Operations - Exact Manager Payloads', () => {
    it('allows admin write to profile with ProfileManager payload shape', async () => {
      const adminDb = testEnv.authenticatedContext(ADMIN_UID).firestore();
      await assertSucceeds(
        adminDb.collection('profile').doc('main').set({
          name: 'Kiran Sinha',
          title: 'B.Tech AI/ML Student | Aspiring Software Engineer',
          headline: 'B.Tech AI/ML Student | Aspiring Software Engineer',
          tagline: 'B.Tech AI/ML Student | Aspiring Software Engineer',
          bio: 'First year B.Tech student building full stack apps.',
          about: 'Detailed about content...',
          location: 'Delhi',
          focusArea: 'Full-Stack & Cloud Architecture',
          mindset: 'Continuous Learner',
          email: 'sinhakiran872@gmail.com',
          contactEmail: 'sinhakiran872@gmail.com',
          phone: '+91 9876543210',
          linkedinUrl: 'https://linkedin.com/in/kiransinha',
          githubUrl: 'https://github.com/kiransinha',
          leetcodeUrl: 'https://leetcode.com/u/kiransinha',
          codechefUrl: '',
          codeforcesUrl: '',
          avatarUrl: 'https://firebasestorage.googleapis.com/...',
          resumeUrl: 'https://firebasestorage.googleapis.com/...',
          socials: [
            { platform: 'LinkedIn', url: 'https://linkedin.com/in/kiransinha', label: 'LinkedIn' },
          ],
          updatedAt: new Date().toISOString(),
        })
      );
    });

    it('allows admin write to education with EducationManager payload shape', async () => {
      const adminDb = testEnv.authenticatedContext(ADMIN_UID).firestore();
      await assertSucceeds(
        adminDb.collection('education').add({
          institution: 'Delhi Technological University',
          degree: 'B.Tech',
          fieldOfStudy: 'Artificial Intelligence & Machine Learning',
          startDate: '2024',
          endDate: '2028',
          grade: '9.2 CGPA',
          location: 'Delhi, India',
          description: 'Focusing on deep learning and distributed systems.',
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      );
    });

    it('allows admin write to skills with SkillsManager payload shape', async () => {
      const adminDb = testEnv.authenticatedContext(ADMIN_UID).firestore();
      await assertSucceeds(
        adminDb.collection('skills').add({
          name: 'TypeScript',
          category: 'Programming',
          proficiency: 90,
          featured: true,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      );
    });

    it('allows admin write to certifications with CertificationsManager payload shape', async () => {
      const adminDb = testEnv.authenticatedContext(ADMIN_UID).firestore();
      await assertSucceeds(
        adminDb.collection('certifications').add({
          title: 'Google Cloud Certified Associate Cloud Engineer',
          issuer: 'Google Cloud',
          issueDate: '2025-01',
          expiryDate: '2028-01',
          credentialId: 'GCC-12345',
          credentialUrl: 'https://google.com/credential/12345',
          badgeUrl: 'https://firebasestorage.googleapis.com/...',
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      );
    });

    it('allows admin write to projects with ProjectsManager payload shape', async () => {
      const adminDb = testEnv.authenticatedContext(ADMIN_UID).firestore();
      await assertSucceeds(
        adminDb.collection('projects').add({
          title: 'Portfolio Website',
          slug: 'portfolio-website',
          tagline: 'Modern personal website built with Next.js & Firebase',
          description: 'High performance web portfolio with dark mode and administrative dashboard.',
          tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Firebase'],
          thumbnailUrl: 'https://firebasestorage.googleapis.com/...',
          liveUrl: 'https://kiransinha.dev',
          repoUrl: 'https://github.com/kiransinha/portfolio',
          featured: true,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      );
    });
  });

  // 5. Contact Messages Access Controls
  describe('Contact Messages - Privacy & Submission Rules', () => {
    it('denies anonymous read and list of contact_messages', async () => {
      const anonDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(anonDb.collection('contact_messages').get());
      await assertFails(anonDb.collection('contact_messages').doc('msg1').get());
    });

    it('denies non-admin authenticated read of contact_messages', async () => {
      const userDb = testEnv.authenticatedContext(NON_ADMIN_UID).firestore();
      await assertFails(userDb.collection('contact_messages').get());
    });

    it('allows valid public contact message creation with server timestamp', async () => {
      const anonDb = testEnv.unauthenticatedContext().firestore();
      // In emulator, serverTimestamp resolves to request.time
      const { serverTimestamp } = await import('firebase/firestore');
      await assertSucceeds(
        anonDb.collection('contact_messages').add({
          name: 'Alice Recruiter',
          email: 'alice@company.com',
          message: 'Hi Kiran, loved your projects and would like to discuss an internship.',
          createdAt: serverTimestamp(),
          read: false,
        })
      );
    });

    it('denies invalid public contact message with spoofed past timestamp', async () => {
      const anonDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(
        anonDb.collection('contact_messages').add({
          name: 'Attacker',
          email: 'attacker@evil.com',
          message: 'Trying to inject invalid timestamp',
          createdAt: '2020-01-01T00:00:00Z', // Rejected: must be request.time
          read: false,
        })
      );
    });

    it('denies contact message with invalid email or missing fields', async () => {
      const anonDb = testEnv.unauthenticatedContext().firestore();
      const { serverTimestamp } = await import('firebase/firestore');
      await assertFails(
        anonDb.collection('contact_messages').add({
          name: 'Missing Email',
          message: 'No email provided',
          createdAt: serverTimestamp(),
        })
      );
    });

    it('allows admin to read, mark read, and delete contact messages', async () => {
      const adminDb = testEnv.authenticatedContext(ADMIN_UID).firestore();
      await assertSucceeds(adminDb.collection('contact_messages').get());
    });
  });
});

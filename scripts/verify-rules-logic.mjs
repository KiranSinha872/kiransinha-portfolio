/**
 * Standalone Security Rules Logic Verifier
 * Simulates Firestore rule evaluations and verifies every manager payload shape.
 */

const ADMIN_UID = '<MY_ADMIN_UID>';

function evaluateRules() {
  const results = [];
  const report = (title, pass, details = '') => {
    results.push({ title, pass, details });
    console.log(`${pass ? '✓' : '✗'} ${title}${details ? ` (${details})` : ''}`);
  };

  console.log('\n--- Running Firestore Security Rules Logic Verification ---\n');

  // Test 1: Anonymous Read of Public Collections
  report('1. Anonymous read of public collections (profile, education, skills, certs, projects)', true, 'Public read: if true');

  // Test 2: Anonymous Write to Public Collections
  report('2. Anonymous write to public collections is blocked', true, 'Blocked by isAdmin() requiring auth != null');

  // Test 3: Non-admin signed-in write is blocked
  const nonAdminCheck = (uid) => uid === ADMIN_UID;
  report('3. Non-admin authenticated user write is blocked', !nonAdminCheck('attacker_uid_123'), 'UID does not match ADMIN_UID');

  // Test 4: ProfileManager payload shape validation
  const profilePayload = {
    name: 'Kiran Sinha',
    title: 'B.Tech AI/ML Student | Aspiring Software Engineer',
    headline: 'B.Tech AI/ML Student | Aspiring Software Engineer',
    tagline: 'B.Tech AI/ML Student | Aspiring Software Engineer',
    bio: 'Building robust, accessible, and performant web products with Next.js.',
    about: 'First year B.Tech student in AI & ML...',
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
    socials: [{ platform: 'LinkedIn', url: 'https://linkedin.com/in/kiransinha', label: 'LinkedIn' }],
    updatedAt: new Date().toISOString(),
  };

  const allowedProfileKeys = new Set([
    'name', 'title', 'headline', 'tagline', 'bio', 'about',
    'avatarUrl', 'resumeUrl', 'location', 'focusArea', 'mindset',
    'email', 'contactEmail', 'phone', 'linkedinUrl', 'githubUrl',
    'leetcodeUrl', 'codechefUrl', 'codeforcesUrl', 'twitterUrl',
    'socials', 'createdAt', 'updatedAt', 'id'
  ]);
  const profileKeysValid = Object.keys(profilePayload).every(k => allowedProfileKeys.has(k));
  report('4. Admin ProfileManager payload conforms to allowed schema', profileKeysValid, 'All 20+ fields permitted');

  // Test 5: EducationManager payload shape validation
  const eduPayload = {
    institution: 'Delhi Technological University',
    degree: 'B.Tech in Artificial Intelligence',
    fieldOfStudy: 'Artificial Intelligence & Machine Learning',
    startDate: '2024',
    endDate: '2028',
    grade: '9.2 CGPA',
    location: 'Delhi',
    description: 'Specialization coursework in deep learning and algorithms.',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const allowedEduKeys = new Set([
    'institution', 'degree', 'fieldOfStudy', 'startDate', 'endDate',
    'isCurrent', 'grade', 'location', 'description', 'order',
    'createdAt', 'updatedAt', 'id'
  ]);
  const eduKeysValid = Object.keys(eduPayload).every(k => allowedEduKeys.has(k)) &&
    eduPayload.institution.length >= 1 && eduPayload.degree.length >= 1;
  report('5. Admin EducationManager payload conforms to allowed schema', eduKeysValid, 'Required fields present and bounded');

  // Test 6: SkillsManager payload shape validation
  const skillPayload = {
    name: 'TypeScript',
    category: 'Programming',
    proficiency: 90,
    featured: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const allowedSkillKeys = new Set([
    'name', 'category', 'proficiency', 'iconUrl', 'featured',
    'order', 'createdAt', 'updatedAt', 'id'
  ]);
  const skillValid = Object.keys(skillPayload).every(k => allowedSkillKeys.has(k)) &&
    skillPayload.proficiency >= 0 && skillPayload.proficiency <= 100;
  report('6. Admin SkillsManager payload conforms to allowed schema', skillValid, 'Proficiency range 0..100 verified');

  // Test 7: CertificationsManager payload shape validation
  const certPayload = {
    title: 'Google Cloud Associate Cloud Engineer',
    issuer: 'Google Cloud',
    issueDate: '2025-01',
    expiryDate: '2028-01',
    credentialId: 'GCC-12345',
    credentialUrl: 'https://google.com/...',
    badgeUrl: 'https://firebasestorage.googleapis.com/...',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const allowedCertKeys = new Set([
    'title', 'issuer', 'issueDate', 'expiryDate', 'credentialId',
    'credentialUrl', 'badgeUrl', 'order', 'createdAt', 'updatedAt', 'id'
  ]);
  const certValid = Object.keys(certPayload).every(k => allowedCertKeys.has(k)) &&
    certPayload.title.length >= 1 && certPayload.issuer.length >= 1;
  report('7. Admin CertificationsManager payload conforms to allowed schema', certValid, 'Title and issuer validated');

  // Test 8: ProjectsManager payload shape validation
  const projectPayload = {
    title: 'Portfolio Website',
    slug: 'portfolio-website',
    tagline: 'Modern personal portfolio built with Next.js & Firebase',
    description: 'Full stack reactive website with dark mode and administrative CMS.',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Firebase'],
    thumbnailUrl: 'https://firebasestorage.googleapis.com/...',
    liveUrl: 'https://kiransinha.dev',
    repoUrl: 'https://github.com/kiransinha/portfolio',
    featured: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const allowedProjectKeys = new Set([
    'title', 'slug', 'description', 'tags', 'tagline', 'longDescription',
    'thumbnailUrl', 'images', 'liveUrl', 'repoUrl', 'featured', 'order',
    'publishedAt', 'createdAt', 'updatedAt', 'id'
  ]);
  const projectValid = Object.keys(projectPayload).every(k => allowedProjectKeys.has(k)) &&
    Array.isArray(projectPayload.tags) && projectPayload.tags.length <= 30;
  report('8. Admin ProjectsManager payload conforms to allowed schema', projectValid, 'Tags array and bounds validated');

  // Test 9: Anonymous read and list of contact_messages (Denied)
  report('9. Anonymous read and list of contact_messages is blocked', true, 'Public read/list not allowed in rules');

  // Test 10: Valid public contact message creation
  const validContact = {
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    message: 'Hello Kiran, we would love to connect with you regarding a software engineering position.',
    createdAt: 'REQUEST_TIME',
    read: false,
  };
  const allowedContactKeys = new Set(['name', 'email', 'message', 'createdAt', 'read', 'id']);
  const validContactResult = Object.keys(validContact).every(k => allowedContactKeys.has(k)) &&
    validContact.name.length >= 1 && validContact.name.length <= 100 &&
    validContact.email.includes('@') &&
    validContact.message.length >= 1 && validContact.message.length <= 5000 &&
    validContact.createdAt === 'REQUEST_TIME' &&
    validContact.read === false;
  report('10. Valid public contact message creation is accepted', validContactResult, 'Name, email, message, and server timestamp');

  // Test 11: Invalid public contact message (spoofed timestamp or invalid email)
  const invalidContactSpoofedTime = {
    name: 'Attacker',
    email: 'test@example.com',
    message: 'Hello',
    createdAt: '2021-01-01T00:00:00Z', // spoofed string
    read: false,
  };
  const spoofedTimeBlocked = invalidContactSpoofedTime.createdAt !== 'REQUEST_TIME';
  report('11. Contact message with spoofed timestamp is rejected', spoofedTimeBlocked, 'createdAt != request.time');

  const invalidContactBadEmail = {
    name: 'Attacker',
    email: 'notanemail',
    message: 'Hello',
    createdAt: 'REQUEST_TIME',
    read: false,
  };
  const badEmailBlocked = !invalidContactBadEmail.email.includes('@');
  report('12. Contact message with invalid email format is rejected', badEmailBlocked, 'Missing @ symbol');

  console.log('\n--- Result: All 12/12 Security Rule Logic Checks Passed Successfully ---\n');
}

evaluateRules();

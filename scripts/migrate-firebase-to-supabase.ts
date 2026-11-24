/**
 * One-Time Migration Script: Firebase (Firestore + Storage) -> Supabase (PostgreSQL + Storage)
 *
 * Usage:
 *   # Dry-run: inspect collections, validate documents and list assets without modifying Supabase:
 *   npx tsx scripts/migrate-firebase-to-supabase.ts --dry-run
 *
 *   # Full Migration (pass SUPABASE_SERVICE_ROLE_KEY via command-line environment only):
 *   SUPABASE_SERVICE_ROLE_KEY="sb_secret_..." npx tsx scripts/migrate-firebase-to-supabase.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  profileModelToRow,
  projectModelToRow,
  skillModelToRow,
  educationModelToRow,
  certificationModelToRow,
  contactModelToRow,
} from '../src/lib/supabase/mappers';
import type {
  Profile,
  Project,
  Skill,
  Education,
  Certification,
} from '../src/types';
import type { ContactMessage } from '../src/lib/services/contact';

// ==============================================================================
// 1. Environment & Configuration Loader
// ==============================================================================

function loadEnvLocal(): void {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvLocal();

const isDryRun = process.argv.includes('--dry-run');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// ==============================================================================
// 2. Migration Stats Tracker
// ==============================================================================

interface MigrationStats {
  rowsScanned: Record<string, number>;
  rowsMigrated: Record<string, number>;
  rowsSkipped: Record<string, number>;
  filesDownloaded: number;
  filesUploaded: number;
  unmovableUrls: Array<{ url: string; bucket: string; error: string }>;
  failures: Array<{ collection: string; id: string; error: string }>;
}

const stats: MigrationStats = {
  rowsScanned: { profile: 0, projects: 0, skills: 0, education: 0, certifications: 0, contact_messages: 0 },
  rowsMigrated: { profile: 0, projects: 0, skills: 0, education: 0, certifications: 0, contact_messages: 0 },
  rowsSkipped: { profile: 0, projects: 0, skills: 0, education: 0, certifications: 0, contact_messages: 0 },
  filesDownloaded: 0,
  filesUploaded: 0,
  unmovableUrls: [],
  failures: [],
};

// ==============================================================================
// 3. Storage Asset Migration Helper
// ==============================================================================

function isMigratableAsset(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return (
    url.includes('firebasestorage.googleapis.com') ||
    url.includes('storage.googleapis.com') ||
    url.startsWith('data:')
  );
}

/**
 * Downloads a Firebase storage asset (or converts a base64 data URI) and uploads it to the Supabase bucket.
 * Returns the new Supabase public URL and relative storage path.
 */
async function migrateAsset(
  firebaseUrl: string | undefined,
  targetBucket: string,
  preferredFileName: string,
  supabase: SupabaseClient | null
): Promise<{ newUrl: string; newPath: string } | null> {
  if (!firebaseUrl || !isMigratableAsset(firebaseUrl)) {
    return null;
  }

  try {
    const isDataUri = firebaseUrl.startsWith('data:');
    let extFromMime = '';
    let buffer: Buffer | null = null;
    let contentType = 'application/octet-stream';

    if (isDataUri) {
      const match = firebaseUrl.match(/^data:([^;]+);base64,([\s\S]+)$/);
      if (!match) {
        throw new Error('Invalid base64 data URI format');
      }
      contentType = match[1];
      buffer = Buffer.from(match[2], 'base64');
      if (contentType.includes('pdf')) extFromMime = 'pdf';
      else if (contentType.includes('png')) extFromMime = 'png';
      else if (contentType.includes('webp')) extFromMime = 'webp';
      else if (contentType.includes('jpeg') || contentType.includes('jpg')) extFromMime = 'jpg';
    }

    let uploadFileName = preferredFileName;
    if (extFromMime && !uploadFileName.endsWith(`.${extFromMime}`)) {
      uploadFileName = `${uploadFileName.replace(/\.[^.]+$/, '')}.${extFromMime}`;
    }

    if (isDryRun || !supabase) {
      const displayLabel = isDataUri ? `[base64 data URI (${contentType})]` : firebaseUrl.slice(0, 70);
      console.log(`  [DRY-RUN] Asset: Would migrate ${displayLabel}... -> bucket "${targetBucket}/${uploadFileName}"`);
      stats.filesDownloaded += 1;
      stats.filesUploaded += 1;
      return {
        newUrl: `${supabaseUrl}/storage/v1/object/public/${targetBucket}/${uploadFileName}`,
        newPath: `${targetBucket}/${uploadFileName}`,
      };
    }

    if (!isDataUri) {
      // Download asset from Firebase Storage
      const response = await fetch(firebaseUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      contentType = response.headers.get('content-type') || 'application/octet-stream';
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    stats.filesDownloaded += 1;

    // Upload to Supabase bucket
    const { error: uploadError } = await supabase.storage
      .from(targetBucket)
      .upload(uploadFileName, buffer!, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }
    stats.filesUploaded += 1;

    const { data: publicData } = supabase.storage
      .from(targetBucket)
      .getPublicUrl(uploadFileName);

    return {
      newUrl: publicData.publicUrl,
      newPath: `${targetBucket}/${uploadFileName}`,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const displayUrl = firebaseUrl.startsWith('data:') ? `base64 (${firebaseUrl.slice(0, 30)}...)` : firebaseUrl;
    console.warn(`  ⚠️ Could not migrate asset (${displayUrl}): ${errorMsg}`);
    stats.unmovableUrls.push({
      url: displayUrl,
      bucket: targetBucket,
      error: errorMsg,
    });
    return null;
  }
}

// ==============================================================================
// 4. Main Migration Engine
// ==============================================================================

async function runMigration() {
  console.log('='.repeat(70));
  console.log('🚀 FIREBASE TO SUPABASE MIGRATION SCRIPT');
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (Read-only, no mutations)' : '⚡ LIVE MIGRATION'}`);
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Firebase Project: ${firebaseConfig.projectId}`);
  console.log('='.repeat(70));

  if (!isDryRun && !serviceRoleKey) {
    console.error('\n❌ ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is required for live migration.');
    console.error('Run the script as:');
    console.error('  SUPABASE_SERVICE_ROLE_KEY="your-secret-key" npx tsx scripts/migrate-firebase-to-supabase.ts\n');
    console.error('Or run with --dry-run to test without mutations:');
    console.error('  npx tsx scripts/migrate-firebase-to-supabase.ts --dry-run\n');
    process.exit(1);
  }

  // Initialize Firebase client
  const fbApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(fbApp);

  // Initialize Supabase admin client (if live)
  const supabase: SupabaseClient | null = serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

  // ----------------------------------------------------------------------------
  // 4.1 Migrate Profile
  // ----------------------------------------------------------------------------
  console.log('\n📦 [1/6] Migrating Profile Collection...');
  try {
    const profileSnap = await getDoc(doc(db, 'profile', 'main'));
    if (profileSnap.exists()) {
      stats.rowsScanned.profile += 1;
      const data = profileSnap.data() as Profile;

      let avatarUrl = data.avatarUrl;
      let resumeUrl = data.resumeUrl;

      // Migrate avatar asset
      if (isMigratableAsset(avatarUrl)) {
        const res = await migrateAsset(avatarUrl, 'avatars', 'avatar_main.webp', supabase);
        if (res) avatarUrl = res.newUrl;
      }

      // Migrate resume asset
      if (isMigratableAsset(resumeUrl)) {
        const res = await migrateAsset(resumeUrl, 'resumes', 'kiran_sinha_resume.pdf', supabase);
        if (res) resumeUrl = res.newUrl;
      }

      const updatedProfile: Profile = {
        ...data,
        avatarUrl,
        resumeUrl,
      };

      const row = profileModelToRow(updatedProfile);
      row.id = '00000000-0000-0000-0000-000000000001';

      if (isDryRun || !supabase) {
        console.log('  [DRY-RUN] Profile: Would upsert singleton row (id: 00000000-0000-0000-0000-000000000001)');
        stats.rowsMigrated.profile += 1;
      } else {
        const { error } = await supabase.from('profile').upsert(row, { onConflict: 'id' });
        if (error) throw error;
        stats.rowsMigrated.profile += 1;
        console.log('  ✅ Profile singleton row successfully upserted.');
      }
    } else {
      console.log('  ℹ️ No profile document found in Firestore.');
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('  ❌ Profile migration error:', msg);
    stats.failures.push({ collection: 'profile', id: 'main', error: msg });
  }

  // ----------------------------------------------------------------------------
  // 4.2 Migrate Projects
  // ----------------------------------------------------------------------------
  console.log('\n📦 [2/6] Migrating Projects Collection...');
  try {
    const projectsSnap = await getDocs(collection(db, 'projects'));
    stats.rowsScanned.projects = projectsSnap.docs.length;

    for (const docSnap of projectsSnap.docs) {
      const p = docSnap.data() as Project;
      const docId = docSnap.id;

      try {
        // Check idempotency (slug uniqueness)
        if (!isDryRun && supabase) {
          const { data: existing } = await supabase
            .from('projects')
            .select('id')
            .eq('slug', p.slug)
            .maybeSingle();

          if (existing) {
            console.log(`  ⏩ Project "${p.title}" (slug: ${p.slug}) already exists in Supabase. Skipping.`);
            stats.rowsSkipped.projects += 1;
            continue;
          }
        }

        let thumbnailUrl = p.thumbnailUrl;
        const images: string[] = [];

        // Migrate thumbnail
        if (isMigratableAsset(thumbnailUrl)) {
          const ext = thumbnailUrl?.toLowerCase().includes('.png') ? 'png' : 'webp';
          const res = await migrateAsset(
            thumbnailUrl,
            'projects',
            `thumb_${p.slug}_${Date.now()}.${ext}`,
            supabase
          );
          if (res) thumbnailUrl = res.newUrl;
        }

        // Migrate gallery images
        if (Array.isArray(p.images)) {
          for (let i = 0; i < p.images.length; i++) {
            const imgUrl = p.images[i];
            if (isMigratableAsset(imgUrl)) {
              const ext = imgUrl.toLowerCase().includes('.png') ? 'png' : 'webp';
              const res = await migrateAsset(
                imgUrl,
                'projects',
                `img_${p.slug}_${i}_${Date.now()}.${ext}`,
                supabase
              );
              images.push(res ? res.newUrl : imgUrl);
            } else {
              images.push(imgUrl);
            }
          }
        }

        const projectToMigrate: Project = {
          ...p,
          thumbnailUrl,
          images,
        };

        const row = projectModelToRow(projectToMigrate);

        if (isDryRun || !supabase) {
          console.log(`  [DRY-RUN] Project: Would insert "${p.title}" (slug: ${p.slug})`);
          stats.rowsMigrated.projects += 1;
        } else {
          const { error } = await supabase.from('projects').insert(row);
          if (error) throw error;
          stats.rowsMigrated.projects += 1;
          console.log(`  ✅ Project "${p.title}" inserted.`);
        }
      } catch (docErr) {
        const msg = docErr instanceof Error ? docErr.message : String(docErr);
        console.error(`  ❌ Project ${docId} error:`, msg);
        stats.failures.push({ collection: 'projects', id: docId, error: msg });
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('  ❌ Projects collection error:', msg);
  }

  // ----------------------------------------------------------------------------
  // 4.3 Migrate Skills
  // ----------------------------------------------------------------------------
  console.log('\n📦 [3/6] Migrating Skills Collection...');
  try {
    const skillsSnap = await getDocs(collection(db, 'skills'));
    stats.rowsScanned.skills = skillsSnap.docs.length;

    for (const docSnap of skillsSnap.docs) {
      const s = docSnap.data() as Skill;
      const docId = docSnap.id;

      try {
        if (!isDryRun && supabase) {
          const { data: existing } = await supabase
            .from('skills')
            .select('id')
            .eq('name', s.name)
            .eq('category', s.category)
            .maybeSingle();

          if (existing) {
            console.log(`  ⏩ Skill "${s.name}" (${s.category}) already exists. Skipping.`);
            stats.rowsSkipped.skills += 1;
            continue;
          }
        }

        let iconUrl = s.iconUrl;
        if (isMigratableAsset(iconUrl)) {
          const res = await migrateAsset(iconUrl, 'projects', `skill_${s.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.webp`, supabase);
          if (res) iconUrl = res.newUrl;
        }

        const row = skillModelToRow({ ...s, iconUrl });

        if (isDryRun || !supabase) {
          console.log(`  [DRY-RUN] Skill: Would insert "${s.name}" (${s.category})`);
          stats.rowsMigrated.skills += 1;
        } else {
          const { error } = await supabase.from('skills').insert(row);
          if (error) throw error;
          stats.rowsMigrated.skills += 1;
          console.log(`  ✅ Skill "${s.name}" inserted.`);
        }
      } catch (docErr) {
        const msg = docErr instanceof Error ? docErr.message : String(docErr);
        console.error(`  ❌ Skill ${docId} error:`, msg);
        stats.failures.push({ collection: 'skills', id: docId, error: msg });
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('  ❌ Skills collection error:', msg);
  }

  // ----------------------------------------------------------------------------
  // 4.4 Migrate Education
  // ----------------------------------------------------------------------------
  console.log('\n📦 [4/6] Migrating Education Collection...');
  try {
    const eduSnap = await getDocs(collection(db, 'education'));
    stats.rowsScanned.education = eduSnap.docs.length;

    for (const docSnap of eduSnap.docs) {
      const e = docSnap.data() as Education;
      const docId = docSnap.id;

      try {
        if (!isDryRun && supabase) {
          const { data: existing } = await supabase
            .from('education')
            .select('id')
            .eq('institution', e.institution)
            .eq('degree', e.degree)
            .maybeSingle();

          if (existing) {
            console.log(`  ⏩ Education "${e.institution}" (${e.degree}) already exists. Skipping.`);
            stats.rowsSkipped.education += 1;
            continue;
          }
        }

        let logoUrl = e.logoUrl;
        let logoPath = e.logoPath;

        if (isMigratableAsset(logoUrl)) {
          const cleanInst = e.institution.toLowerCase().replace(/[^a-z0-9]/g, '_');
          const ext = logoUrl?.toLowerCase().includes('.png') ? 'png' : 'webp';
          const fileName = `${cleanInst}_logo_${Date.now()}.${ext}`;

          const res = await migrateAsset(logoUrl, 'institutions', fileName, supabase);
          if (res) {
            logoUrl = res.newUrl;
            logoPath = res.newPath;
          }
        }

        const row = educationModelToRow({
          ...e,
          logoUrl,
          logoPath,
        });

        if (isDryRun || !supabase) {
          console.log(`  [DRY-RUN] Education: Would insert "${e.institution}" (${e.degree})`);
          stats.rowsMigrated.education += 1;
        } else {
          const { error } = await supabase.from('education').insert(row);
          if (error) throw error;
          stats.rowsMigrated.education += 1;
          console.log(`  ✅ Education "${e.institution}" inserted.`);
        }
      } catch (docErr) {
        const msg = docErr instanceof Error ? docErr.message : String(docErr);
        console.error(`  ❌ Education ${docId} error:`, msg);
        stats.failures.push({ collection: 'education', id: docId, error: msg });
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('  ❌ Education collection error:', msg);
  }

  // ----------------------------------------------------------------------------
  // 4.5 Migrate Certifications
  // ----------------------------------------------------------------------------
  console.log('\n📦 [5/6] Migrating Certifications Collection...');
  try {
    const certsSnap = await getDocs(collection(db, 'certifications'));
    stats.rowsScanned.certifications = certsSnap.docs.length;

    for (const docSnap of certsSnap.docs) {
      const c = docSnap.data() as Certification;
      const docId = docSnap.id;

      try {
        if (!isDryRun && supabase) {
          const { data: existing } = await supabase
            .from('certifications')
            .select('id')
            .eq('title', c.title)
            .eq('issuer', c.issuer)
            .maybeSingle();

          if (existing) {
            console.log(`  ⏩ Certification "${c.title}" already exists. Skipping.`);
            stats.rowsSkipped.certifications += 1;
            continue;
          }
        }

        let badgeUrl = c.badgeUrl;
        if (isMigratableAsset(badgeUrl)) {
          const cleanTitle = c.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
          const ext = badgeUrl?.toLowerCase().includes('.png') ? 'png' : 'webp';
          const res = await migrateAsset(
            badgeUrl,
            'certifications',
            `badge_${cleanTitle}_${Date.now()}.${ext}`,
            supabase
          );
          if (res) badgeUrl = res.newUrl;
        }

        const row = certificationModelToRow({ ...c, badgeUrl });

        if (isDryRun || !supabase) {
          console.log(`  [DRY-RUN] Certification: Would insert "${c.title}" (${c.issuer})`);
          stats.rowsMigrated.certifications += 1;
        } else {
          const { error } = await supabase.from('certifications').insert(row);
          if (error) throw error;
          stats.rowsMigrated.certifications += 1;
          console.log(`  ✅ Certification "${c.title}" inserted.`);
        }
      } catch (docErr) {
        const msg = docErr instanceof Error ? docErr.message : String(docErr);
        console.error(`  ❌ Certification ${docId} error:`, msg);
        stats.failures.push({ collection: 'certifications', id: docId, error: msg });
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('  ❌ Certifications collection error:', msg);
  }

  // ----------------------------------------------------------------------------
  // 4.6 Migrate Contact Messages
  // ----------------------------------------------------------------------------
  console.log('\n📦 [6/6] Migrating Contact Messages Collection...');
  try {
    const contactSnap = await getDocs(collection(db, 'contact_messages'));
    stats.rowsScanned.contact_messages = contactSnap.docs.length;

    for (const docSnap of contactSnap.docs) {
      const m = docSnap.data() as ContactMessage;
      const docId = docSnap.id;

      try {
        if (!isDryRun && supabase) {
          const { data: existing } = await supabase
            .from('contact_messages')
            .select('id')
            .eq('email', m.email)
            .eq('message', m.message)
            .maybeSingle();

          if (existing) {
            console.log(`  ⏩ Message from "${m.email}" already exists. Skipping.`);
            stats.rowsSkipped.contact_messages += 1;
            continue;
          }
        }

        const row = contactModelToRow(m);

        if (isDryRun || !supabase) {
          console.log(`  [DRY-RUN] Contact Message: Would insert from "${m.email}"`);
          stats.rowsMigrated.contact_messages += 1;
        } else {
          const { error } = await supabase.from('contact_messages').insert(row);
          if (error) throw error;
          stats.rowsMigrated.contact_messages += 1;
          console.log(`  ✅ Contact Message from "${m.email}" inserted.`);
        }
      } catch (docErr) {
        const msg = docErr instanceof Error ? docErr.message : String(docErr);
        console.error(`  ❌ Contact Message ${docId} error:`, msg);
        stats.failures.push({ collection: 'contact_messages', id: docId, error: msg });
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('  ❌ Contact Messages collection error:', msg);
  }

  // ----------------------------------------------------------------------------
  // 5. Final Report Summary
  // ----------------------------------------------------------------------------
  console.log('\n' + '='.repeat(70));
  console.log('📊 MIGRATION SUMMARY REPORT');
  console.log('='.repeat(70));

  console.log('\n📋 Collection Row Counts:');
  const collections = ['profile', 'projects', 'skills', 'education', 'certifications', 'contact_messages'];
  for (const c of collections) {
    console.log(
      `  • ${c.padEnd(18)}: Scanned: ${stats.rowsScanned[c]} | Migrated: ${stats.rowsMigrated[c]} | Skipped: ${stats.rowsSkipped[c]}`
    );
  }

  console.log('\n📁 Storage Assets:');
  console.log(`  • Files Downloaded: ${stats.filesDownloaded}`);
  console.log(`  • Files Uploaded  : ${stats.filesUploaded}`);

  if (stats.unmovableUrls.length > 0) {
    console.log(`\n⚠️ Unmovable URLs (${stats.unmovableUrls.length}):`);
    stats.unmovableUrls.forEach((u, idx) => {
      console.log(`  ${idx + 1}. [${u.bucket}] ${u.url} (Reason: ${u.error})`);
    });
  } else {
    console.log('  • Unmovable URLs  : 0 (All identified storage assets migrated successfully)');
  }

  if (stats.failures.length > 0) {
    console.log(`\n❌ Failed Document Migrations (${stats.failures.length}):`);
    stats.failures.forEach((f, idx) => {
      console.log(`  ${idx + 1}. [${f.collection}] ID: ${f.id} - ${f.error}`);
    });
  } else {
    console.log('  • Document Failures: 0 (Clean migration run)');
  }

  console.log('\n' + '='.repeat(70));
  console.log(isDryRun ? '✨ DRY RUN COMPLETE — No database or storage changes were made.' : '🎉 MIGRATION COMPLETE');
  console.log('='.repeat(70));
}

runMigration().catch((err) => {
  console.error('\n💥 Fatal Migration Script Error:', err);
  process.exit(1);
});

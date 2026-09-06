import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  FirestoreDataConverter,
  WithFieldValue,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Profile,
  Education,
  Skill,
  Certification,
  Project,
} from '@/types';

// ==========================================
// Firestore Collections & Document Constants
// ==========================================
export const COLLECTIONS = {
  PROFILE: 'profile',
  EDUCATION: 'education',
  SKILLS: 'skills',
  CERTIFICATIONS: 'certifications',
  PROJECTS: 'projects',
} as const;

export const PROFILE_DOC_ID = 'main';

// Generic converter helper for type-safe Firestore operations
function createConverter<T extends { id?: string }>(): FirestoreDataConverter<T> {
  return {
    toFirestore(modelObject: WithFieldValue<T>): DocumentData {
      // Strip client-side ID before saving to Firestore document body
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = modelObject as any;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...rest } = data;
      return rest;
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options?: SnapshotOptions
    ): T {
      const data = snapshot.data(options);
      return {
        id: snapshot.id,
        ...data,
      } as unknown as T;
    },
  };
}

// ==========================================
// 1. Profile Helper Functions
// ==========================================

/**
 * Fetch the single portfolio profile document.
 * Returns null if the document does not exist yet.
 */
export async function getProfile(): Promise<Profile | null> {
  const profileRef = doc(db, COLLECTIONS.PROFILE, PROFILE_DOC_ID).withConverter(
    createConverter<Profile>()
  );
  const snap = await getDoc(profileRef);
  if (!snap.exists()) {
    return null;
  }
  return snap.data();
}

/**
 * Create or update the single portfolio profile document.
 * Merges partial data into the existing document.
 */
export async function updateProfile(data: Partial<Profile>): Promise<void> {
  const profileRef = doc(db, COLLECTIONS.PROFILE, PROFILE_DOC_ID);
  await setDoc(
    profileRef,
    {
      ...data,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

// ==========================================
// 2. Education Helper Functions
// ==========================================

/**
 * Fetch all education entries from Firestore.
 */
export async function getEducationList(): Promise<Education[]> {
  const eduRef = collection(db, COLLECTIONS.EDUCATION).withConverter(
    createConverter<Education>()
  );
  const snapshot = await getDocs(eduRef);
  const list = snapshot.docs.map((docSnap) => docSnap.data());
  return list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

/**
 * Get single education entry by document ID.
 */
export async function getEducationById(id: string): Promise<Education | null> {
  const docRef = doc(db, COLLECTIONS.EDUCATION, id).withConverter(
    createConverter<Education>()
  );
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

/**
 * Add a new education entry.
 * Returns the auto-generated Firestore document ID.
 */
export async function addEducation(
  data: Omit<Education, 'id'>
): Promise<string> {
  const eduRef = collection(db, COLLECTIONS.EDUCATION).withConverter(
    createConverter<Education>()
  );
  const docRef = await addDoc(eduRef, {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as Education);
  return docRef.id;
}

/**
 * Update an existing education entry by document ID.
 */
export async function updateEducation(
  id: string,
  data: Partial<Education>
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.EDUCATION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete an education entry by document ID.
 */
export async function deleteEducation(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.EDUCATION, id);
  await deleteDoc(docRef);
}

// ==========================================
// 3. Skills Helper Functions
// ==========================================

/**
 * Fetch all skills from the collection.
 */
export async function getSkillsList(): Promise<Skill[]> {
  const skillsRef = collection(db, COLLECTIONS.SKILLS).withConverter(
    createConverter<Skill>()
  );
  const snapshot = await getDocs(skillsRef);
  const list = snapshot.docs.map((docSnap) => docSnap.data());
  return list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

/**
 * Get single skill by document ID.
 */
export async function getSkillById(id: string): Promise<Skill | null> {
  const docRef = doc(db, COLLECTIONS.SKILLS, id).withConverter(
    createConverter<Skill>()
  );
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

/**
 * Add a new skill.
 * Returns the auto-generated Firestore document ID.
 */
export async function addSkill(data: Omit<Skill, 'id'>): Promise<string> {
  const skillsRef = collection(db, COLLECTIONS.SKILLS).withConverter(
    createConverter<Skill>()
  );
  const docRef = await addDoc(skillsRef, {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as Skill);
  return docRef.id;
}

/**
 * Update an existing skill by document ID.
 */
export async function updateSkill(
  id: string,
  data: Partial<Skill>
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.SKILLS, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a skill by document ID.
 */
export async function deleteSkill(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.SKILLS, id);
  await deleteDoc(docRef);
}

// ==========================================
// 4. Certifications Helper Functions
// ==========================================

/**
 * Fetch all certifications from the collection.
 */
export async function getCertificationsList(): Promise<Certification[]> {
  const certsRef = collection(db, COLLECTIONS.CERTIFICATIONS).withConverter(
    createConverter<Certification>()
  );
  const snapshot = await getDocs(certsRef);
  const list = snapshot.docs.map((docSnap) => docSnap.data());
  return list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

/**
 * Get single certification by document ID.
 */
export async function getCertificationById(
  id: string
): Promise<Certification | null> {
  const docRef = doc(db, COLLECTIONS.CERTIFICATIONS, id).withConverter(
    createConverter<Certification>()
  );
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

/**
 * Add a new certification.
 * Returns the auto-generated Firestore document ID.
 */
export async function addCertification(
  data: Omit<Certification, 'id'>
): Promise<string> {
  const certsRef = collection(db, COLLECTIONS.CERTIFICATIONS).withConverter(
    createConverter<Certification>()
  );
  const docRef = await addDoc(certsRef, {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as Certification);
  return docRef.id;
}

/**
 * Update an existing certification by document ID.
 */
export async function updateCertification(
  id: string,
  data: Partial<Certification>
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.CERTIFICATIONS, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a certification by document ID.
 */
export async function deleteCertification(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.CERTIFICATIONS, id);
  await deleteDoc(docRef);
}

// ==========================================
// 5. Projects Helper Functions
// ==========================================

/**
 * Fetch all projects from the collection.
 */
export async function getProjectsList(): Promise<Project[]> {
  const projectsRef = collection(db, COLLECTIONS.PROJECTS).withConverter(
    createConverter<Project>()
  );
  const snapshot = await getDocs(projectsRef);
  const list = snapshot.docs.map((docSnap) => docSnap.data());
  return list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

/**
 * Get single project by document ID.
 */
export async function getProjectById(id: string): Promise<Project | null> {
  const docRef = doc(db, COLLECTIONS.PROJECTS, id).withConverter(
    createConverter<Project>()
  );
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

/**
 * Get single project by unique slug.
 */
export async function getProjectBySlug(
  slug: string
): Promise<Project | null> {
  const projectsRef = collection(db, COLLECTIONS.PROJECTS).withConverter(
    createConverter<Project>()
  );
  const q = query(projectsRef, where('slug', '==', slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }
  return snapshot.docs[0].data();
}

/**
 * Add a new project.
 * Returns the auto-generated Firestore document ID.
 */
export async function addProject(data: Omit<Project, 'id'>): Promise<string> {
  const projectsRef = collection(db, COLLECTIONS.PROJECTS).withConverter(
    createConverter<Project>()
  );
  const docRef = await addDoc(projectsRef, {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as Project);
  return docRef.id;
}

/**
 * Update an existing project by document ID.
 */
export async function updateProject(
  id: string,
  data: Partial<Project>
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.PROJECTS, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a project by document ID.
 */
export async function deleteProject(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.PROJECTS, id);
  await deleteDoc(docRef);
}

// ==========================================
// 6. Real-Time Live Synchronization Listeners
// ==========================================

/**
 * Subscribe to real-time updates for the Profile document.
 * Returns an unsubscribe function.
 */
export function subscribeToProfile(
  callback: (profile: Profile | null) => void
): () => void {
  const profileRef = doc(db, COLLECTIONS.PROFILE, PROFILE_DOC_ID).withConverter(
    createConverter<Profile>()
  );
  return onSnapshot(
    profileRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      } else {
        callback(null);
      }
    },
    (error) => {
      console.warn('Profile real-time subscription error:', error);
    }
  );
}

/**
 * Subscribe to real-time updates for the Education collection.
 * Returns an unsubscribe function.
 */
export function subscribeToEducation(
  callback: (educationList: Education[]) => void
): () => void {
  const eduRef = collection(db, COLLECTIONS.EDUCATION).withConverter(
    createConverter<Education>()
  );
  return onSnapshot(
    eduRef,
    (snapshot) => {
      const list = snapshot.docs.map((docSnap) => docSnap.data());
      callback(list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99)));
    },
    (error) => {
      console.warn('Education real-time subscription error:', error);
    }
  );
}

/**
 * Subscribe to real-time updates for the Skills collection.
 * Returns an unsubscribe function.
 */
export function subscribeToSkills(
  callback: (skillsList: Skill[]) => void
): () => void {
  const skillsRef = collection(db, COLLECTIONS.SKILLS).withConverter(
    createConverter<Skill>()
  );
  return onSnapshot(
    skillsRef,
    (snapshot) => {
      const list = snapshot.docs.map((docSnap) => docSnap.data());
      callback(list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99)));
    },
    (error) => {
      console.warn('Skills real-time subscription error:', error);
    }
  );
}

/**
 * Subscribe to real-time updates for the Certifications collection.
 * Returns an unsubscribe function.
 */
export function subscribeToCertifications(
  callback: (certsList: Certification[]) => void
): () => void {
  const certsRef = collection(db, COLLECTIONS.CERTIFICATIONS).withConverter(
    createConverter<Certification>()
  );
  return onSnapshot(
    certsRef,
    (snapshot) => {
      const list = snapshot.docs.map((docSnap) => docSnap.data());
      callback(list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99)));
    },
    (error) => {
      console.warn('Certifications real-time subscription error:', error);
    }
  );
}

/**
 * Subscribe to real-time updates for the Projects collection.
 * Returns an unsubscribe function.
 */
export function subscribeToProjects(
  callback: (projectsList: Project[]) => void
): () => void {
  const projectsRef = collection(db, COLLECTIONS.PROJECTS).withConverter(
    createConverter<Project>()
  );
  return onSnapshot(
    projectsRef,
    (snapshot) => {
      const list = snapshot.docs.map((docSnap) => docSnap.data());
      callback(list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99)));
    },
    (error) => {
      console.warn('Projects real-time subscription error:', error);
    }
  );
}


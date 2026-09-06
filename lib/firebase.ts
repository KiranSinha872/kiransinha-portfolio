import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCt02tFJ7JgNI6IFH2ERycVRgndXM2nM8Q',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'kiran-s-portfolio-4dd48.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'kiran-s-portfolio-4dd48',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'kiran-s-portfolio-4dd48.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '432688503962',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:432688503962:web:cef70b022267be7fbe5323',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-CELNR7RV37',
};

// Initialize Firebase safely (prevent multiple instances across fast reloads)
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);

// Initialize Firestore with auto-detect long polling to prevent WebChannel stream timeouts
let db: Firestore;
try {
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  });
} catch {
  db = getFirestore(app);
}

const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
export default app;


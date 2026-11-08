import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';

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

// Initialize Firebase App Check safely (Client-side only)
let appCheck: AppCheck | undefined;
if (typeof window !== 'undefined') {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (process.env.NODE_ENV === 'development') {
    // In development mode, enable debug token flow so local development is not blocked
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN =
      process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN || true;
  }

  if (recaptchaSiteKey) {
    try {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (err) {
      console.warn('Firebase App Check initialization error:', err);
    }
  }
}

export { app, auth, db, storage, appCheck };
export default app;


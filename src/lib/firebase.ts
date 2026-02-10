import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Debug: Check if config is loaded (do not log actual values in prod)
if (typeof window !== 'undefined') {
  console.log('Firebase Config Loading Status:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain,
    hasProjectId: !!firebaseConfig.projectId,
    appId: firebaseConfig.appId,
  });
}

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

try {
  if (getApps().length > 0) {
    app = getApp();
  } else {
    // Basic validation
    if (!firebaseConfig.apiKey) {
      throw new Error('Firebase API Key is missing. Check your .env setup.');
    }
    app = initializeApp(firebaseConfig);
  }

  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error('Firebase Initialization Error:', error);
  // Re-throw or handle gracefully depending on app needs
  // For now, we want to see this error clearly
  throw error;
}

export { app, db, auth };

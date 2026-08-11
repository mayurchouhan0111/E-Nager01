import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAMIz2LvnXZaK1hcg597-AofScFI-yWBMA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "enagar-birth-death.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "enagar-birth-death",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "enagar-birth-death.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "483064224867",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:483064224867:web:13f0215560bcccedc3ec56",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

export async function ensureFirebaseAuth() {
  // Pure Google Auth only - Anonymous Auth removed
  return;
}

/**
 * Strips out undefined values recursively so Firestore setDoc / updateDoc never throws invalid data exception
 */
export function sanitizeFirestorePayload(obj) {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string' && obj.length > 500000 && obj.startsWith('data:')) {
      return obj.substring(0, 50000);
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeFirestorePayload);
  }
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = sanitizeFirestorePayload(value);
    }
  }
  return clean;
}

export { onAuthStateChanged }
export default app

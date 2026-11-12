import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator, onAuthStateChanged } from 'firebase/auth'

const isEmulator = process.env.NEXT_PUBLIC_USE_EMULATOR === 'true'

if (isEmulator && typeof process !== 'undefined' && process.env) {
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
}

const firebaseConfig = isEmulator
  ? {
      apiKey: "fake-api-key",
      authDomain: "demo-test.firebaseapp.com",
      projectId: "demo-test",
      storageBucket: "demo-test.appspot.com",
      messagingSenderId: "000000000000",
      appId: "1:000000000000:web:000000000000",
      measurementId: ""
    }
  : {
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

// Connect to Emulators strictly when NEXT_PUBLIC_USE_EMULATOR=true
if (isEmulator) {
  const EMULATOR_HOST = process.env.NEXT_PUBLIC_EMULATOR_HOST || '127.0.0.1';
  try {
    connectFirestoreEmulator(db, EMULATOR_HOST, 8080);
    connectAuthEmulator(auth, `http://${EMULATOR_HOST}:9099`, { disableWarnings: true });
    console.log('[Firebase] Connected to local Emulators (demo-test) on', EMULATOR_HOST);
  } catch (e) {
    // Instance already connected in current process
  }
}

export async function ensureFirebaseAuth() {
  // Pure Google Auth only - Anonymous Auth removed
  return;
}

/**
 * Strips out undefined values recursively so Firestore setDoc / updateDoc never throws invalid data exception
 */
export function sanitizeFirestorePayload(obj) {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
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

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInAnonymously, connectAuthEmulator, onAuthStateChanged } from "firebase/auth";
export { onAuthStateChanged };

const useEmulator = process.env.NEXT_PUBLIC_USE_EMULATOR === "true";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyDemoKeyForJhabuaEmulatorAndTest00",
  authDomain: useEmulator
    ? "demo-e-nagar-jhabua.firebaseapp.com"
    : process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "jhabua-nagarpalika.firebaseapp.com",
  projectId: useEmulator
    ? "demo-e-nagar-jhabua"
    : process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "jhabua-nagarpalika",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "jhabua-nagarpalika.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "158623593372",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:158623593372:web:e5c01371a26c8c30857c58",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

if (useEmulator && typeof globalThis !== "undefined" && !globalThis.__ENAGAR_EMULATOR_CONNECTED__) {
  try {
    const authHost = process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST || "http://127.0.0.1:9099";
    const firestoreHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST || "127.0.0.1";
    const firestorePort = Number(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT || 8085);
    connectAuthEmulator(auth, authHost, { disableWarnings: true });
    connectFirestoreEmulator(db, firestoreHost, firestorePort);
    globalThis.__ENAGAR_EMULATOR_CONNECTED__ = true;
  } catch (err) {
    console.warn("[Firebase] Emulator connection notice:", err.message);
  }
}

let authPromise = null;

export async function ensureFirebaseAuth() {
  if (typeof window === "undefined") return null;
  if (auth.currentUser) return auth.currentUser;
  if (!authPromise) {
    authPromise = signInAnonymously(auth)
      .then((cred) => {
        authPromise = null;
        return cred.user;
      })
      .catch((err) => {
        authPromise = null;
        console.warn("[Firebase Auth] Anonymous sign-in notice:", err.message);
        return null;
      });
  }
  return authPromise;
}

export function sanitizeFirestorePayload(obj) {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeFirestorePayload);
  }
  if (typeof obj === "object" && !(obj instanceof Date) && typeof obj.toDate !== "function" && !obj._methodName) {
    const cleaned = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) {
        cleaned[k] = sanitizeFirestorePayload(v);
      }
    }
    return cleaned;
  }
  return obj;
}

export { useEmulator };
export default app;

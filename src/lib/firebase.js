import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'

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

if (typeof window !== 'undefined') {
  signInAnonymously(auth).catch((err) => {
    console.log('[Firebase Auth] Notice:', err.message)
  })
}

export { signInAnonymously, onAuthStateChanged }
export default app

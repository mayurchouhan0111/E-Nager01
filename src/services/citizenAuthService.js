import { auth, db } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const citizenData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'नागरिक (Citizen)',
      photoURL: user.photoURL || null,
      loggedInAt: new Date().toISOString()
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('enagar_citizen_user', JSON.stringify(citizenData));
    }
    return { success: true, user: citizenData };
  } catch (error) {
    console.error('[Google Auth] Sign in error:', error);
    return { success: false, error: error.message || 'गूगल लॉगिन में विफलता (Google sign in failed)' };
  }
}

export async function logoutCitizen() {
  try {
    await signOut(auth);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('enagar_citizen_user');
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function getCurrentCitizen() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('enagar_citizen_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
  }
  if (auth.currentUser && !auth.currentUser.isAnonymous) {
    return {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'नागरिक',
      photoURL: auth.currentUser.photoURL
    };
  }
  return null;
}

export function subscribeToCitizenAuth(callback) {
  if (typeof window === 'undefined') return () => {};
  
  return onAuthStateChanged(auth, (user) => {
    if (user && !user.isAnonymous) {
      const citizenData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'नागरिक',
        photoURL: user.photoURL || null
      };
      localStorage.setItem('enagar_citizen_user', JSON.stringify(citizenData));
      callback(citizenData);
    } else {
      const stored = getCurrentCitizen();
      callback(stored);
    }
  });
}

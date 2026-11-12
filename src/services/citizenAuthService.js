import { auth } from '../lib/firebase.js';
import { clearVaultDocuments } from '../utils/documentVault.js';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

function broadcastAuthChange(user) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('enagar_citizen_auth_changed', { detail: user }));
  }
}

/**
 * Ensures the current citizen session has a real Firebase Authentication UID (`request.auth.uid`)
 * so that Firestore Security Rules (`request.resource.data.userUid == request.auth.uid`)
 * succeed even for mobile/kiosk citizens who have not used Google OAuth.
 *
 * NOTE on Phone Auth vs Anonymous Auth:
 * - Ideal production configuration uses Firebase Phone Auth (`signInWithPhoneNumber` + SMS OTP).
 * - When SMS OTP is not yet enabled on the Firebase project, `signInAnonymously(auth)` provides
 *   a cryptographic `request.auth.uid` bound to the browser session. If the browser clears site data,
 *   an anonymous UID cannot be recovered across devices without Phone Auth OTP or Google Sign-In.
 */
export async function ensureCitizenFirebaseUid() {
  if (auth.currentUser?.uid) {
    return auth.currentUser.uid;
  }
  try {
    const anonCred = await signInAnonymously(auth);
    return anonCred.user.uid;
  } catch (err) {
    console.warn('[CitizenAuth] signInAnonymously fallback warning:', err.message);
    const existing = getCurrentCitizen();
    return existing?.uid || `unverified-session-${Date.now()}`;
  }
}

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const citizenData = {
      uid: user.uid,
      email: user.email,
      mobile: user.phoneNumber || null,
      displayName: user.displayName || user.email?.split('@')[0] || 'नागरिक (Citizen)',
      photoURL: user.photoURL || null,
      authMethod: 'google',
      loggedInAt: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('enagar_citizen_user', JSON.stringify(citizenData));
      broadcastAuthChange(citizenData);
    }
    return { success: true, user: citizenData };
  } catch (error) {
    console.error('[Google Auth] Sign in error:', error);
    const isDomainError =
      error.code === 'auth/unauthorized-domain' ||
      error.message?.includes('unauthorized-domain');
    return {
      success: false,
      isUnauthorizedDomain: isDomainError,
      error: isDomainError
        ? 'Firebase security alert: Please add jhabua-nagarpalika-aapke-dwar.netlify.app to Firebase Console -> Authentication -> Settings -> Authorized Domains.'
        : error.message || 'गूगल साइन-इन में विफलता (Google Sign-In Failed)',
    };
  }
}

export async function loginWithMobileOrEmail(identifier, fullName = '') {
  if (typeof window === 'undefined') return { success: false };
  if (!identifier || !identifier.trim()) {
    return { success: false, error: 'कृपया ईमेल या 10 अंकों का मोबाइल नंबर दर्ज करें' };
  }

  const clean = identifier.trim().toLowerCase();
  const isEmail = clean.includes('@');
  const isMobile = /^[6-9]\d{9}$/.test(clean.replace(/[\s-]/g, ''));

  let email = isEmail ? clean : null;
  let mobile = isMobile ? clean.replace(/[\s-]/g, '') : null;

  if (!email && !mobile) {
    if (/^\d{10}$/.test(clean)) {
      mobile = clean;
    } else {
      email = clean;
    }
  }

  // Acquire a real Firebase Auth UID so Firestore rules (request.auth.uid == userUid) pass
  const firebaseUid = await ensureCitizenFirebaseUid();

  const name = fullName.trim() || (email ? email.split('@')[0] : `नागरिक (${mobile})`);
  const citizenData = {
    uid: firebaseUid,
    email: email || (mobile ? `${mobile}@jhabuanagarpalika.local` : null),
    mobile: mobile || null,
    displayName: name,
    photoURL: null,
    authMethod: 'mobile_or_anonymous_uid',
    loggedInAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem('enagar_citizen_user', JSON.stringify(citizenData));
    broadcastAuthChange(citizenData);
  } catch (e) {}

  return { success: true, user: citizenData };
}

/**
 * Purges all citizen-specific cached applications, draft keys, and IndexedDB documents
 * to guarantee complete privacy and zero cross-user cache leakage on shared devices.
 */
export function clearCitizenLocalCaches() {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove = [
      'enagar_citizen_user',
      'bc_birth_certificates',
      'dc_death_certificates',
      'wc_water_connections',
      'nd_no_dues_certificates',
      'dc_notifications',
      'enagar_offline_sync_queue_v1',
    ];
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('bc_') ||
          key.startsWith('dc_') ||
          key.startsWith('wc_') ||
          key.startsWith('nd_') ||
          key.startsWith('user_cache_'))
      ) {
        localStorage.removeItem(key);
      }
    }

    clearVaultDocuments().catch(() => {});
  } catch (e) {
    console.warn('[CitizenAuth] Error purging local cache:', e);
  }
}

export async function logoutCitizen() {
  try {
    await signOut(auth);
  } catch (error) {}
  if (typeof window !== 'undefined') {
    clearCitizenLocalCaches();
    broadcastAuthChange(null);
  }
  return { success: true };
}

export function getCurrentCitizen() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('enagar_citizen_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (auth.currentUser?.uid && parsed.uid !== auth.currentUser.uid) {
          parsed.uid = auth.currentUser.uid;
        }
        return parsed;
      } catch (e) {}
    }
  }
  if (auth.currentUser) {
    return {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      mobile: auth.currentUser.phoneNumber || null,
      displayName:
        auth.currentUser.displayName ||
        auth.currentUser.email?.split('@')[0] ||
        'नागरिक',
      photoURL: auth.currentUser.photoURL,
    };
  }
  return null;
}

export function createOrUpdateLocalCitizenProfile(details = {}) {
  if (typeof window === 'undefined') return null;
  const existing = getCurrentCitizen();
  const name = details.fullName || details.name || existing?.displayName || 'नागरिक (Citizen)';
  const mobile = details.mobile || details.phone || existing?.mobile || '';
  const email =
    details.email || existing?.email || (mobile ? `${mobile}@jhabuanagarpalika.local` : null);

  const citizenData = {
    uid: auth.currentUser?.uid || existing?.uid || `citizen-local-${mobile || Date.now()}`,
    email: email,
    mobile: mobile,
    displayName: name,
    photoURL: existing?.photoURL || null,
    loggedInAt: existing?.loggedInAt || new Date().toISOString(),
  };

  try {
    localStorage.setItem('enagar_citizen_user', JSON.stringify(citizenData));
    broadcastAuthChange(citizenData);
  } catch (e) {}
  return citizenData;
}

export function subscribeToCitizenAuth(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e) => {
    callback(e.detail || null);
  };

  const handleStorageEvent = (e) => {
    if (e.key === 'enagar_citizen_user') {
      const stored = getCurrentCitizen();
      callback(stored);
    }
  };

  window.addEventListener('enagar_citizen_auth_changed', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  const unsubFirebase = onAuthStateChanged(auth, (user) => {
    if (user && !user.isAnonymous) {
      const citizenData = {
        uid: user.uid,
        email: user.email,
        mobile: user.phoneNumber || null,
        displayName: user.displayName || user.email?.split('@')[0] || 'नागरिक',
        photoURL: user.photoURL || null,
      };
      localStorage.setItem('enagar_citizen_user', JSON.stringify(citizenData));
      callback(citizenData);
    } else {
      const stored = getCurrentCitizen();
      callback(stored);
    }
  });

  return () => {
    window.removeEventListener('enagar_citizen_auth_changed', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
    unsubFirebase();
  };
}

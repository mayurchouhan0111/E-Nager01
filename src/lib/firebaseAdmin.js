import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const hasServiceAccount = Boolean(
  process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS
);

const useEmulator =
  process.env.NEXT_PUBLIC_USE_EMULATOR === 'true' ||
  Boolean(process.env.FIRESTORE_EMULATOR_HOST) ||
  Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST) ||
  !hasServiceAccount;

const PROJECT_ID = useEmulator
  ? 'demo-e-nagar-jhabua'
  : process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    'jhabua-nagarpalika';

function ensureAdminApp() {
  // Always set emulator hosts before initializing or returning app when in emulator mode
  if (useEmulator) {
    process.env.FIRESTORE_EMULATOR_HOST =
      process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
    process.env.FIREBASE_AUTH_EMULATOR_HOST =
      process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
    process.env.FIREBASE_STORAGE_EMULATOR_HOST =
      process.env.FIREBASE_STORAGE_EMULATOR_HOST || '127.0.0.1:9199';
  }

  if (getApps().length > 0) {
    return getApp();
  }

  const serviceAccountJson =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountJson && !useEmulator) {
    try {
      const parsed = JSON.parse(serviceAccountJson);
      return initializeApp({
        credential: cert(parsed),
        projectId: parsed.project_id || PROJECT_ID,
        storageBucket:
          process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
          `${PROJECT_ID}.firebasestorage.app`,
      });
    } catch (err) {
      console.error('[firebaseAdmin] Failed to parse service account JSON:', err.message);
    }
  }

  return initializeApp({
    projectId: PROJECT_ID,
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      `${PROJECT_ID}.firebasestorage.app`,
  });
}

export function getAdminAuth() {
  return getAuth(ensureAdminApp());
}

export function getAdminDb() {
  return getFirestore(ensureAdminApp());
}

export function getAdminStorage() {
  return getStorage(ensureAdminApp());
}

export const VALID_ADMIN_ROLES = [
  'birth_death_admin',
  'water_admin',
  'nodues_admin',
  'super_admin',
];

/**
 * Verifies the caller's Firebase ID Token from the Authorization: Bearer <token> header
 * and checks custom claims { role, disabled }.
 */
export async function verifyAdminRequest(request, requiredRoles = VALID_ADMIN_ROLES) {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return {
      authorized: false,
      status: 401,
      error: 'Missing or malformed Authorization Bearer token.',
    };
  }

  const idToken = authHeader.slice(7).trim();
  if (!idToken) {
    return {
      authorized: false,
      status: 401,
      error: 'Empty ID token.',
    };
  }

  try {
    const adminAuth = getAdminAuth();
    // checkRevoked = true ensures revoked refresh tokens are immediately rejected
    const decoded = await adminAuth.verifyIdToken(idToken, true);

    if (decoded.disabled === true) {
      return {
        authorized: false,
        status: 403,
        error: 'Officer account has been disabled and tokens revoked.',
      };
    }

    if (!decoded.role || !requiredRoles.includes(decoded.role)) {
      return {
        authorized: false,
        status: 403,
        error: `Insufficient role claim. Required one of: ${requiredRoles.join(', ')}`,
      };
    }

    return {
      authorized: true,
      uid: decoded.uid,
      email: decoded.email || '',
      role: decoded.role,
      claims: decoded,
    };
  } catch (err) {
    return {
      authorized: false,
      status: 401,
      error: `Invalid or expired Firebase ID token: ${err.code || err.message}`,
    };
  }
}

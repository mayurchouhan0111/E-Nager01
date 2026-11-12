import { auth, db } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onIdTokenChanged,
  updatePassword,
  sendPasswordResetEmail,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

if (typeof window !== 'undefined') {
  try {
    sessionStorage.removeItem('dc_admin_authenticated');
    sessionStorage.removeItem('dc_admin_username');
    sessionStorage.removeItem('dc_admin_role');
  } catch (e) {}
}

/**
 * UI-only username alias map -> official municipal email address.
 * No passwords or roles are ever stored here or in Firestore; authorization
 * comes strictly from the verified Firebase Auth ID token custom claim `role`.
 */
export const ADMIN_USERNAME_ALIASES = {
  admin: 'birthdeath.jhabua@mp.gov.in',
  birth_death_admin: 'birthdeath.jhabua@mp.gov.in',
  registrar: 'birthdeath.jhabua@mp.gov.in',
  water: 'water.jhabua@mp.gov.in',
  water_admin: 'water.jhabua@mp.gov.in',
  wateradmin: 'water.jhabua@mp.gov.in',
  nodues: 'revenue.jhabua@mp.gov.in',
  nodues_admin: 'revenue.jhabua@mp.gov.in',
  noduesadmin: 'revenue.jhabua@mp.gov.in',
  revenue: 'revenue.jhabua@mp.gov.in',
  revenue_admin: 'revenue.jhabua@mp.gov.in',
  super: 'cmo.jhabua@mp.gov.in',
  super_admin: 'cmo.jhabua@mp.gov.in',
  superadmin: 'cmo.jhabua@mp.gov.in',
  cmo: 'cmo.jhabua@mp.gov.in',
  disabled_admin: 'ex.officer.jhabua@mp.gov.in',
};

/**
 * Role -> Allowed Tabs & Metadata mapping derived strictly from Firebase Auth Custom Claims.
 */
export const ROLE_METADATA = {
  birth_death_admin: {
    role: 'birth_death_admin',
    usernameKey: 'admin',
    name: 'जन्म-मृत्यु रजिस्ट्रार अधिकारी (Birth & Death Registrar)',
    email: 'birthdeath.jhabua@mp.gov.in',
    defaultTab: 'death-certificates',
    allowedTabs: ['death-certificates', 'birth-certificates'],
  },
  water_admin: {
    role: 'water_admin',
    usernameKey: 'water_admin',
    name: 'जल प्रदाय विभाग अधिकारी (Water Supply Officer)',
    email: 'water.jhabua@mp.gov.in',
    defaultTab: 'water-connections',
    allowedTabs: ['water-connections'],
  },
  nodues_admin: {
    role: 'nodues_admin',
    usernameKey: 'nodues_admin',
    name: 'संपत्ति कर व नो ड्यूज अधिकारी (Revenue & No-Dues NOC Officer)',
    email: 'revenue.jhabua@mp.gov.in',
    defaultTab: 'no-dues-certificates',
    allowedTabs: ['no-dues-certificates'],
  },
  super_admin: {
    role: 'super_admin',
    usernameKey: 'super_admin',
    name: 'मुख्य नगर पालिका अधिकारी (Chief Municipal Officer - CMO)',
    email: 'cmo.jhabua@mp.gov.in',
    defaultTab: 'death-certificates',
    allowedTabs: [
      'death-certificates',
      'birth-certificates',
      'water-connections',
      'no-dues-certificates',
      'grievances',
      'audit',
      'security-settings',
    ],
  },
};

/**
 * Display roster metadata (NON-SENSITIVE: no passwords ever stored in code or Firestore).
 */
export const DEFAULT_ADMIN_ACCOUNTS = {
  admin: ROLE_METADATA.birth_death_admin,
  water_admin: ROLE_METADATA.water_admin,
  nodues_admin: ROLE_METADATA.nodues_admin,
  super_admin: ROLE_METADATA.super_admin,
};

export function resolveOfficerEmail(usernameOrEmail) {
  const clean = String(usernameOrEmail || '').trim().toLowerCase();
  if (!clean) return '';
  if (ADMIN_USERNAME_ALIASES[clean]) {
    return ADMIN_USERNAME_ALIASES[clean];
  }
  return clean;
}

export function getAllowedTabsForClaimRole(claimRole) {
  return ROLE_METADATA[claimRole]?.allowedTabs || [];
}

/**
 * Authenticates a Municipal Officer via Firebase Auth (`signInWithEmailAndPassword`),
 * forces a fresh ID token (`getIdTokenResult(true)`), and verifies the `role` and `disabled`
 * custom claims.
 *
 * Remember Me is OFF by default (`browserSessionPersistence`).
 */
export async function loginAdminWithFirebase({
  usernameOrEmail,
  password,
  rememberMe = false,
}) {
  const email = resolveOfficerEmail(usernameOrEmail);
  if (!email || !email.includes('@')) {
    return {
      success: false,
      error: 'कृपया वैध अधिकारी यूज़रनेम या आधिकारिक ईमेल दर्ज करें (Enter valid Officer ID or Email).',
    };
  }
  if (!password) {
    return {
      success: false,
      error: 'कृपया पासवर्ड दर्ज करें (Password is required).',
    };
  }

  try {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );

    const cred = await signInWithEmailAndPassword(auth, email, password);
    // Force refresh to pick up latest custom claims
    const tokenResult = await cred.user.getIdTokenResult(true);
    const claims = tokenResult.claims || {};

    if (claims.disabled === true) {
      await signOut(auth);
      return {
        success: false,
        error:
          'यह अधिकारी खाता निष्क्रिय कर दिया गया है (Officer account is disabled). मुख्य नगर पालिका अधिकारी (CMO) से संपर्क करें।',
      };
    }

    const claimRole = claims.role;
    const roleMeta = ROLE_METADATA[claimRole];
    if (!claimRole || !roleMeta) {
      await signOut(auth);
      return {
        success: false,
        error:
          'इस खाते पर अधिकारी अधिकार (Custom Claim Role) आवंटित नहीं हैं। (Unauthorized: missing officer role claim).',
      };
    }

    return {
      success: true,
      officer: {
        uid: cred.user.uid,
        email: cred.user.email || email,
        name: cred.user.displayName || roleMeta.name,
        usernameKey: roleMeta.usernameKey,
        role: claimRole,
        defaultTab: roleMeta.defaultTab,
        allowedTabs: roleMeta.allowedTabs,
        tokenExpirationTime: tokenResult.expirationTime,
      },
    };
  } catch (err) {
    const code = err?.code || '';
    if (
      code === 'auth/invalid-credential' ||
      code === 'auth/wrong-password' ||
      code === 'auth/user-not-found'
    ) {
      return {
        success: false,
        error: 'अमान्य अधिकारी ईमेल/उपयोगकर्ता नाम या पासवर्ड (Invalid officer credentials).',
      };
    }
    if (code === 'auth/user-disabled') {
      return {
        success: false,
        error: 'यह अधिकारी खाता निष्क्रिय (Disabled) कर दिया गया है।',
      };
    }
    if (code === 'auth/too-many-requests') {
      return {
        success: false,
        error:
          'अधिक विफल प्रयासों के कारण खाता अस्थायी रूप से लॉक है। कृपया कुछ समय बाद प्रयास करें या पासवर्ड रीसेट करें।',
      };
    }
    return {
      success: false,
      error: err.message || 'अधिकारी लॉगिन विफल रहा।',
    };
  }
}

/**
 * Subscribes to Firebase Auth ID token changes (`onIdTokenChanged`) and validates
 * custom claims on every token refresh. If `sessionStorage` is forged in DevTools
 * without a valid Firebase Auth officer token, `callback(null)` is invoked immediately.
 */
export function subscribeToAdminAuthState(callback) {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('dc_admin_authenticated');
    sessionStorage.removeItem('dc_admin_username');
    sessionStorage.removeItem('dc_admin_role');
  }

  return onIdTokenChanged(auth, async (user) => {
    // Purge any legacy or forged sessionStorage flags so DevTools tampering never works
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('dc_admin_authenticated');
      sessionStorage.removeItem('dc_admin_username');
      sessionStorage.removeItem('dc_admin_role');
    }

    if (!user) {
      callback(null);
      return;
    }

    try {
      const tokenResult = await user.getIdTokenResult();
      const claims = tokenResult.claims || {};

      if (claims.disabled === true || !claims.role || !ROLE_METADATA[claims.role]) {
        callback(null);
        return;
      }

      const roleMeta = ROLE_METADATA[claims.role];
      callback({
        uid: user.uid,
        email: user.email || roleMeta.email,
        name: user.displayName || roleMeta.name,
        usernameKey: roleMeta.usernameKey,
        role: claims.role,
        defaultTab: roleMeta.defaultTab,
        allowedTabs: roleMeta.allowedTabs,
        idToken: tokenResult.token,
        expirationTime: tokenResult.expirationTime,
      });
    } catch (err) {
      console.warn('[AdminAuthService] Token verification failed:', err.message);
      callback(null);
    }
  });
}

export async function logoutAdminFromFirebase() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('dc_admin_authenticated');
    sessionStorage.removeItem('dc_admin_username');
    sessionStorage.removeItem('dc_admin_role');
  }
  await signOut(auth);
}

/**
 * Self-service password change for the currently signed-in officer via Firebase Auth `updatePassword`,
 * or password reset link via `sendPasswordResetEmail`.
 */
export async function changeCurrentOfficerPassword(newPassword) {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: 'कोई सक्रिय अधिकारी सत्र नहीं है (Not signed in).' };
  }
  if (!newPassword || String(newPassword).length < 10) {
    return {
      success: false,
      error: 'नया पासवर्ड कम से कम 10 अक्षरों का होना चाहिए (Minimum 10 characters required).',
    };
  }
  try {
    await updatePassword(user, String(newPassword));
    await addDoc(collection(db, 'auditLogs'), {
      action: 'OFFICER_SELF_PASSWORD_UPDATED',
      actorUid: user.uid,
      performedBy: user.email || user.uid,
      timestamp: new Date().toISOString(),
      serverTime: serverTimestamp(),
    });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err.code === 'auth/requires-recent-login'
          ? 'सुरक्षा कारणों से पासवर्ड बदलने हेतु कृपया पुनः लॉगिन करें (Please re-login to update password).'
          : err.message,
    };
  }
}

export async function sendOfficerPasswordReset(usernameOrEmail) {
  const email = resolveOfficerEmail(usernameOrEmail);
  if (!email || !email.includes('@')) {
    return { success: false, error: 'वैध अधिकारी ईमेल आवश्यक है।' };
  }
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, email };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Super Admin API call to `/api/admin/officers` to create/update/disable officer accounts
 * and custom claims via `firebase-admin` (never touches Firestore `admin_settings/accounts`).
 */
export async function updateAdminAccountCredential({
  targetUsername,
  newPassword,
  newName,
  newEmail,
  disabled = false,
}) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return { success: false, error: 'सुपर एडमिन प्रमाणीकरण आवश्यक है (Not authenticated).' };
  }

  const targetMeta =
    DEFAULT_ADMIN_ACCOUNTS[targetUsername] ||
    Object.values(ROLE_METADATA).find((m) => m.role === targetUsername);

  if (!targetMeta) {
    return { success: false, error: 'अमान्य अधिकारी खाता (Invalid officer role/key).' };
  }

  try {
    const idToken = await currentUser.getIdToken(true);
    const res = await fetch('/api/admin/officers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        email: (newEmail || targetMeta.email).trim().toLowerCase(),
        displayName: newName || targetMeta.name,
        role: targetMeta.role,
        password: newPassword || undefined,
        disabled: Boolean(disabled),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Officer update failed.' };
    }

    return {
      success: true,
      officer: data.officer,
      updatedAccounts: {
        ...DEFAULT_ADMIN_ACCOUNTS,
        [targetUsername]: {
          ...targetMeta,
          name: data.officer.displayName || targetMeta.name,
          email: data.officer.email || targetMeta.email,
          disabled: data.officer.disabled,
        },
      },
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function setOfficerDisabledStatus({ email, disabled }) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return { success: false, error: 'सुपर एडमिन प्रमाणीकरण आवश्यक है।' };
  }
  try {
    const idToken = await currentUser.getIdToken(true);
    const res = await fetch('/api/admin/officers', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ email, disabled: Boolean(disabled) }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to update officer status.' };
    }
    return { success: true, ...data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Legacy shim kept so callers don't crash; returns static non-sensitive role metadata
 * without reading or writing `admin_settings/accounts`.
 */
export async function fetchAdminAccounts() {
  return DEFAULT_ADMIN_ACCOUNTS;
}

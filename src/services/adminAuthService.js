import { db, sanitizeFirestorePayload } from '../lib/firebase';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

export const DEFAULT_ADMIN_ACCOUNTS = {
  admin: {
    password: 'jhabua@2024',
    role: 'birth_death_admin',
    name: 'जन्म-मृत्यु रजिस्ट्रार अधिकारी (Birth & Death Registrar)',
    defaultTab: 'death-certificates',
    allowedTabs: ['death-certificates', 'birth-certificates']
  },
  water_admin: {
    password: 'water@jhabua2024',
    role: 'water_admin',
    name: 'जल प्रदाय विभाग अधिकारी (Water Supply Officer)',
    defaultTab: 'water-connections',
    allowedTabs: ['water-connections']
  },
  super_admin: {
    password: 'jhabua@super2024',
    role: 'super_admin',
    name: 'मुख्य नगर पालिका अधिकारी (Chief Municipal Officer - CMO)',
    defaultTab: 'death-certificates',
    allowedTabs: ['death-certificates', 'birth-certificates', 'water-connections', 'no-dues-certificates', 'audit', 'security-settings']
  }
};

const SETTINGS_DOC_REF = doc(db, 'admin_settings', 'accounts');

export async function fetchAdminAccounts() {
  try {
    const snap = await getDoc(SETTINGS_DOC_REF);
    if (snap.exists()) {
      const remoteAccounts = snap.data();
      // Merge remote accounts with default fallback structural fields
      const merged = { ...DEFAULT_ADMIN_ACCOUNTS };
      Object.keys(remoteAccounts).forEach(key => {
        if (merged[key]) {
          merged[key] = {
            ...merged[key],
            ...remoteAccounts[key]
          };
        }
      });
      return merged;
    } else {
      // Seed default accounts into Firestore
      await setDoc(SETTINGS_DOC_REF, sanitizeFirestorePayload(DEFAULT_ADMIN_ACCOUNTS), { merge: true });
      return DEFAULT_ADMIN_ACCOUNTS;
    }
  } catch (error) {
    console.warn('[AdminAuthService] Firestore account read error, fallback to defaults:', error.message);
    return DEFAULT_ADMIN_ACCOUNTS;
  }
}

export async function updateAdminAccountCredential({ targetUsername, newPassword, newName, updatedBy }) {
  try {
    const currentAccounts = await fetchAdminAccounts();
    if (!currentAccounts[targetUsername]) {
      return { success: false, error: 'अमान्य अधिकारी खाता (Invalid account username)' };
    }

    const updatedAccount = {
      ...currentAccounts[targetUsername],
      ...(newPassword ? { password: newPassword } : {}),
      ...(newName ? { name: newName } : {}),
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || 'super_admin'
    };

    const updatePayload = {
      ...currentAccounts,
      [targetUsername]: updatedAccount
    };

    await setDoc(SETTINGS_DOC_REF, sanitizeFirestorePayload(updatePayload), { merge: true });

    // Audit Log Entry
    try {
      await addDoc(collection(db, 'audit_logs'), {
        action: 'SECURITY_CREDENTIAL_UPDATED',
        details: `सुरक्षा अद्यतन: सुपर एडमिन (${updatedBy}) द्वारा '${targetUsername}' का क्रेडेंशियल अद्यतन किया गया।`,
        performedBy: updatedBy || 'super_admin',
        timestamp: new Date().toISOString(),
        serverTime: serverTimestamp()
      });
    } catch (e) {}

    return { success: true, updatedAccounts: updatePayload };
  } catch (error) {
    console.error('[AdminAuthService] Update error:', error);
    return { success: false, error: error.message || 'क्रेडेंशियल अद्यतन करने में विफलता' };
  }
}

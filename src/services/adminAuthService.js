import { db, sanitizeFirestorePayload } from '../lib/firebase';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

export const ADMIN_USERNAME_ALIASES = {
  'nodues': 'nodues_admin',
  'noduesadmin': 'nodues_admin',
  'revenue_admin': 'nodues_admin',
  'revenue': 'nodues_admin',
  'water': 'water_admin',
  'wateradmin': 'water_admin',
  'superadmin': 'super_admin',
  'super': 'super_admin'
};

export const DEFAULT_ADMIN_ACCOUNTS = {
  admin: {
    password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD_BIRTH_DEATH || process.env.ADMIN_PASSWORD_BIRTH_DEATH || 'jhabua@2024',
    role: 'birth_death_admin',
    name: 'जन्म-मृत्यु रजिस्ट्रार अधिकारी (Birth & Death Registrar)',
    email: 'birthdeath.jhabua@mp.gov.in',
    defaultTab: 'death-certificates',
    allowedTabs: ['death-certificates', 'birth-certificates']
  },
  water_admin: {
    password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD_WATER || process.env.ADMIN_PASSWORD_WATER || 'water@jhabua2024',
    role: 'water_admin',
    name: 'जल प्रदाय विभाग अधिकारी (Water Supply Officer)',
    email: 'water.jhabua@mp.gov.in',
    defaultTab: 'water-connections',
    allowedTabs: ['water-connections']
  },
  nodues_admin: {
    password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD_NODUES || process.env.ADMIN_PASSWORD_NODUES || 'nodues@jhabua2024',
    role: 'nodues_admin',
    name: 'संपत्ति कर व नो ड्यूज अधिकारी (Revenue & No-Dues NOC Officer)',
    email: 'revenue.jhabua@mp.gov.in',
    defaultTab: 'no-dues-certificates',
    allowedTabs: ['no-dues-certificates']
  },
  super_admin: {
    password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD_SUPER || process.env.ADMIN_PASSWORD_SUPER || 'jhabua@super2024',
    role: 'super_admin',
    name: 'मुख्य नगर पालिका अधिकारी (Chief Municipal Officer - CMO)',
    email: 'cmo.jhabua@mp.gov.in',
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
      let missingKeys = false;
      Object.keys(DEFAULT_ADMIN_ACCOUNTS).forEach(key => {
        if (!remoteAccounts[key]) {
          missingKeys = true;
        }
      });

      Object.keys(remoteAccounts).forEach(key => {
        if (merged[key]) {
          const defaultTabs = DEFAULT_ADMIN_ACCOUNTS[key]?.allowedTabs || [];
          const remoteTabs = remoteAccounts[key]?.allowedTabs || [];
          const combinedTabs = Array.from(new Set([...defaultTabs, ...remoteTabs]));
          merged[key] = {
            ...merged[key],
            ...remoteAccounts[key],
            allowedTabs: combinedTabs
          };
        } else {
          merged[key] = remoteAccounts[key];
        }
      });

      // Sync missing default accounts (e.g. nodues_admin) into Firestore
      if (missingKeys) {
        try {
          await setDoc(SETTINGS_DOC_REF, sanitizeFirestorePayload(merged), { merge: true });
        } catch (e) {}
      }

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

export async function updateAdminAccountCredential({ targetUsername, newPassword, newName, newEmail, updatedBy }) {
  try {
    const currentAccounts = await fetchAdminAccounts();
    if (!currentAccounts[targetUsername]) {
      return { success: false, error: 'अमान्य अधिकारी खाता (Invalid account username)' };
    }

    const updatedAccount = {
      ...currentAccounts[targetUsername],
      ...(newPassword ? { password: newPassword } : {}),
      ...(newName ? { name: newName } : {}),
      ...(newEmail ? { email: newEmail } : {}),
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
      await addDoc(collection(db, 'auditLogs'), {
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

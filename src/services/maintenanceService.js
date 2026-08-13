import { db, sanitizeFirestorePayload } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';

const MAINTENANCE_DOC_REF = doc(db, 'admin_settings', 'maintenance');

export async function fetchMaintenanceStatus() {
  try {
    const snap = await getDoc(MAINTENANCE_DOC_REF);
    if (snap.exists()) {
      return snap.data();
    } else {
      const defaultState = {
        isMaintenanceMode: false,
        message: 'पोर्टल पर नियमित तकनीकी रखरखाव जारी है। अतिशीघ्र सेवाएं बहाल की जाएंगी।',
        reason: 'सुरक्षा एवं सर्वर अद्यतन (Routine Security & System Upgrade)',
        enabledBy: 'super_admin',
        updatedAt: new Date().toISOString()
      };
      await setDoc(MAINTENANCE_DOC_REF, sanitizeFirestorePayload(defaultState), { merge: true });
      return defaultState;
    }
  } catch (error) {
    console.warn('[MaintenanceService] Error fetching status:', error.message);
    return { isMaintenanceMode: false };
  }
}

export function subscribeToMaintenance(callback) {
  // 1. Immediately return cached state if available for 0ms instant load
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('cached_maint_status');
      if (cached) {
        callback(JSON.parse(cached));
      }
    } catch (e) {}
  }

  const handleCustomEvent = (e) => {
    if (e.detail) {
      callback(e.detail);
    }
  };

  const handleStorageEvent = (e) => {
    if (e.key === 'cached_maint_status' && e.newValue) {
      try {
        callback(JSON.parse(e.newValue));
      } catch (err) {}
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('maintenance-status-change', handleCustomEvent);
    window.addEventListener('storage', handleStorageEvent);
  }

  try {
    const unsub = onSnapshot(MAINTENANCE_DOC_REF, (snap) => {
      let data = { isMaintenanceMode: false };
      if (snap.exists()) {
        data = snap.data();
      }
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('cached_maint_status', JSON.stringify(data));
        } catch (err) {}
      }
      callback(data);
    }, (err) => {
      console.warn('[MaintenanceService] Snapshot error:', err);
    });

    return () => {
      unsub();
      if (typeof window !== 'undefined') {
        window.removeEventListener('maintenance-status-change', handleCustomEvent);
        window.removeEventListener('storage', handleStorageEvent);
      }
    };
  } catch (e) {
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('maintenance-status-change', handleCustomEvent);
        window.removeEventListener('storage', handleStorageEvent);
      }
    };
  }
}

export async function toggleMaintenanceMode({ isEnabled, message, reason, updatedBy }) {
  try {
    const payload = {
      isMaintenanceMode: Boolean(isEnabled),
      message: message || 'पोर्टल पर नियमित तकनीकी रखरखाव जारी है। अतिशीघ्र सेवाएं बहाल की जाएंगी।',
      reason: reason || 'सुरक्षा एवं सर्वर अद्यतन (Routine Security Upgrade)',
      enabledBy: updatedBy || 'super_admin',
      updatedAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cached_maint_status', JSON.stringify(payload));
        window.dispatchEvent(new CustomEvent('maintenance-status-change', { detail: payload }));
      } catch (e) {}
    }

    await setDoc(MAINTENANCE_DOC_REF, sanitizeFirestorePayload(payload), { merge: true });

    // Audit Log Entry
    try {
      const officerDisplayName = updatedBy && updatedBy !== 'super_admin' ? updatedBy : 'मुख्य नगर पालिका अधिकारी (Chief Municipal Officer - CMO)';
      await addDoc(collection(db, 'auditLogs'), {
        action: isEnabled ? 'MAINTENANCE_MODE_ENABLED' : 'MAINTENANCE_MODE_DISABLED',
        user: officerDisplayName,
        performedBy: officerDisplayName,
        officerName: officerDisplayName,
        role: 'Chief Municipal Officer - CMO',
        serviceType: 'system_admin',
        applicationNo: '—',
        details: isEnabled ? `सुरक्षा लॉकडाउन: (${officerDisplayName}) द्वारा पोर्टल रखरखाव मोड चालू किया गया।` : `सुरक्षा अद्यतन समाप्त: (${officerDisplayName}) द्वारा पोर्टल सामान्य स्थिति में बहाल किया गया।`,
        timestamp: new Date().toISOString(),
        serverTime: serverTimestamp()
      });
    } catch (e) {}

    return { success: true, state: payload };
  } catch (error) {
    console.error('[MaintenanceService] Toggle error:', error);
    return { success: false, error: error.message };
  }
}

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
  try {
    return onSnapshot(MAINTENANCE_DOC_REF, (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      } else {
        callback({ isMaintenanceMode: false });
      }
    }, (err) => {
      console.warn('[MaintenanceService] Snapshot error:', err);
      callback({ isMaintenanceMode: false });
    });
  } catch (e) {
    callback({ isMaintenanceMode: false });
    return () => {};
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

    await setDoc(MAINTENANCE_DOC_REF, sanitizeFirestorePayload(payload), { merge: true });

    // Audit Log Entry
    try {
      await addDoc(collection(db, 'auditLogs'), {
        action: isEnabled ? 'MAINTENANCE_MODE_ENABLED' : 'MAINTENANCE_MODE_DISABLED',
        details: isEnabled ? `सुरक्षा लॉकडाउन: सुपर एडमिन (${updatedBy}) द्वारा पोर्टल रखरखाव मोड चालू किया गया।` : `सुरक्षा अद्यतन समाप्त: सुपर एडमिन (${updatedBy}) द्वारा पोर्टल सामान्य स्थिति में बहाल किया गया।`,
        performedBy: updatedBy || 'super_admin',
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

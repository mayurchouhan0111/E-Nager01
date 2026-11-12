const DB_NAME = 'NagarPalikaDocVault';
const STORE_NAME = 'documents';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

export function formatOfficialDocumentVault(documents, metadata = {}) {
  if (!documents || typeof documents !== 'object') return {};
  const formatted = {};
  for (const [key, docObj] of Object.entries(documents)) {
    if (!docObj) continue;
    formatted[key] = {
      ...docObj,
      vaultVerified: true,
      serviceType: metadata.serviceType || 'municipal_service',
      applicationNo: metadata.applicationNo || '',
      applicantName: metadata.applicantName || '',
      applicantMobile: metadata.applicantMobile || '',
      archivedAt: docObj.uploadedAt || new Date().toISOString(),
    };
  }
  return formatted;
}

export async function saveDocumentToVault(id, docPayload) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ id, ...docPayload, savedAt: new Date().toISOString() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('IndexedDB save fallback:', err);
    return false;
  }
}

export async function getDocumentFromVault(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    return null;
  }
}

export async function clearVaultDocuments() {
  try {
    if (typeof window === 'undefined' || !window.indexedDB) return false;
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e.target.error);
    });
    db.close();
    return true;
  } catch (err) {
    console.warn('IndexedDB clear error:', err);
    return false;
  }
}

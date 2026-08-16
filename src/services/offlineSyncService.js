import { db, ensureFirebaseAuth, sanitizeFirestorePayload } from '../lib/firebase.js';
import { collection, addDoc, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';

const QUEUE_STORAGE_KEY = 'enagar_pending_sync_queue';
let isFlushing = false;

/**
 * Returns current array of pending applications waiting to be synced to Firestore
 */
export function getPendingSyncQueue() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Enqueues an application payload that failed to write to Firestore due to offline/network drop
 */
export function enqueuePendingSyncItem(serviceType, payload) {
  if (typeof window === 'undefined' || !payload) return;
  const queue = getPendingSyncQueue();
  
  const appNo = payload.applicationNo || `APP-${Date.now()}`;
  const existingIdx = queue.findIndex(item => item.applicationNo === appNo || (payload.id && item.id === payload.id));
  
  const queueItem = {
    id: payload.id || `pending-${Date.now()}`,
    applicationNo: appNo,
    serviceType,
    payload,
    enqueuedAt: new Date().toISOString(),
    retries: 0
  };

  if (existingIdx >= 0) {
    queue[existingIdx] = queueItem;
  } else {
    queue.push(queueItem);
  }

  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    toast.error(`⚠️ नेटवर्क डिस्कनेक्ट! आपका आवेदन (${appNo}) ऑफ़लाइन कतार में सहेजा गया है। ऑनलाइन होते ही स्वतः सिंक हो जाएगा।`, { duration: 6000 });
  } catch (e) {
    console.error('[OfflineSyncEngine] LocalStorage enqueue error:', e);
  }

  // Attempt immediate flush if network is restored
  flushPendingSyncQueue();
}

/**
 * Map serviceType to Firestore collection name
 */
function getCollectionName(serviceType) {
  const st = (serviceType || '').toLowerCase();
  if (st.includes('birth')) return 'birthCertificates';
  if (st.includes('death')) return 'deathCertificates';
  if (st.includes('water')) return 'waterConnections';
  if (st.includes('no_dues') || st.includes('no-dues')) return 'noDuesCertificates';
  return 'applications';
}

/**
 * Flushes all pending applications from offline queue to Firestore Cloud Database idempotently
 */
export async function flushPendingSyncQueue() {
  if (typeof window === 'undefined' || isFlushing) return;
  
  const queue = getPendingSyncQueue();
  if (queue.length === 0) return;

  if (navigator && !navigator.onLine) {
    return; // Device is still offline
  }

  isFlushing = true;
  const remainingQueue = [];
  let syncedCount = 0;

  for (const item of queue) {
    try {
      await ensureFirebaseAuth();
      const colName = getCollectionName(item.serviceType);
      const cleanPayload = sanitizeFirestorePayload({
        ...item.payload,
        updatedAt: new Date().toISOString(),
        offlineSyncedAt: new Date().toISOString()
      });

      let docRef = null;
      if (item.applicationNo) {
        const q = query(collection(db, colName), where('applicationNo', '==', item.applicationNo));
        const snap = await getDocs(q).catch(() => null);
        if (snap && !snap.empty) {
          docRef = snap.docs[0].ref;
        }
      }

      const docId = item.payload.id || item.id;
      if (!docRef && docId && !docId.startsWith('local-') && !docId.startsWith('pending-')) {
        docRef = doc(db, colName, docId);
      }

      if (docRef) {
        await setDoc(docRef, cleanPayload, { merge: true });
      } else {
        await addDoc(collection(db, colName), cleanPayload);
      }

      // Add Notification for Officer Visibility
      try {
        await addDoc(collection(db, 'notifications'), {
          serviceType: item.serviceType,
          applicationNo: item.applicationNo,
          recipientId: 'all',
          event: 'OFFLINE_SYNCED',
          status: cleanPayload.status || 'Submitted',
          message: `⚡ ऑफ़लाइन आवेदन (${item.applicationNo}) बैकएंड पर ऑटो-सिंक हो गया।`,
          officerName: 'Offline Sync System',
          timestamp: new Date().toISOString()
        });
      } catch (ne) {}

      syncedCount++;
    } catch (err) {
      console.warn(`[OfflineSyncEngine] Retry failed for ${item.applicationNo}:`, err.message);
      item.retries = (item.retries || 0) + 1;
      if (item.retries < 10) {
        remainingQueue.push(item);
      }
    }
  }

  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remainingQueue));
  } catch (e) {}

  if (syncedCount > 0) {
    toast.success(`⚡ सफलता! ${syncedCount} बकाया ऑफ़लाइन आवेदन नगर पालिका बैकएंड पर ऑटो-सिंक हो गए हैं।`, { duration: 6000 });
  }

  isFlushing = false;
}

/**
 * Initializes the global background offline sync engine
 */
export function initOfflineSyncEngine() {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => {
    toast.success('🌐 इंटरनेट पुनः कनेक्ट हो गया! ऑफ़लाइन आवेदनों की जाँच की जा रही है...', { id: 'online-toast' });
    flushPendingSyncQueue();
  };

  window.addEventListener('online', handleOnline);

  // Periodic 15-second background sync check
  const timer = setInterval(() => {
    flushPendingSyncQueue();
  }, 15000);

  // Initial flush on load
  flushPendingSyncQueue();

  return () => {
    window.removeEventListener('online', handleOnline);
    clearInterval(timer);
  };
}

import { db, ensureFirebaseAuth, sanitizeFirestorePayload } from '../lib/firebase';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const SYNC_QUEUE_KEY = 'enagar_offline_sync_queue_v1';
let isSyncing = false;

function getSyncQueue() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveSyncQueue(queue) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('enagar_sync_queue_updated', { detail: { count: queue.length } }));
  } catch (e) {
    console.warn('[OfflineSync] Storage quota warning while saving sync queue:', e.message);
  }
}

export function getPendingSyncCount() {
  return getSyncQueue().length;
}

export function clearSyncQueue() {
  saveSyncQueue([]);
}

/**
 * Adds or updates an item in the offline sync queue so that if the user submits an application
 * while offline or on an unstable 2G network, it will automatically push to Firestore using an
 * idempotent document ID as soon as internet connectivity is restored.
 */
export function enqueuePendingSyncItem({ collectionName, collection, operation = 'create', action, docId = null, id = null, payload, localStorageKey = null }) {
  if (typeof window === 'undefined') return;
  const col = collectionName || collection;
  const op = action || operation;
  const deterministicId = docId || id || payload?.id || payload?.applicationNo || `sync-${Date.now()}`;

  const queue = getSyncQueue();
  const appNo = payload?.applicationNo;

  const existingIndex = queue.findIndex(
    item =>
      (item.collectionName === col && item.docId === deterministicId) ||
      (appNo && item.payload?.applicationNo === appNo && item.collectionName === col && item.operation === op)
  );

  const queueItem = {
    queueId: `sync-${deterministicId}`,
    collectionName: col,
    operation: op,
    docId: deterministicId,
    payload: { ...payload, id: deterministicId },
    localStorageKey,
    queuedAt: new Date().toISOString(),
    retryCount: 0
  };

  if (existingIndex >= 0) {
    queue[existingIndex] = queueItem;
  } else {
    queue.push(queueItem);
  }

  saveSyncQueue(queue);
}

export const enqueueOfflineSync = enqueuePendingSyncItem;

/**
 * Flushes all pending items in the queue to Firestore using idempotent setDoc(..., { merge: true }).
 */
export async function flushPendingSyncQueue() {
  if (typeof window === 'undefined' || isSyncing) return { synced: 0, remaining: getPendingSyncCount() };
  if (typeof navigator !== 'undefined' && !navigator.onLine) return { synced: 0, remaining: getPendingSyncCount() };

  const queue = getSyncQueue();
  if (queue.length === 0) return { synced: 0, remaining: 0 };

  isSyncing = true;
  let syncedCount = 0;
  const remainingQueue = [];

  try {
    await ensureFirebaseAuth();

    for (const item of queue) {
      try {
        const cleanPayload = sanitizeFirestorePayload({ ...item.payload });
        const targetId = String(item.docId || cleanPayload.id || cleanPayload.applicationNo);
        delete cleanPayload.id;
        delete cleanPayload.pendingCloudSync;

        const docRef = doc(db, item.collectionName, targetId);

        if (item.operation === 'create') {
          await setDoc(docRef, {
            ...cleanPayload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            syncedFromOfflineAt: new Date().toISOString()
          }, { merge: true });

          if (item.localStorageKey && item.payload?.applicationNo) {
            try {
              const rawLocal = localStorage.getItem(item.localStorageKey);
              if (rawLocal) {
                const parsed = JSON.parse(rawLocal);
                const updated = parsed.map(rec =>
                  rec.applicationNo === item.payload.applicationNo
                    ? { ...rec, id: targetId, pendingCloudSync: false }
                    : rec
                );
                localStorage.setItem(item.localStorageKey, JSON.stringify(updated));
              }
            } catch (e) {}
          }
          syncedCount++;
        } else if (item.operation === 'update' && targetId) {
          await updateDoc(docRef, {
            ...cleanPayload,
            updatedAt: serverTimestamp()
          });
          syncedCount++;
        }
      } catch (err) {
        console.warn(`[OfflineSync] Retry deferred for ${item.collectionName}:`, err.message);
        item.retryCount = (item.retryCount || 0) + 1;
        if (item.retryCount < 15) {
          remainingQueue.push(item);
        }
      }
    }

    saveSyncQueue(remainingQueue);
    if (syncedCount > 0 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('enagar_offline_sync_completed', { detail: { syncedCount } }));
    }
  } finally {
    isSyncing = false;
  }

  return { synced: syncedCount, remaining: remainingQueue.length };
}

let listenersInitialized = false;

export function initOfflineSyncListeners() {
  if (typeof window === 'undefined' || listenersInitialized) return;
  listenersInitialized = true;

  window.addEventListener('online', () => {
    flushPendingSyncQueue();
  });

  setTimeout(() => {
    flushPendingSyncQueue();
  }, 2500);

  setInterval(() => {
    if (typeof navigator !== 'undefined' && navigator.onLine && getPendingSyncCount() > 0) {
      flushPendingSyncQueue();
    }
  }, 30000);
}

export const initOfflineSyncWatcher = initOfflineSyncListeners;
export const initOfflineSyncEngine = initOfflineSyncListeners;

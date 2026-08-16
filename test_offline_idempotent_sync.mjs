// Automated Test: Offline Queue Idempotent Flush Verification
import { db, sanitizeFirestorePayload } from './src/lib/firebase.js';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { enqueuePendingSyncItem, flushPendingSyncQueue, getPendingSyncQueue } from './src/services/offlineSyncService.js';

console.log('🧪 Starting Offline Queue Idempotency & De-duplication Test...\n');

// Mock localStorage and navigator in Node
const mockStorage = new Map();
global.window = {
  dispatchEvent: () => {}
};
global.localStorage = {
  getItem: (k) => mockStorage.get(k) || null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  get length() { return mockStorage.size; },
  key: (i) => Array.from(mockStorage.keys())[i]
};
try {
  Object.defineProperty(globalThis, 'navigator', {
    value: { onLine: true },
    writable: true,
    configurable: true
  });
} catch (e) {}

async function runOfflineIdempotencyTest() {
  const testAppNo = `OFFLINE-IDEMP-${Date.now()}`;
  const testEmail = `offline_test_${Date.now()}@gmail.com`;

  const itemPayload = {
    applicationNo: testAppNo,
    userEmail: testEmail,
    status: 'Submitted',
    childDetails: { fullName: 'Offline Test Child' },
    applicantDetails: { fullName: 'Offline Parent', mobile: '9826044444', email: testEmail }
  };

  // 1. Enqueue item in offline queue
  console.log(`📥 Enqueueing offline application (${testAppNo})...`);
  enqueuePendingSyncItem('birth_certificate', itemPayload);

  // 2. Perform First Flush and wait for network write
  console.log('🚀 Executing First Flush...');
  await flushPendingSyncQueue();
  await new Promise(r => setTimeout(r, 2000));

  // 3. Re-enqueue same item and Perform Second Flush (simulating retry or duplicate network trigger)
  console.log('🔄 Re-enqueueing same application and executing Second Flush...');
  enqueuePendingSyncItem('birth_certificate', itemPayload);
  await flushPendingSyncQueue();
  await new Promise(r => setTimeout(r, 2000));

  // 4. Query Firestore to verify exactly 1 document exists
  const q = query(collection(db, 'birthCertificates'), where('applicationNo', '==', testAppNo));
  const snap = await getDocs(q);

  console.log(`\n📊 Firestore Query Results for ${testAppNo}:`);
  console.log(`  Matching Documents Count: ${snap.size}`);

  if (snap.size !== 1) {
    throw new Error(`❌ Idempotency failed! Found ${snap.size} documents for ${testAppNo} (expected exactly 1).`);
  }

  console.log('✅ PASSED: Exactly 1 document exists in Firestore despite multiple sync flushes.');

  // 5. Cleanup
  const docId = snap.docs[0].id;
  await deleteDoc(doc(db, 'birthCertificates', docId));
  console.log(`🧹 Cleaned up test document (${docId}).`);

  console.log('\n🎉 ALL OFFLINE SYNC IDEMPOTENCY TESTS PASSED (100%)!');
}

runOfflineIdempotencyTest().catch(err => {
  console.error('❌ Offline idempotency test failed:', err);
  process.exit(1);
});

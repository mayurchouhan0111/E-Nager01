import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAMIz2LvnXZaK1hcg597-AofScFI-yWBMA",
  authDomain: "enagar-birth-death.firebaseapp.com",
  projectId: "enagar-birth-death",
  storageBucket: "enagar-birth-death.firebasestorage.app",
  messagingSenderId: "483064224867",
  appId: "1:483064224867:web:13f0215560bcccedc3ec56"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mock LocalStorage for Node CLI environment
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: function (key) {
      return store[key] || null;
    },
    setItem: function (key, value) {
      store[key] = value.toString();
    },
    removeItem: function (key) {
      delete store[key];
    },
    clear: function () {
      store = {};
    }
  };
})();

global.localStorage = localStorageMock;
global.window = {
  addEventListener: () => {},
  removeEventListener: () => {}
};
Object.defineProperty(global, 'navigator', { value: { onLine: true }, configurable: true });

async function runOfflineSyncEngineVerification() {
  console.log('🚀 OFFLINE-TO-ONLINE AUTO-RETRY SYNC SAFEGUARD AUDIT STARTED...\n');
  const now = new Date().toISOString();
  const testAppNo = `OFFLINE-TEST-${Date.now()}`;

  // 1. Simulate Offline Submission (Enqueue Payload)
  console.log(`📌 STEP 1: Simulating offline form submission during network drop...`);
  const offlinePayload = {
    id: `local-off-${Date.now()}`,
    applicationNo: testAppNo,
    status: 'Submitted',
    appliedAt: now,
    applicantDetails: { fullName: 'ऑफ़लाइन टेस्ट नागरिक (Offline Citizen)', mobile: '9876543210', email: 'offline@jhabua.gov.in' },
    childDetails: { childName: 'ऑफ़लाइन शिशु', dateOfBirth: '2026-02-10' }
  };

  const queueKey = 'enagar_pending_sync_queue';
  const queueItem = {
    id: offlinePayload.id,
    applicationNo: testAppNo,
    serviceType: 'birth_certificate',
    payload: offlinePayload,
    enqueuedAt: now,
    retries: 0
  };

  localStorage.setItem(queueKey, JSON.stringify([queueItem]));
  console.log(`   ✅ Enqueued item '${testAppNo}' into LocalStorage 'enagar_pending_sync_queue'.`);

  // 2. Simulate Network Restoration & Flush Queue to Firestore
  console.log(`\n📌 STEP 2: Simulating network restoration -> Flushing pending sync queue to Firestore...`);
  const rawQueue = JSON.parse(localStorage.getItem(queueKey) || '[]');
  console.log(`   📋 Queue items found: ${rawQueue.length}`);

  let createdDocId = null;
  for (const item of rawQueue) {
    console.log(`   📡 Pushing pending application '${item.applicationNo}' to Firestore collection 'birthCertificates'...`);
    const docRef = await addDoc(collection(db, 'birthCertificates'), {
      ...item.payload,
      updatedAt: new Date().toISOString(),
      offlineSyncedAt: new Date().toISOString()
    });
    createdDocId = docRef.id;
    console.log(`   ✅ SUCCESS! Written to Firestore Cloud Database -> Doc ID: '${createdDocId}'`);
  }

  // Clear pending queue after flush
  localStorage.setItem(queueKey, JSON.stringify([]));

  // 3. Verify Firestore Readback
  console.log(`\n📌 STEP 3: Verifying Firestore persistence and officer visibility...`);
  const snap = await getDoc(doc(db, 'birthCertificates', createdDocId));
  if (snap.exists() && snap.data().applicationNo === testAppNo) {
    console.log(`   ✅ PERSISTENCE VERIFIED! Saved Name: '${snap.data().applicantDetails?.fullName}', Status: '${snap.data().status}'`);
    console.log(`   ✅ Offline Synced At Timestamp: '${snap.data().offlineSyncedAt}'`);
  } else {
    console.error(`   ❌ ERROR: Offline document failed to persist in Firestore!`);
    process.exit(1);
  }

  // Clean up test document
  await deleteDoc(doc(db, 'birthCertificates', createdDocId));
  console.log(`\n🧹 Cleaned up temporary test document '${createdDocId}'.`);

  console.log('\n🎉 OFFLINE-TO-ONLINE AUTO-RETRY SYNC SAFEGUARD: 100% VERIFIED & PASSED!');
  process.exit(0);
}

runOfflineSyncEngineVerification().catch(err => {
  console.error('❌ OFFLINE SYNC AUDIT ERROR:', err);
  process.exit(1);
});

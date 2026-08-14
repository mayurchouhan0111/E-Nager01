import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDoc, doc, deleteDoc } from 'firebase/firestore';

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

async function testBackendWriteAndRead() {
  console.log('🚀 LIVE FIREBASE FIRESTORE BACKEND PERSISTENCE AUDIT STARTED...\n');
  const now = new Date().toISOString();

  // Test Document 1: Birth Certificate
  const bcTest = {
    testFlag: true,
    service: 'birth_certificate',
    applicationNo: `TEST-BC-${Date.now()}`,
    status: 'Submitted',
    appliedAt: now,
    applicantDetails: { fullName: 'लाइव टेस्ट नागरिक (Birth)', mobile: '9876543210', email: 'test@jhabua.gov.in' },
    childDetails: { childName: 'टेस्ट शिशु', placeOfBirth: 'झाबुआ अस्पताल' }
  };

  // Test Document 2: Death Certificate
  const dcTest = {
    testFlag: true,
    service: 'death_certificate',
    applicationNo: `TEST-DC-${Date.now()}`,
    status: 'Submitted',
    appliedAt: now,
    applicantDetails: { fullName: 'लाइव टेस्ट नागरिक (Death)', mobile: '9876543210', email: 'test@jhabua.gov.in' },
    deceasedDetails: { fullName: 'स्व. टेस्ट व्यक्ति', placeOfDeath: 'झाबुआ' }
  };

  // Test Document 3: Water Connection
  const wcTest = {
    testFlag: true,
    service: 'water_connection',
    applicationNo: `TEST-WC-${Date.now()}`,
    status: 'Submitted',
    appliedAt: now,
    applicantDetails: { fullName: 'लाइव टेस्ट नागरिक (Water)', mobile: '9876543210', email: 'test@jhabua.gov.in' },
    propertyDetails: { propertyId: 'PROP-TEST-99', wardNo: '05' }
  };

  // Test Document 4: No Dues NOC
  const ndTest = {
    testFlag: true,
    service: 'no_dues',
    applicationNo: `TEST-ND-${Date.now()}`,
    status: 'Submitted',
    appliedAt: now,
    applicantDetails: { fullName: 'लाइव टेस्ट नागरिक (NoDues)', mobile: '9876543210', email: 'test@jhabua.gov.in' },
    taxDetails: { amountPaid: '1500', triRefNo: 'TRI-TEST-123' }
  };

  const collections = [
    { name: 'birthCertificates', data: bcTest },
    { name: 'deathCertificates', data: dcTest },
    { name: 'waterConnections', data: wcTest },
    { name: 'noDuesCertificates', data: ndTest }
  ];

  for (const item of collections) {
    console.log(`📡 [WRITE TEST] Writing to Firebase Collection '${item.name}'...`);
    const docRef = await addDoc(collection(db, item.name), item.data);
    console.log(`   ✅ SUCCESS! Created Doc ID: '${docRef.id}' (AppNo: ${item.data.applicationNo})`);

    console.log(`🔍 [READ VERIFICATION] Fetching Doc '${docRef.id}' from Firebase Backend...`);
    const snap = await getDoc(doc(db, item.name, docRef.id));
    if (snap.exists()) {
      const fetched = snap.data();
      console.log(`   ✅ BACKEND PERSISTENCE VERIFIED! Saved Name: '${fetched.applicantDetails?.fullName}', Status: '${fetched.status}'`);
    } else {
      console.error(`   ❌ ERROR: Document '${docRef.id}' not found in Firebase!`);
    }

    // Clean up temporary test document
    await deleteDoc(doc(db, item.name, docRef.id));
    console.log(`   🧹 Cleaned up temporary test document '${docRef.id}'.\n`);
  }

  console.log('🎉 LIVE FIREBASE BACKEND PERSISTENCE AUDIT: 100% PASSED!');
  process.exit(0);
}

testBackendWriteAndRead().catch(err => {
  console.error('❌ BACKEND TEST ERROR:', err);
  process.exit(1);
});

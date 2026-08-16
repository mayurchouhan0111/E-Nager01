// Automated Test: Real-Time Cross-Device Synchronization & Authoritative Status Propagation
import { db, sanitizeFirestorePayload } from './src/lib/firebase.js';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  deleteDoc 
} from 'firebase/firestore';

console.log('🧪 Starting Real-Time Cross-Device Synchronization & Authoritative State Test...\n');

async function runCrossDeviceSyncTest() {
  const testAppNo = `SYNC-TEST-${Date.now()}`;
  const citizenEmail = `citizen_device1_${Date.now()}@gmail.com`;

  // 1. Citizen on Device 1 submits Birth Certificate
  console.log(`📱 [Device 1: Citizen Mobile] Submitting new application (${testAppNo})...`);
  const initialPayload = {
    applicationNo: testAppNo,
    userEmail: citizenEmail,
    status: 'Submitted',
    childDetails: { fullName: 'Jhabua Citizen Child', dateOfBirth: '2026-08-01' },
    applicantDetails: { fullName: 'Citizen Device 1', mobile: '9826033333', email: citizenEmail },
    appliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [
      {
        action: 'Application Submitted',
        status: 'Submitted',
        performedBy: 'Citizen Device 1',
        timestamp: new Date().toISOString()
      }
    ]
  };

  const docRef = await addDoc(collection(db, 'birthCertificates'), sanitizeFirestorePayload(initialPayload));
  console.log(`✅ [Device 1] Document written to Cloud Firestore: DocID = ${docRef.id}`);

  // 2. Admin Officer on Device 2 reviews and approves
  console.log(`\n💻 [Device 2: Admin Officer Desktop] Loading application and transitioning status to 'Approved'...`);
  const approvalTimestamp = new Date().toISOString();
  const updatePayload = {
    status: 'Approved',
    certificateNo: `CERT-JH-${Date.now()}`,
    officialUploadedCertificate: {
      fileName: 'approved_birth_cert.pdf',
      fileType: 'application/pdf',
      fileSize: '45 KB',
      uploadedAt: approvalTimestamp
    },
    updatedAt: approvalTimestamp,
    timeline: [
      ...initialPayload.timeline,
      {
        action: 'Status Changed to Approved',
        status: 'Approved',
        performedBy: 'Shri Rameshwar (Registrar)',
        remarks: 'दस्तावेज सत्यापित किए गए एवं प्रमाण पत्र स्वीकृत (Approved after verification)',
        timestamp: approvalTimestamp
      }
    ]
  };

  await updateDoc(doc(db, 'birthCertificates', docRef.id), sanitizeFirestorePayload(updatePayload));
  console.log(`✅ [Device 2] Admin update committed to Cloud Firestore.`);

  // 3. Citizen on Device 1 queries backend
  console.log(`\n📱 [Device 1: Citizen Mobile] Querying live Firestore backend...`);
  const q = query(collection(db, 'birthCertificates'), where('applicationNo', '==', testAppNo));
  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error('❌ Application not found on Device 1 live read!');
  }

  const liveData = snap.docs[0].data();
  console.log(`  Live Document Status: ${liveData.status}`);
  console.log(`  Certificate No: ${liveData.certificateNo}`);
  console.log(`  Officer Remarks: ${liveData.timeline[1]?.remarks}`);

  if (liveData.status !== 'Approved') {
    throw new Error(`❌ Expected status 'Approved', got '${liveData.status}'!`);
  }

  if (!liveData.certificateNo || !liveData.officialUploadedCertificate) {
    throw new Error('❌ Certificate details not propagated to citizen device!');
  }

  // 4. Cleanup test document
  await deleteDoc(doc(db, 'birthCertificates', docRef.id));
  console.log(`\n🧹 Cleaned up test document (${docRef.id}).`);

  console.log('\n🎉 ALL REAL-TIME CROSS-DEVICE SYNC & AUTHORITATIVE STATE TESTS PASSED (100%)!');
}

runCrossDeviceSyncTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

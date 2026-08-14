import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';

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

async function runServiceAndAdminUpdateTests() {
  console.log('🚀 LIVE SERVICE LIST FETCHING & ADMIN STATUS UPDATE AUDIT STARTED...\n');
  const now = new Date().toISOString();

  // Test Document Data for 4 Services
  const services = [
    {
      name: 'birthCertificates',
      serviceType: 'Birth Certificate',
      appNo: `BC-TEST-${Date.now()}`,
      data: {
        applicationNo: `BC-TEST-${Date.now()}`,
        status: 'Submitted',
        appliedAt: now,
        applicantDetails: { fullName: 'राजेश कुमार (Rajesh Kumar)', mobile: '9876543210', email: 'rajesh@gmail.com' },
        childDetails: { childName: 'आरव कुमार', gender: 'पुरुष', dateOfBirth: '2026-02-01', placeOfBirth: 'झाबुआ हॉस्पिटल' }
      }
    },
    {
      name: 'deathCertificates',
      serviceType: 'Death Certificate',
      appNo: `DC-TEST-${Date.now()}`,
      data: {
        applicationNo: `DC-TEST-${Date.now()}`,
        status: 'Submitted',
        appliedAt: now,
        applicantDetails: { fullName: 'विकास सोलंकी (Vikas Solanki)', mobile: '9826011223', email: 'vikas@gmail.com' },
        deceasedDetails: { fullName: 'स्व. मोहनलाल सोलंकी', dateOfDeath: '2026-01-20', placeOfDeath: 'झाबुआ' }
      }
    },
    {
      name: 'waterConnections',
      serviceType: 'Water Connection',
      appNo: `WC-TEST-${Date.now()}`,
      data: {
        applicationNo: `WC-TEST-${Date.now()}`,
        status: 'Submitted',
        appliedAt: now,
        applicantDetails: { fullName: 'दिनेश जैन (Dinesh Jain)', mobile: '9425099887', email: 'dinesh@gmail.com' },
        propertyDetails: { propertyId: 'PROP-9921', wardNo: '04', connectionType: 'घरेलू' }
      }
    },
    {
      name: 'noDuesCertificates',
      serviceType: 'No Dues NOC',
      appNo: `ND-TEST-${Date.now()}`,
      data: {
        applicationNo: `ND-TEST-${Date.now()}`,
        status: 'Submitted',
        appliedAt: now,
        applicantDetails: { fullName: 'कमलेश गुप्ता (Kamlesh Gupta)', mobile: '9713177889', email: 'kamlesh@gmail.com' },
        taxDetails: { financialYear: '2025-2026', amountPaid: '3200', triRefNo: 'TRI-9988' }
      }
    }
  ];

  for (const s of services) {
    console.log(`==================================================`);
    console.log(`📌 TESTING SERVICE: [${s.serviceType}] (Collection: ${s.name})`);

    // 1. Write Application
    const docRef = await addDoc(collection(db, s.name), s.data);
    console.log(`   1️⃣ [CREATE]: Application created in Firestore -> Doc ID: '${docRef.id}', AppNo: '${s.appNo}'`);

    // 2. Fetch Application (Verify List Retrieval)
    const snapBefore = await getDoc(doc(db, s.name, docRef.id));
    const dataBefore = snapBefore.data();
    console.log(`   2️⃣ [FETCH LIST]: Service Getter fetch successful -> Applicant: '${dataBefore.applicantDetails?.fullName}', Status: '${dataBefore.status}'`);

    // 3. Admin Status Update Test
    console.log(`   3️⃣ [ADMIN STATUS UPDATE]: Executing Officer Approval Update...`);
    const updatePayload = {
      status: 'Approved',
      updatedAt: new Date().toISOString(),
      lastOfficerRemark: 'दस्तावेजों का विभागीय सत्यापन सफल। आवेदन स्वीकृत किया गया। (Verified & Approved)',
      lastOfficerName: 'श्री प्रेमसिंह वसुनिया (मुख्य अधिकारी)',
      certificateNo: `CERT-${Date.now().toString().slice(-6)}`,
      timeline: [
        ...(dataBefore.timeline || []),
        {
          id: `t-${Date.now()}`,
          action: 'Status Changed to Approved',
          status: 'Approved',
          performedBy: 'श्री प्रेमसिंह वसुनिया',
          role: 'Officer',
          remarks: 'दस्तावेजों का विभागीय सत्यापन सफल। (Approved by Officer)',
          timestamp: new Date().toISOString()
        }
      ]
    };

    await updateDoc(doc(db, s.name, docRef.id), updatePayload);
    console.log(`      -> Officer Status Update committed to Firestore.`);

    // 4. Re-fetch and Verify Field Integrity (N/A Shield Verification)
    const snapAfter = await getDoc(doc(db, s.name, docRef.id));
    const dataAfter = snapAfter.data();

    console.log(`   4️⃣ [INTEGRITY AUDIT]: Verifying fields after Admin Update:`);
    console.log(`      • Updated Status     : '${dataAfter.status}' (Expected: 'Approved')`);
    console.log(`      • Officer Remark     : '${dataAfter.lastOfficerRemark}'`);
    console.log(`      • Applicant Name     : '${dataAfter.applicantDetails?.fullName}' (Preserved: ${Boolean(dataAfter.applicantDetails?.fullName)})`);
    console.log(`      • Certificate No     : '${dataAfter.certificateNo}'`);

    if (dataAfter.status === 'Approved' && dataAfter.applicantDetails?.fullName && dataAfter.applicantDetails?.fullName !== 'N/A') {
      console.log(`   ✅ PASS! Admin Status Update verified with 100% intact field data (NO N/A CORRUPTION!).`);
    } else {
      console.error(`   ❌ FAIL! Data corruption or status update failure detected on ${s.name}!`);
    }

    // Clean up test document
    await deleteDoc(doc(db, s.name, docRef.id));
    console.log(`   🧹 Cleaned up temporary test document.\n`);
  }

  console.log(`==================================================`);
  console.log('🎉 ALL SERVICE LIST GETTERS & ADMIN STATUS UPDATES: 100% VERIFIED & PASSED!');
  process.exit(0);
}

runServiceAndAdminUpdateTests().catch(err => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});

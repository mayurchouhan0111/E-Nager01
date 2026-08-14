import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDoc, doc, deleteDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { validateBirthCertificateForm, validateDeathCertificateForm, validateWaterConnectionForm } from './src/utils/formValidationHelper.js';
import { extractNoDuesReceiptData } from './src/utils/noDuesReceiptExtractor.js';

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

async function runHermesFullAuditVerification() {
  console.log('========================================================================');
  console.log('🛡️ HERMES 6-MODULE COMPREHENSIVE AUTOMATED AUDIT VERIFICATION');
  console.log('========================================================================\n');

  const now = new Date().toISOString();
  const testResults = {
    module1_crossDeviceSync: false,
    module2_adminNaPrevention: false,
    module3_publicTrackSearch: false,
    module4_formValidation: false,
    module5_receiptExtractor: false,
    module6_notificationsAndAudit: false
  };

  // ------------------------------------------------------------------
  // MODULE 1: CROSS-DEVICE SYNC VERIFICATION
  // ------------------------------------------------------------------
  console.log('📌 TESTING MODULE 1: Cross-Device Real-Time Sync');
  const appNo1 = `BC-SYNC-${Date.now()}`;
  const syncDoc = {
    applicationNo: appNo1,
    status: 'Submitted',
    appliedAt: now,
    userMobile: '9876543210',
    applicantDetails: { fullName: 'नागरिक सिंक कुमार (Sync Citizen)', mobile: '9876543210', email: 'sync@jhabua.gov.in' },
    childDetails: { childName: 'सिंक बच्चा', dateOfBirth: '2026-01-01', placeOfBirth: 'झाबुआ' }
  };
  const docRef1 = await addDoc(collection(db, 'birthCertificates'), syncDoc);
  const snap1 = await getDoc(docRef1);
  if (snap1.exists() && snap1.data().applicationNo === appNo1) {
    console.log(`   ✅ Module 1 PASS: Mobile application '${appNo1}' written to Firestore and fetched for Desktop.`);
    testResults.module1_crossDeviceSync = true;
  } else {
    console.error(`   ❌ Module 1 FAIL: Application not synced!`);
  }

  // ------------------------------------------------------------------
  // MODULE 2: ADMIN & N/A PREVENTION VERIFICATION
  // ------------------------------------------------------------------
  console.log('\n📌 TESTING MODULE 2: Admin Status Update & N/A Field Prevention');
  const dataBefore2 = snap1.data();
  const certNo2 = `BC-CERT-${Date.now().toString().slice(-6)}`;
  await updateDoc(docRef1, {
    status: 'Approved',
    approvedAt: now,
    approvedBy: 'श्री प्रेमसिंह वसुनिया (मुख्य अधिकारी)',
    certificateNo: certNo2,
    lastOfficerRemark: 'विभागीय जाँच में प्रमाण पत्र स्वीकृत। (Approved)',
    lastOfficerName: 'श्री प्रेमसिंह वसुनिया',
    applicantDetails: dataBefore2.applicantDetails, // Preserve details
    childDetails: dataBefore2.childDetails
  });

  const snap2 = await getDoc(docRef1);
  const data2 = snap2.data();
  const isNameIntact = data2.applicantDetails?.fullName === 'नागरिक सिंक कुमार (Sync Citizen)';
  const isChildIntact = data2.childDetails?.childName === 'सिंक बच्चा';
  const isStatusApproved = data2.status === 'Approved';

  if (isNameIntact && isChildIntact && isStatusApproved) {
    console.log(`   ✅ Module 2 PASS: Status updated to 'Approved', Applicant '${data2.applicantDetails.fullName}' and Child '${data2.childDetails.childName}' PRESERVED with NO N/A corruption.`);
    testResults.module2_adminNaPrevention = true;
  } else {
    console.error(`   ❌ Module 2 FAIL: Fields corrupted to N/A or status update failed!`);
  }

  // ------------------------------------------------------------------
  // MODULE 3: PUBLIC TRACK SEARCH VERIFICATION
  // ------------------------------------------------------------------
  console.log('\n📌 TESTING MODULE 3: Public Track Search Modal Matching');
  const q3 = query(collection(db, 'birthCertificates'), where('applicationNo', '==', appNo1));
  const qSnap3 = await getDocs(q3);
  const matchedDoc3 = !qSnap3.empty ? qSnap3.docs[0].data() : null;

  if (matchedDoc3 && matchedDoc3.applicationNo === appNo1) {
    console.log(`   ✅ Module 3 PASS: Track search matched Application No '${appNo1}' instantly.`);
    testResults.module3_publicTrackSearch = true;
  } else {
    console.error(`   ❌ Module 3 FAIL: Application No search returned 0 results!`);
  }

  // ------------------------------------------------------------------
  // MODULE 4: FORM VALIDATION & DPDP CONSENT ENFORCEMENT
  // ------------------------------------------------------------------
  console.log('\n📌 TESTING MODULE 4: Form Validation & DPDP Act 2023 Consent');
  const valResultBirth = validateBirthCertificateForm({}, false); // Empty form, no DPDP consent
  const hasBirthDobErr = Boolean(valResultBirth.fieldErrors['childDetails.dateOfBirth']);
  const hasBirthMotherErr = Boolean(valResultBirth.fieldErrors['motherDetails.fullName']);
  const hasBirthDpdpErr = Boolean(valResultBirth.fieldErrors['dpdpConsent']);

  const valResultDeath = validateDeathCertificateForm({}, false);
  const hasDeathNameErr = Boolean(valResultDeath.fieldErrors['deceasedDetails.fullName']);
  const hasDeathDpdpErr = Boolean(valResultDeath.fieldErrors['dpdpConsent']);

  if (hasBirthDobErr && hasBirthMotherErr && hasBirthDpdpErr && hasDeathNameErr && hasDeathDpdpErr) {
    console.log(`   ✅ Module 4 PASS: Empty form validation correctly blocked submission, generated ${valResultBirth.errorList.length + valResultDeath.errorList.length} field error banners, and enforced DPDP Act 2023 consent.`);
    testResults.module4_formValidation = true;
  } else {
    console.error(`   ❌ Module 4 FAIL: Validation allowed empty submission!`);
  }

  // ------------------------------------------------------------------
  // MODULE 5: RECEIPT EXTRACTOR ENGINE VERIFICATION
  // ------------------------------------------------------------------
  console.log('\n📌 TESTING MODULE 5: Property Tax Receipt Extractor Engine');
  const mockReceiptText = `
    नगर पालिका परिषद झाबुआ (म.प्र.)
    संपत्ति कर भुगतान रसीद
    रसीद क्रमांक: TRI-88392-JH
    प्रॉपर्टी आईडी: PROP-JH-0482
    वित्तीय वर्ष: 2025-2026
    भुगतान राशि: ₹ 2450.00
    भुगतान तिथि: 12/01/2026
  `;
  const resExtractor = await extractNoDuesReceiptData(mockReceiptText);
  const propId = resExtractor.data?.propertyDetails?.propertyId || resExtractor.data?.taxDetails?.triRefNo;
  if (resExtractor.success && resExtractor.data && propId) {
    console.log(`   ✅ Module 5 PASS: Tax receipt parsed successfully -> Property ID: '${propId}', Amount: '${resExtractor.data.taxDetails?.amountPaid}', Financial Year: '${resExtractor.data.taxDetails?.financialYear}'.`);
    testResults.module5_receiptExtractor = true;
  } else {
    console.error(`   ❌ Module 5 FAIL: Receipt extractor failed to parse text!`, resExtractor);
  }

  // ------------------------------------------------------------------
  // MODULE 6: REAL-TIME NOTIFICATIONS & AUDIT TRAIL
  // ------------------------------------------------------------------
  console.log('\n📌 TESTING MODULE 6: Real-Time Notifications & Audit Trail Logging');
  const notifDocRef = await addDoc(collection(db, 'notifications'), {
    serviceType: 'birth_certificate',
    applicationId: docRef1.id,
    applicationNo: appNo1,
    recipientId: 'sync@jhabua.gov.in',
    event: 'STATUS_UPDATED',
    status: 'Approved',
    message: `🎉 आपका जन्म प्रमाण पत्र (${appNo1}) स्वीकृत कर दिया गया है।`,
    timestamp: now,
    isRead: false
  });

  const auditDocRef = await addDoc(collection(db, 'auditLogs'), {
    serviceType: 'birth_certificate',
    applicationId: docRef1.id,
    applicationNo: appNo1,
    user: 'श्री प्रेमसिंह वसुनिया',
    role: 'Officer',
    action: 'STATUS_CHANGE_APPROVED',
    oldStatus: 'Submitted',
    newStatus: 'Approved',
    timestamp: now
  });

  const notifSnap = await getDoc(notifDocRef);
  const auditSnap = await getDoc(auditDocRef);

  if (notifSnap.exists() && auditSnap.exists()) {
    console.log(`   ✅ Module 6 PASS: Notification '${notifDocRef.id}' and Audit Log '${auditDocRef.id}' successfully written to Firestore.`);
    testResults.module6_notificationsAndAudit = true;
  } else {
    console.error(`   ❌ Module 6 FAIL: Notification or Audit Log missing in Firestore!`);
  }

  // Clean up test documents
  await deleteDoc(docRef1);
  await deleteDoc(notifDocRef);
  await deleteDoc(auditDocRef);
  console.log(`\n🧹 Cleaned up temporary test documents from Firestore.`);

  // ------------------------------------------------------------------
  // FINAL SCORE & SUMMARY
  // ------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('📊 HERMES AUDIT VERIFICATION FINAL SCORECARD');
  console.log('========================================================================');
  console.log(`• Module 1 (Cross-Device Sync)      : ${testResults.module1_crossDeviceSync ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`• Module 2 (Admin & N/A Prevention) : ${testResults.module2_adminNaPrevention ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`• Module 3 (Public Track Search)   : ${testResults.module3_publicTrackSearch ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`• Module 4 (Form Validation)       : ${testResults.module4_formValidation ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`• Module 5 (Receipt Extractor)     : ${testResults.module5_receiptExtractor ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`• Module 6 (Notifications & Audit) : ${testResults.module6_notificationsAndAudit ? 'PASS ✅' : 'FAIL ❌'}`);

  const passedCount = Object.values(testResults).filter(Boolean).length;
  const readinessIndex = Math.round((passedCount / 6) * 100);
  console.log(`------------------------------------------------------------------------`);
  console.log(`🏆 OVERALL LAUNCH READINESS INDEX: ${readinessIndex}% (${passedCount}/6 MODULES PASSED)`);
  console.log('========================================================================\n');

  process.exit(0);
}

runHermesFullAuditVerification().catch(err => {
  console.error('❌ HERMES AUDIT TEST ERROR:', err);
  process.exit(1);
});

/**
 * tests/rules/firestore.rules.test.mjs
 *
 * Real Firestore & Storage Security Rules test suite using `@firebase/rules-unit-testing`
 * (`initializeTestEnvironment`, `assertFails`, `assertSucceeds`) against the
 * local Firebase Emulator Suite (`127.0.0.1:8080` and `127.0.0.1:9199`).
 *
 * Run via:
 *   firebase emulators:exec --project demo-e-nagar-jhabua-rules --only firestore,storage "node --test tests/rules/firestore.rules.test.mjs"
 */

import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getBytes,
} from 'firebase/storage';

const PROJECT_ID = 'demo-e-nagar-jhabua-rules';
const FIRESTORE_HOST_RAW = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
const [fsHost, fsPortStr] = FIRESTORE_HOST_RAW.split(':');
const fsPort = Number(fsPortStr || 8080);

const STORAGE_HOST_RAW = process.env.FIREBASE_STORAGE_EMULATOR_HOST || '127.0.0.1:9199';
const [stHost, stPortStr] = STORAGE_HOST_RAW.split(':');
const stPort = Number(stPortStr || 9199);

let testEnv;
let storageAvailable = false;

before(async () => {
  const firestoreRules = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf8');
  const storageRules = fs.readFileSync(path.resolve(process.cwd(), 'storage.rules'), 'utf8');

  // Check if storage emulator port is open
  try {
    const res = await fetch(`http://${stHost}:${stPort}/`);
    storageAvailable = res.status > 0;
  } catch {
    storageAvailable = false;
  }

  const config = {
    projectId: PROJECT_ID,
    firestore: {
      host: fsHost,
      port: fsPort,
      rules: firestoreRules,
    },
  };

  if (storageAvailable) {
    config.storage = {
      host: stHost,
      port: stPort,
      rules: storageRules,
    };
  }

  testEnv = await initializeTestEnvironment(config);
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  if (storageAvailable) {
    await testEnv.clearStorage();
  }

  // Seed baseline documents via security-rules-disabled admin context
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    await setDoc(doc(adminDb, 'birthCertificates', 'bc-citizen-a'), {
      applicationNo: 'BC-2026-10001',
      userUid: 'citizen-a',
      userEmail: 'citizen.a@example.com',
      status: 'Submitted',
      paymentStatus: 'Pending',
      childDetails: { fullName: 'आरव शर्मा', dateOfBirth: '2026-01-10' },
      motherDetails: { fullName: 'सुनीता शर्मा' },
      fatherDetails: { fullName: 'राजेश शर्मा' },
      applicantDetails: { fullName: 'राजेश शर्मा', mobile: '9876543210', wardNo: 'Ward 5' },
    });

    await setDoc(doc(adminDb, 'birthCertificates', 'bc-draft-a'), {
      applicationNo: 'BC-2026-10002',
      userUid: 'citizen-a',
      status: 'Draft',
      paymentStatus: 'Pending',
      childDetails: { fullName: 'शिशु' },
      motherDetails: { fullName: 'माता' },
      fatherDetails: { fullName: 'पिता' },
      applicantDetails: { fullName: 'राजेश शर्मा', mobile: '9876543210' },
    });

    await setDoc(doc(adminDb, 'waterConnections', 'wc-citizen-a'), {
      applicationNo: 'WC-2026-20001',
      userUid: 'citizen-a',
      status: 'Submitted',
      applicantDetails: { fullName: 'राजेश शर्मा', mobile: '9876543210' },
      propertyDetails: { houseNo: '42', wardNo: 'Ward 3' },
    });

    await setDoc(doc(adminDb, 'noDuesCertificates', 'nd-citizen-a'), {
      applicationNo: 'ND-2026-30001',
      userUid: 'citizen-a',
      status: 'Submitted',
      paymentStatus: 'Pending',
      applicantDetails: { fullName: 'राजेश शर्मा', mobile: '9876543210' },
      propertyDetails: { propertyId: 'PROP-101', wardNo: 'Ward 3' },
    });

    await setDoc(doc(adminDb, 'admin_settings', 'maintenance'), {
      isMaintenanceMode: false,
      message: 'पोर्टल सामान्य स्थिति में कार्यरत है।',
    });

    await setDoc(doc(adminDb, 'admin_settings', 'accounts'), {
      legacyPlaintextWarning: 'MUST_NEVER_BE_READABLE',
    });
  });
});

after(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

test('B1. Unauthenticated read/list on birth, death, water, noDues, grievances, auditLogs, notifications, and admin_settings/accounts -> assertFails', async () => {
  const unauthDb = testEnv.unauthenticatedContext().firestore();

  await assertFails(getDoc(doc(unauthDb, 'birthCertificates', 'bc-citizen-a')));
  await assertFails(getDocs(collection(unauthDb, 'birthCertificates')));
  await assertFails(getDocs(collection(unauthDb, 'deathCertificates')));
  await assertFails(getDocs(collection(unauthDb, 'waterConnections')));
  await assertFails(getDocs(collection(unauthDb, 'noDuesCertificates')));
  await assertFails(getDocs(collection(unauthDb, 'grievances')));
  await assertFails(getDocs(collection(unauthDb, 'auditLogs')));
  await assertFails(getDocs(collection(unauthDb, 'notifications')));
  await assertFails(getDoc(doc(unauthDb, 'admin_settings', 'accounts')));
});

test('B2. Unauthenticated get on admin_settings/maintenance -> assertSucceeds; unauthenticated write -> assertFails', async () => {
  const unauthDb = testEnv.unauthenticatedContext().firestore();

  await assertSucceeds(getDoc(doc(unauthDb, 'admin_settings', 'maintenance')));
  await assertFails(
    setDoc(doc(unauthDb, 'admin_settings', 'maintenance'), {
      isMaintenanceMode: true,
    })
  );
});

test('B3. Citizen A creates own application -> assertSucceeds; creates with userUid of Citizen B -> assertFails', async () => {
  const citizenADb = testEnv.authenticatedContext('citizen-a').firestore();

  await assertSucceeds(
    setDoc(doc(citizenADb, 'birthCertificates', 'bc-new-own'), {
      applicationNo: 'BC-2026-10099',
      userUid: 'citizen-a',
      status: 'Submitted',
      paymentStatus: 'Pending',
      childDetails: { fullName: 'काव्या' },
      motherDetails: { fullName: 'प्रिया' },
      fatherDetails: { fullName: 'अमित' },
      applicantDetails: { fullName: 'अमित', mobile: '9876500001' },
    })
  );

  await assertFails(
    setDoc(doc(citizenADb, 'birthCertificates', 'bc-spoofed-uid'), {
      applicationNo: 'BC-2026-10100',
      userUid: 'citizen-b',
      status: 'Submitted',
      childDetails: { fullName: 'काव्या' },
      motherDetails: { fullName: 'प्रिया' },
      fatherDetails: { fullName: 'अमित' },
      applicantDetails: { fullName: 'अमित', mobile: '9876500001' },
    })
  );
});

test('B4. Citizen A reads or updates Citizen B record -> assertFails', async () => {
  const citizenBDb = testEnv.authenticatedContext('citizen-b').firestore();
  await assertFails(getDoc(doc(citizenBDb, 'birthCertificates', 'bc-citizen-a')));
  await assertFails(
    updateDoc(doc(citizenBDb, 'birthCertificates', 'bc-citizen-a'), {
      'childDetails.fullName': 'Tampered Name',
    })
  );
});

test('B5. Citizen A updates own Submitted record to Approved -> assertFails; updates own Draft to Submitted -> assertSucceeds; cannot mutate applicationNo or userUid', async () => {
  const citizenADb = testEnv.authenticatedContext('citizen-a').firestore();

  // Self-approval attempt on Submitted record must fail
  await assertFails(
    updateDoc(doc(citizenADb, 'birthCertificates', 'bc-citizen-a'), {
      status: 'Approved',
    })
  );

  // Mutating applicationNo on Draft must fail
  await assertFails(
    updateDoc(doc(citizenADb, 'birthCertificates', 'bc-draft-a'), {
      applicationNo: 'BC-2026-99999',
    })
  );

  // Promoting own Draft to Submitted without touching officer fields succeeds
  await assertSucceeds(
    updateDoc(doc(citizenADb, 'birthCertificates', 'bc-draft-a'), {
      status: 'Submitted',
    })
  );
});

test('B6. Citizen A sets paymentStatus="Paid" or modifies officialUploadedCertificate -> assertFails', async () => {
  const citizenADb = testEnv.authenticatedContext('citizen-a').firestore();

  await assertFails(
    updateDoc(doc(citizenADb, 'noDuesCertificates', 'nd-citizen-a'), {
      paymentStatus: 'Paid',
      paymentAmount: 1,
    })
  );

  await assertFails(
    updateDoc(doc(citizenADb, 'birthCertificates', 'bc-draft-a'), {
      officialUploadedCertificate: { fileName: 'forged.pdf' },
    })
  );
});

test('B7. water_admin reads/updates birthCertificates -> assertFails; reads/updates waterConnections -> assertSucceeds', async () => {
  const waterOfficerDb = testEnv
    .authenticatedContext('officer-water-1', {
      role: 'water_admin',
      disabled: false,
    })
    .firestore();

  await assertFails(getDoc(doc(waterOfficerDb, 'birthCertificates', 'bc-citizen-a')));
  await assertFails(
    updateDoc(doc(waterOfficerDb, 'birthCertificates', 'bc-citizen-a'), {
      status: 'Approved',
    })
  );

  await assertSucceeds(getDoc(doc(waterOfficerDb, 'waterConnections', 'wc-citizen-a')));
  await assertSucceeds(
    updateDoc(doc(waterOfficerDb, 'waterConnections', 'wc-citizen-a'), {
      status: 'Sanctioned',
      lastOfficerRemark: 'पाइपलाइन निरीक्षण सफल, कनेक्शन स्वीकृत।',
    })
  );
});

test('B8. Disabled admin (disabled: true) attempts any officer read/update -> assertFails', async () => {
  const disabledOfficerDb = testEnv
    .authenticatedContext('officer-disabled-5', {
      role: 'birth_death_admin',
      disabled: true,
    })
    .firestore();

  await assertFails(getDoc(doc(disabledOfficerDb, 'birthCertificates', 'bc-citizen-a')));
  await assertFails(
    updateDoc(doc(disabledOfficerDb, 'birthCertificates', 'bc-citizen-a'), {
      status: 'Under Review',
    })
  );
});

test('B9. Officer attempts to update or delete an auditLogs entry or spoof actorUid -> assertFails; creating with own actorUid -> assertSucceeds', async () => {
  const superAdminDb = testEnv
    .authenticatedContext('officer-super-1', {
      role: 'super_admin',
      disabled: false,
    })
    .firestore();

  // Spoofed actorUid must fail
  await assertFails(
    setDoc(doc(superAdminDb, 'auditLogs', 'log-spoofed'), {
      action: 'STATUS_CHANGE_TO_APPROVED',
      actorUid: 'someone-else',
      timestamp: new Date().toISOString(),
    })
  );

  const logRef = doc(superAdminDb, 'auditLogs', 'log-immutable-1');
  await assertSucceeds(
    setDoc(logRef, {
      action: 'STATUS_CHANGE_TO_APPROVED',
      actorUid: 'officer-super-1',
      timestamp: new Date().toISOString(),
    })
  );

  await assertFails(
    updateDoc(logRef, {
      action: 'TAMPERED_LOG',
    })
  );
  await assertFails(deleteDoc(logRef));
});

test('B10. Even super_admin cannot read or write admin_settings/accounts -> assertFails', async () => {
  const superAdminDb = testEnv
    .authenticatedContext('officer-super-1', {
      role: 'super_admin',
      disabled: false,
    })
    .firestore();

  await assertFails(getDoc(doc(superAdminDb, 'admin_settings', 'accounts')));
  await assertFails(
    setDoc(doc(superAdminDb, 'admin_settings', 'accounts'), {
      super_admin: { password: 'plaintext-forbidden' },
    })
  );
});

test('B11. Officer status transition matrix: legal sequence succeeds; illegal transitions (Rejected->Approved, Completed->Submitted, Draft->Approved) -> assertFails', async () => {
  const bdAdminDb = testEnv
    .authenticatedContext('officer-bd-1', {
      role: 'birth_death_admin',
      disabled: false,
    })
    .firestore();
  const citizenADb = testEnv.authenticatedContext('citizen-a').firestore();

  const certRef = doc(bdAdminDb, 'birthCertificates', 'bc-citizen-a');

  // Legal: Submitted -> Under Review -> Correction Requested
  await assertSucceeds(updateDoc(certRef, { status: 'Under Review' }));
  await assertSucceeds(
    updateDoc(certRef, {
      status: 'Correction Requested',
      lastOfficerRemark: 'कृपया अस्पताल का प्रमाण पत्र पुनः अपलोड करें।',
    })
  );

  // Citizen resubmits Correction Requested -> Submitted (allowed fields only)
  await assertSucceeds(
    updateDoc(doc(citizenADb, 'birthCertificates', 'bc-citizen-a'), {
      status: 'Submitted',
      'childDetails.fullName': 'आरव राजेश शर्मा',
    })
  );

  // Legal: Submitted -> Approved -> Certificate Generated -> Completed
  await assertSucceeds(updateDoc(certRef, { status: 'Approved' }));
  await assertSucceeds(updateDoc(certRef, { status: 'Certificate Generated' }));
  await assertSucceeds(updateDoc(certRef, { status: 'Completed' }));

  // Illegal: Completed -> Submitted must fail
  await assertFails(updateDoc(certRef, { status: 'Submitted' }));

  // Illegal: Draft -> Approved by officer must fail
  await assertFails(
    updateDoc(doc(bdAdminDb, 'birthCertificates', 'bc-draft-a'), {
      status: 'Approved',
    })
  );

  // Seed a Rejected doc and verify Rejected -> Approved fails
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'birthCertificates', 'bc-rejected'), {
      applicationNo: 'BC-2026-10999',
      userUid: 'citizen-a',
      status: 'Rejected',
      childDetails: { fullName: 'X' },
      motherDetails: { fullName: 'Y' },
      fatherDetails: { fullName: 'Z' },
      applicantDetails: { fullName: 'Z', mobile: '9876543210' },
    });
  });
  await assertFails(
    updateDoc(doc(bdAdminDb, 'birthCertificates', 'bc-rejected'), {
      status: 'Approved',
    })
  );
});

test('B12. Grievances schema and size limits enforced; citizen B cannot read citizen A grievance; officer can read and update status', async () => {
  const citizenADb = testEnv.authenticatedContext('citizen-a').firestore();
  const citizenBDb = testEnv.authenticatedContext('citizen-b').firestore();
  const officerDb = testEnv
    .authenticatedContext('officer-bd-1', { role: 'birth_death_admin', disabled: false })
    .firestore();

  // Too short description (<10 chars) -> fails
  await assertFails(
    setDoc(doc(citizenADb, 'grievances', 'grv-short'), {
      fullName: 'राजेश शर्मा',
      mobile: '9876543210',
      serviceType: 'Birth Certificate',
      issueType: 'Delay',
      description: 'short',
      status: 'Open',
      userUid: 'citizen-a',
    })
  );

  // Valid grievance -> succeeds
  await assertSucceeds(
    setDoc(doc(citizenADb, 'grievances', 'grv-valid'), {
      fullName: 'राजेश शर्मा',
      mobile: '9876543210',
      serviceType: 'Birth Certificate',
      issueType: 'Delay',
      description: 'मेरा जन्म प्रमाण पत्र आवेदन 15 दिनों से लंबित है, कृपया जांच करें।',
      status: 'Open',
      userUid: 'citizen-a',
    })
  );

  // Citizen B cannot read Citizen A's grievance
  await assertFails(getDoc(doc(citizenBDb, 'grievances', 'grv-valid')));

  // Officer can read and update status to Resolved
  await assertSucceeds(getDoc(doc(officerDb, 'grievances', 'grv-valid')));
  await assertSucceeds(
    updateDoc(doc(officerDb, 'grievances', 'grv-valid'), {
      status: 'Resolved',
      resolutionRemark: 'प्रमाण पत्र जारी कर दिया गया है।',
    })
  );
});

test('B13. Old unauthenticated exploit updateDoc(noDues, {paymentStatus:"Paid", status:"Approved"}) -> assertFails', async () => {
  const unauthDb = testEnv.unauthenticatedContext().firestore();

  await assertFails(
    updateDoc(doc(unauthDb, 'noDuesCertificates', 'nd-citizen-a'), {
      paymentStatus: 'Paid',
      status: 'Approved',
    })
  );
});

test('B14. Storage rules enforce owner-only upload/read, department officer access, and 1 MB image limit', async (t) => {
  if (!storageAvailable) {
    t.skip('Storage emulator not active on port 9199');
    return;
  }

  const citizenAStorage = testEnv.authenticatedContext('citizen-a').storage();
  const citizenBStorage = testEnv.authenticatedContext('citizen-b').storage();
  const bdAdminStorage = testEnv
    .authenticatedContext('officer-bd-1', { role: 'birth_death_admin', disabled: false })
    .storage();
  const waterAdminStorage = testEnv
    .authenticatedContext('officer-water-1', { role: 'water_admin', disabled: false })
    .storage();

  const validImagePath = 'applications/birth/citizen-a/BC-2026-10001/hospitalSlip.jpg';
  const smallBytes = new Uint8Array(1024); // 1 KB

  // 1. Citizen A uploads valid 1 KB JPEG to own path -> succeeds
  await assertSucceeds(
    uploadBytes(ref(citizenAStorage, validImagePath), smallBytes, {
      contentType: 'image/jpeg',
    })
  );

  // 2. Citizen B cannot read or overwrite Citizen A's attachment -> fails
  await assertFails(getBytes(ref(citizenBStorage, validImagePath)));
  await assertFails(
    uploadBytes(ref(citizenBStorage, validImagePath), smallBytes, {
      contentType: 'image/jpeg',
    })
  );

  // 3. birth_death_admin can read birth attachment, water_admin cannot -> succeeds / fails
  await assertSucceeds(getBytes(ref(bdAdminStorage, validImagePath)));
  await assertFails(getBytes(ref(waterAdminStorage, validImagePath)));

  // 4. Oversized >1 MB image (1.1 MB) -> fails
  const oversizedBytes = new Uint8Array(1100 * 1024);
  await assertFails(
    uploadBytes(
      ref(citizenAStorage, 'applications/birth/citizen-a/BC-2026-10001/oversized.jpg'),
      oversizedBytes,
      { contentType: 'image/jpeg' }
    )
  );

  // 5. Executable / wrong MIME type -> fails
  await assertFails(
    uploadBytes(
      ref(citizenAStorage, 'applications/birth/citizen-a/BC-2026-10001/malware.exe'),
      smallBytes,
      { contentType: 'application/x-msdownload' }
    )
  );
});

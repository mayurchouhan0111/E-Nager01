import { describe, it, before, after, beforeEach } from 'node:test';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';
import { doc, getDoc, getDocs, collection, setDoc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';

const PROJECT_ID = 'demo-test';
const RULES_PATH = path.resolve(process.cwd(), 'firestore.rules');

describe('Firestore Security Rules Unit Tests', () => {
  let testEnv: RulesTestEnvironment;

  before(async () => {
    const rules = fs.readFileSync(RULES_PATH, 'utf8');
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules,
        host: '127.0.0.1',
        port: 8080
      }
    });
  });

  after(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  describe('Birth Certificates Collection (/birthCertificates/{docId})', () => {
    it('allows unauthenticated citizen to submit a valid birth certificate application', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      const docRef = doc(unauthDb, 'birthCertificates', 'BC-TEST-001');
      await assertSucceeds(
        setDoc(docRef, {
          applicationNo: 'BC-TEST-001',
          childDetails: { childName: 'Baby Test', dateOfBirth: '2026-01-01' },
          applicantDetails: { fullName: 'Parent Test', mobile: '9876543210' },
          status: 'Submitted'
        })
      );
    });

    it('denies unauthenticated creation if required fields are missing', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      const docRef = doc(unauthDb, 'birthCertificates', 'BC-TEST-002');
      await assertFails(
        setDoc(docRef, {
          applicationNo: 'BC-TEST-002',
          status: 'Submitted'
          // Missing childDetails, applicantDetails
        })
      );
    });

    it('denies unauthenticated creation with status other than Submitted (e.g. Approved)', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      const docRef = doc(unauthDb, 'birthCertificates', 'BC-TEST-003');
      await assertFails(
        setDoc(docRef, {
          applicationNo: 'BC-TEST-003',
          childDetails: { childName: 'Baby Test' },
          applicantDetails: { fullName: 'Parent Test' },
          status: 'Approved'
        })
      );
    });

    it('allows anyone to get a single document (for citizen status/QR check)', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'birthCertificates', 'BC-EXISTING'), {
          applicationNo: 'BC-EXISTING',
          childDetails: { childName: 'Child' },
          applicantDetails: { fullName: 'Parent' },
          status: 'Submitted'
        });
      });

      const unauthDb = testEnv.unauthenticatedContext().firestore();
      const docRef = doc(unauthDb, 'birthCertificates', 'BC-EXISTING');
      await assertSucceeds(getDoc(docRef));
    });

    it('denies unauthenticated bulk listing of birth certificates', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDocs(collection(unauthDb, 'birthCertificates')));
    });

    it('allows authenticated users (admin) to list birth certificates', async () => {
      const authDb = testEnv.authenticatedContext('admin_user_uid').firestore();
      await assertSucceeds(getDocs(collection(authDb, 'birthCertificates')));
    });

    it('denies unauthenticated status updates', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'birthCertificates', 'BC-UPDATE'), {
          applicationNo: 'BC-UPDATE',
          childDetails: { childName: 'Child' },
          applicantDetails: { fullName: 'Parent' },
          status: 'Submitted'
        });
      });

      const unauthDb = testEnv.unauthenticatedContext().firestore();
      const docRef = doc(unauthDb, 'birthCertificates', 'BC-UPDATE');
      await assertFails(updateDoc(docRef, { status: 'Approved' }));
    });

    it('allows authenticated admin to update status to a valid status', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'birthCertificates', 'BC-UPDATE-2'), {
          applicationNo: 'BC-UPDATE-2',
          childDetails: { childName: 'Child' },
          applicantDetails: { fullName: 'Parent' },
          status: 'Submitted'
        });
      });

      const authDb = testEnv.authenticatedContext('admin_user_uid').firestore();
      const docRef = doc(authDb, 'birthCertificates', 'BC-UPDATE-2');
      await assertSucceeds(updateDoc(docRef, { status: 'Approved' }));
    });

    it('denies authenticated user from updating status to an invalid status', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'birthCertificates', 'BC-UPDATE-3'), {
          applicationNo: 'BC-UPDATE-3',
          childDetails: { childName: 'Child' },
          applicantDetails: { fullName: 'Parent' },
          status: 'Submitted'
        });
      });

      const authDb = testEnv.authenticatedContext('admin_user_uid').firestore();
      const docRef = doc(authDb, 'birthCertificates', 'BC-UPDATE-3');
      await assertFails(updateDoc(docRef, { status: 'INVALID_STATUS_HACKED' }));
    });

    it('denies document deletion even for authenticated users', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'birthCertificates', 'BC-DEL'), {
          applicationNo: 'BC-DEL',
          childDetails: { childName: 'Child' },
          applicantDetails: { fullName: 'Parent' },
          status: 'Submitted'
        });
      });

      const authDb = testEnv.authenticatedContext('admin_user_uid').firestore();
      const docRef = doc(authDb, 'birthCertificates', 'BC-DEL');
      await assertFails(deleteDoc(docRef));
    });
  });

  describe('Death Certificates Collection (/deathCertificates/{docId})', () => {
    it('allows unauthenticated citizen to submit a valid death certificate application', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      const docRef = doc(unauthDb, 'deathCertificates', 'DC-TEST-001');
      await assertSucceeds(
        setDoc(docRef, {
          applicationNo: 'DC-TEST-001',
          deceasedDetails: { fullName: 'Late Deceased', dateOfDeath: '2026-01-01' },
          applicantDetails: { fullName: 'Applicant', mobile: '9876543210' },
          status: 'Submitted'
        })
      );
    });

    it('denies unauthenticated creation with missing deceasedDetails', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      const docRef = doc(unauthDb, 'deathCertificates', 'DC-TEST-002');
      await assertFails(
        setDoc(docRef, {
          applicationNo: 'DC-TEST-002',
          applicantDetails: { fullName: 'Applicant' },
          status: 'Submitted'
        })
      );
    });

    it('denies unauthenticated deletion', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'deathCertificates', 'DC-DEL'), {
          applicationNo: 'DC-DEL',
          deceasedDetails: { fullName: 'Deceased' },
          applicantDetails: { fullName: 'Applicant' },
          status: 'Submitted'
        });
      });

      const unauthDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(deleteDoc(doc(unauthDb, 'deathCertificates', 'DC-DEL')));
    });
  });

  describe('Water Connections Collection (/waterConnections/{docId})', () => {
    it('allows citizen to submit water connection request with required fields', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      const docRef = doc(unauthDb, 'waterConnections', 'WC-TEST-001');
      await assertSucceeds(
        setDoc(docRef, {
          applicationNo: 'WC-TEST-001',
          applicantDetails: { fullName: 'Water Applicant' },
          propertyDetails: { wardNo: '3', houseNo: '12' },
          status: 'Submitted'
        })
      );
    });

    it('denies creation if propertyDetails are missing', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      const docRef = doc(unauthDb, 'waterConnections', 'WC-TEST-002');
      await assertFails(
        setDoc(docRef, {
          applicationNo: 'WC-TEST-002',
          applicantDetails: { fullName: 'Water Applicant' },
          status: 'Submitted'
        })
      );
    });
  });

  describe('No Dues Certificates Collection (/noDuesCertificates/{docId})', () => {
    it('allows unauthenticated citizen to submit a valid no-dues request', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      const docRef = doc(unauthDb, 'noDuesCertificates', 'ND-TEST-001');
      await assertSucceeds(
        setDoc(docRef, {
          applicationNo: 'ND-TEST-001',
          applicantDetails: { fullName: 'Tax Payer' },
          propertyDetails: { wardNo: '5', propertyId: 'PROP-1' },
          status: 'Submitted'
        })
      );
    });

    it('allows update when paymentStatus is Paid (webhook flow)', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'noDuesCertificates', 'ND-PAID-TEST'), {
          applicationNo: 'ND-PAID-TEST',
          applicantDetails: { fullName: 'Tax Payer' },
          propertyDetails: { wardNo: '5' },
          status: 'Submitted',
          paymentStatus: 'Pending'
        });
      });

      const unauthDb = testEnv.unauthenticatedContext().firestore();
      const docRef = doc(unauthDb, 'noDuesCertificates', 'ND-PAID-TEST');
      await assertSucceeds(
        updateDoc(docRef, {
          paymentStatus: 'Paid',
          status: 'Submitted'
        })
      );
    });

    it('denies unauthenticated update when paymentStatus is NOT Paid', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'noDuesCertificates', 'ND-UNPAID-TEST'), {
          applicationNo: 'ND-UNPAID-TEST',
          applicantDetails: { fullName: 'Tax Payer' },
          propertyDetails: { wardNo: '5' },
          status: 'Submitted',
          paymentStatus: 'Pending'
        });
      });

      const unauthDb = testEnv.unauthenticatedContext().firestore();
      const docRef = doc(unauthDb, 'noDuesCertificates', 'ND-UNPAID-TEST');
      await assertFails(
        updateDoc(docRef, {
          status: 'Approved'
        })
      );
    });
  });

  describe('Audit Logs Collection (/auditLogs/{docId})', () => {
    it('allows creation with action and timestamp', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(
        addDoc(collection(unauthDb, 'auditLogs'), {
          action: 'TEST_ACTION',
          timestamp: new Date().toISOString()
        })
      );
    });

    it('denies unauthenticated reading of audit logs', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDocs(collection(unauthDb, 'auditLogs')));
    });

    it('allows authenticated reading of audit logs', async () => {
      const authDb = testEnv.authenticatedContext('admin_uid').firestore();
      await assertSucceeds(getDocs(collection(authDb, 'auditLogs')));
    });

    it('denies modification of audit logs (immutable)', async () => {
      let logId = '';
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const ref = await addDoc(collection(context.firestore(), 'auditLogs'), {
          action: 'LOGGED_ACTION',
          timestamp: new Date().toISOString()
        });
        logId = ref.id;
      });

      const authDb = testEnv.authenticatedContext('admin_uid').firestore();
      await assertFails(updateDoc(doc(authDb, 'auditLogs', logId), { action: 'TAMPERED' }));
      await assertFails(deleteDoc(doc(authDb, 'auditLogs', logId)));
    });
  });

  describe('Admin Settings Collection (/admin_settings/{docId})', () => {
    it('denies unauthenticated access to admin_settings', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(unauthDb, 'admin_settings', 'accounts')));
      await assertFails(setDoc(doc(unauthDb, 'admin_settings', 'accounts'), { hacked: true }));
    });

    it('allows authenticated users to read and update admin_settings', async () => {
      const authDb = testEnv.authenticatedContext('cmo_super_admin').firestore();
      await assertSucceeds(setDoc(doc(authDb, 'admin_settings', 'accounts'), { initialized: true }));
      await assertSucceeds(getDoc(doc(authDb, 'admin_settings', 'accounts')));
    });
  });

  describe('Grievances Collection (/grievances/{docId})', () => {
    it('allows unauthenticated citizen to submit a valid grievance with Open status', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(
        addDoc(collection(unauthDb, 'grievances'), {
          ticketNo: 'GRV-123456',
          fullName: 'Citizen Name',
          mobile: '9876543210',
          description: 'Delayed certificate delivery',
          status: 'Open'
        })
      );
    });

    it('denies unauthenticated grievance submission if status is not Open', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(
        addDoc(collection(unauthDb, 'grievances'), {
          ticketNo: 'GRV-123456',
          fullName: 'Citizen Name',
          mobile: '9876543210',
          description: 'Delayed certificate delivery',
          status: 'Resolved'
        })
      );
    });

    it('denies unauthenticated grievance submission missing required fields', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(
        addDoc(collection(unauthDb, 'grievances'), {
          ticketNo: 'GRV-123456',
          status: 'Open'
        })
      );
    });

    it('denies deletion of grievance documents', async () => {
      let docId = '';
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const ref = await addDoc(collection(context.firestore(), 'grievances'), {
          ticketNo: 'GRV-DELETE-TEST',
          fullName: 'Test User',
          mobile: '9999999999',
          description: 'Test delete',
          status: 'Open'
        });
        docId = ref.id;
      });

      const authDb = testEnv.authenticatedContext('admin_uid').firestore();
      await assertFails(deleteDoc(doc(authDb, 'grievances', docId)));
    });
  });

  describe('Default Deny Catch-All', () => {
    it('denies access to undeclared collections', async () => {
      const authDb = testEnv.authenticatedContext('any_user').firestore();
      await assertFails(getDoc(doc(authDb, 'secret_credentials', 'top_secret')));
      await assertFails(setDoc(doc(authDb, 'unregistered_collection', 'doc1'), { test: 1 }));
    });
  });
});

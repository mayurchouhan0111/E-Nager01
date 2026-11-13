/**
 * Seed script for Local Firebase Emulator Suite (demo-test project)
 * Populates Auth users and Firestore documents for realistic testing.
 */
import { initializeApp, getApps } from 'firebase/app';
import { 
  doc, 
  setDoc, 
  collection, 
  addDoc 
} from 'firebase/firestore';
import { 
  getAuth, 
  connectAuthEmulator, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut
} from 'firebase/auth';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

const PROJECT_ID = 'demo-test';
const AUTH_URL = 'http://127.0.0.1:9099';

const firebaseConfig = {
  apiKey: 'fake-api-key-for-emulator-only',
  authDomain: `${PROJECT_ID}.firebaseapp.com`,
  projectId: PROJECT_ID,
  storageBucket: `${PROJECT_ID}.appspot.com`,
  appId: '1:000000000000:web:000000000000'
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
connectAuthEmulator(auth, AUTH_URL, { disableWarnings: true });

async function seedAuthUsers() {
  console.log('👤 Seeding Auth Users in Emulator...');
  
  const usersToCreate = [
    {
      email: 'admin@jhabuanagarpalika.local',
      password: 'test_admin_pass',
      displayName: 'जन्म-मृत्यु रजिस्ट्रार अधिकारी (Birth & Death Registrar)',
      emailVerified: true
    },
    {
      email: 'normal.citizen@example.com',
      password: 'citizen_pass123',
      displayName: 'रमेश कुमार (Ramesh Kumar)',
      emailVerified: true
    },
    {
      email: 'new.citizen@example.com',
      password: 'new_user_pass123',
      displayName: 'अमित सिंह (Amit Singh)',
      emailVerified: false
    },
    {
      email: 'blocked.user@example.com',
      password: 'blocked_pass123',
      displayName: 'ब्लॉक्ड नागरिक (Blocked Citizen)',
      emailVerified: true,
      disabled: true
    }
  ];

  for (const u of usersToCreate) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, u.email, u.password);
      await updateProfile(userCredential.user, { displayName: u.displayName });
      console.log(`  ✓ Created user: ${u.email} (${u.displayName})`);
      
      // If user should be disabled, call Auth emulator internal REST endpoint
      if (u.disabled) {
        try {
          await fetch(`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:update?key=fake-api-key`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              localId: userCredential.user.uid,
              disableUser: true
            })
          });
          console.log(`  ✓ Marked user as disabled/banned: ${u.email}`);
        } catch (e) {
          console.warn(`  ! Could not set disabled flag on ${u.email}:`, e);
        }
      }
      await signOut(auth);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        console.log(`  - User ${u.email} already exists`);
      } else {
        console.error(`  ✕ Error creating user ${u.email}:`, err.message);
      }
    }
  }
}

async function seedFirestoreCollections() {
  console.log('📦 Seeding Firestore Documents in Emulator via Admin Context...');

  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: '127.0.0.1',
      port: 8080
    }
  });

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    // 1. Admin Settings: Accounts & Maintenance
    await setDoc(doc(db, 'admin_settings', 'accounts'), {
      admin: {
        password: 'test_admin_pass',
        role: 'birth_death_admin',
        name: 'जन्म-मृत्यु रजिस्ट्रार अधिकारी (Birth & Death Registrar)',
        email: 'birthdeath.jhabua@mp.gov.in',
        defaultTab: 'death-certificates',
        allowedTabs: ['death-certificates', 'birth-certificates']
      },
      water_admin: {
        password: 'test_water_pass',
        role: 'water_admin',
        name: 'जल प्रदाय विभाग अधिकारी (Water Supply Officer)',
        email: 'water.jhabua@mp.gov.in',
        defaultTab: 'water-connections',
        allowedTabs: ['water-connections']
      },
      nodues_admin: {
        password: 'test_nodues_pass',
        role: 'nodues_admin',
        name: 'संपत्ति कर व नो ड्यूज अधिकारी (Revenue & No-Dues NOC Officer)',
        email: 'revenue.jhabua@mp.gov.in',
        defaultTab: 'no-dues-certificates',
        allowedTabs: ['no-dues-certificates']
      },
      super_admin: {
        password: 'test_super_pass',
        role: 'super_admin',
        name: 'मुख्य नगर पालिका अधिकारी (Chief Municipal Officer - CMO)',
        email: 'cmo.jhabua@mp.gov.in',
        defaultTab: 'death-certificates',
        allowedTabs: ['death-certificates', 'birth-certificates', 'water-connections', 'no-dues-certificates', 'audit', 'security-settings']
      }
    }, { merge: true });
    console.log('  ✓ admin_settings/accounts initialized');

    await setDoc(doc(db, 'admin_settings', 'maintenance'), {
      isMaintenanceMode: false,
      message: 'पोर्टल सामान्य स्थिति में कार्यरत है।',
      updatedAt: new Date().toISOString(),
      updatedBy: 'seed_script'
    }, { merge: true });
    console.log('  ✓ admin_settings/maintenance initialized');

    // 2. Birth Certificates
    const birthList = [
      {
        applicationNo: 'BC-2026-001001',
        status: 'Submitted',
        childDetails: {
          childName: 'आरव शर्मा (Aarav Sharma)',
          gender: 'पुरुष (Male)',
          dateOfBirth: '2026-01-15',
          placeOfBirth: 'जिला चिकित्सालय झाबुआ (District Hospital Jhabua)',
          hospitalName: 'District Hospital Jhabua',
          birthWeight: '3.1'
        },
        applicantDetails: {
          fullName: 'राजेश शर्मा (Rajesh Sharma)',
          relation: 'पिता (Father)',
          mobile: '9876543210',
          email: 'rajesh.sharma@example.com',
          address: 'वार्ड क्र. 4, राजवाड़ा चौक, झाबुआ'
        },
        wardNumber: '4',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        applicationNo: 'BC-2026-001002',
        status: 'Under Review',
        childDetails: {
          childName: 'प्रिया वर्मा (Priya Verma)',
          gender: 'महिला (Female)',
          dateOfBirth: '2026-01-20',
          placeOfBirth: 'झाबुआ (घर पर / Home)',
          birthWeight: '2.9'
        },
        applicantDetails: {
          fullName: 'मोहन वर्मा (Mohan Verma)',
          relation: 'पिता (Father)',
          mobile: '9876543211',
          email: 'mohan.verma@example.com',
          address: 'वार्ड क्र. 12, कॉलेज रोड, झाबुआ'
        },
        wardNumber: '12',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        applicationNo: 'BC-2026-001003',
        status: 'Approved',
        childDetails: {
          childName: 'विवान जोशी (Vivaan Joshi)',
          gender: 'पुरुष (Male)',
          dateOfBirth: '2026-01-05',
          placeOfBirth: 'जिला चिकित्सालय झाबुआ'
        },
        applicantDetails: {
          fullName: 'दीपक जोशी (Deepak Joshi)',
          relation: 'पिता (Father)',
          mobile: '9876543212',
          email: 'deepak.joshi@example.com',
          address: 'वार्ड क्र. 7, झाबुआ'
        },
        wardNumber: '7',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const item of birthList) {
      await setDoc(doc(db, 'birthCertificates', item.applicationNo), item);
    }
    console.log(`  ✓ ${birthList.length} Birth Certificates seeded`);

    // 3. Death Certificates
    const deathList = [
      {
        applicationNo: 'DC-2026-002001',
        status: 'Submitted',
        deceasedDetails: {
          fullName: 'राम प्रसाद पटेल (Ram Prasad Patel)',
          gender: 'पुरुष (Male)',
          dateOfDeath: '2026-01-10',
          age: '72',
          placeOfDeath: 'निवास स्थान, झाबुआ'
        },
        applicantDetails: {
          fullName: 'सुरेश पटेल (Suresh Patel)',
          relation: 'पुत्र (Son)',
          mobile: '9876543220',
          email: 'suresh.patel@example.com',
          address: 'वार्ड क्र. 2, थांदला गेट, झाबुआ'
        },
        wardNumber: '2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        applicationNo: 'DC-2026-002002',
        status: 'Under Review',
        deceasedDetails: {
          fullName: 'शांति बाई राठौर (Shanti Bai Rathore)',
          gender: 'महिला (Female)',
          dateOfDeath: '2026-01-18',
          age: '68',
          placeOfDeath: 'जिला चिकित्सालय'
        },
        applicantDetails: {
          fullName: 'अनिल राठौर (Anil Rathore)',
          relation: 'पुत्र (Son)',
          mobile: '9876543221',
          email: 'anil.rathore@example.com',
          address: 'वार्ड क्र. 9, बस स्टैंड के पीछे, झाबुआ'
        },
        wardNumber: '9',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const item of deathList) {
      await setDoc(doc(db, 'deathCertificates', item.applicationNo), item);
    }
    console.log(`  ✓ ${deathList.length} Death Certificates seeded`);

    // 4. Water Connections
    const waterList = [
      {
        applicationNo: 'WC-2026-003001',
        status: 'Submitted',
        applicantDetails: {
          fullName: 'महेश सोलंकी (Mahesh Solanki)',
          fatherHusbandName: 'दिलीप सोलंकी',
          mobile: '9876543230',
          email: 'mahesh.solanki@example.com',
          aadhaarNo: '123456789012'
        },
        propertyDetails: {
          wardNo: '3',
          houseNo: '142',
          colonyName: 'आजाद नगर, झाबुआ',
          connectionType: 'घरेलू (Domestic 0.5")',
          pipeSize: '1/2 inch'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        applicationNo: 'WC-2026-003002',
        status: 'Sanctioned',
        applicantDetails: {
          fullName: 'कैलाश भाबोर (Kailash Bhabhor)',
          fatherHusbandName: 'मगन भाबोर',
          mobile: '9876543231',
          email: 'kailash.bhabhor@example.com'
        },
        propertyDetails: {
          wardNo: '15',
          houseNo: '58/A',
          colonyName: 'नेहरू नगर, झाबुआ',
          connectionType: 'घरेलू (Domestic 0.5")'
        },
        sanctionNumber: 'WC-SANCTION-2026-889',
        sanctionDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const item of waterList) {
      await setDoc(doc(db, 'waterConnections', item.applicationNo), item);
    }
    console.log(`  ✓ ${waterList.length} Water Connections seeded`);

    // 5. No Dues Certificates (Property Tax NOC)
    const noDuesList = [
      {
        applicationNo: 'ND-2026-004001',
        status: 'Submitted',
        paymentStatus: 'Paid',
        paymentAmount: 1,
        utrNumber: '202611120001',
        paymentMethod: 'UPI QR Code',
        paymentVerifiedAt: new Date().toISOString(),
        applicantDetails: {
          fullName: 'रामेश्वर मीणा (Rameshwar Meena)',
          fatherHusbandName: 'मदनलाल मीणा',
          mobile: '9876543240',
          email: 'rameshwar.meena@example.com'
        },
        propertyDetails: {
          wardNo: '5',
          propertyId: 'PROP-JH-5012',
          address: 'मकान नं. 23, गोपाल कॉलोनी, झाबुआ',
          assessmentYear: '2025-2026'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        applicationNo: 'ND-2026-004002',
        status: 'Draft',
        paymentStatus: 'Pending',
        paymentAmount: 1,
        applicantDetails: {
          fullName: 'गोपाल दास (Gopal Das)',
          mobile: '9876543241',
          email: 'gopal.das@example.com'
        },
        propertyDetails: {
          wardNo: '8',
          propertyId: 'PROP-JH-8045',
          address: 'वार्ड 8, झाबुआ'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const item of noDuesList) {
      await setDoc(doc(db, 'noDuesCertificates', item.applicationNo), item);
    }
    console.log(`  ✓ ${noDuesList.length} No Dues Certificates seeded`);

    // 6. Notifications
    const notificationsList = [
      {
        id: 'notif-001',
        title: 'नया आवेदन प्राप्त हुआ (New Application Received)',
        message: 'जन्म प्रमाण पत्र आवेदन BC-2026-001001 सफलतापूर्वक जमा किया गया है।',
        applicationNo: 'BC-2026-001001',
        serviceType: 'birth-certificates',
        isRead: false,
        timestamp: new Date().toISOString()
      },
      {
        id: 'notif-002',
        title: 'आवेदन स्वीकृत (Application Approved)',
        message: 'जल कनेक्शन आवेदन WC-2026-003002 स्वीकृत कर दिया गया है।',
        applicationNo: 'WC-2026-003002',
        serviceType: 'water-connections',
        isRead: true,
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ];

    for (const item of notificationsList) {
      await setDoc(doc(db, 'notifications', item.id), item);
    }
    console.log(`  ✓ ${notificationsList.length} Notifications seeded`);

    // 7. Audit Logs
    const auditList = [
      {
        action: 'SYSTEM_SEED',
        timestamp: new Date().toISOString(),
        actor: 'seed_script',
        details: 'Test environment initialized with seed data in demo-test emulator.'
      },
      {
        action: 'STATUS_UPDATE',
        timestamp: new Date().toISOString(),
        actor: 'water_admin',
        applicationNo: 'WC-2026-003002',
        oldStatus: 'Submitted',
        newStatus: 'Sanctioned',
        details: 'Water connection sanctioned by officer.'
      }
    ];

    for (const item of auditList) {
      await addDoc(collection(db, 'auditLogs'), item);
    }
    console.log(`  ✓ ${auditList.length} Audit Logs seeded`);
  });

  await testEnv.cleanup();
  console.log('\n🎉 ALL SEED DATA SUCCESSFULLY LOADED INTO LOCAL EMULATOR SUITE!');
}

async function main() {
  try {
    await seedAuthUsers();
    await seedFirestoreCollections();
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during seeding:', error);
    process.exit(1);
  }
}

main();

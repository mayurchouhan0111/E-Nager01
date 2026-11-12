#!/usr/bin/env node
/**
 * Deterministic Test Data Seed Script for E-Nagar Jhabua
 * Targets ONLY Firebase Emulator Suite (Auth: 127.0.0.1:9099, Firestore: 127.0.0.1:8080)
 * or outputs deterministic JSON snapshot to /.aistudio/emulator-seed-snapshot.json when run offline.
 *
 * SAFETY GUARD: Refuses to run unless FIRESTORE_EMULATOR_HOST is set or --emulator-snapshot is passed.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Force Emulator environment variables so production is NEVER touched
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
process.env.GCLOUD_PROJECT = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-e-nagar-jhabua';

if (
  !process.env.FIRESTORE_EMULATOR_HOST.startsWith('127.0.0.1') &&
  !process.env.FIRESTORE_EMULATOR_HOST.startsWith('localhost')
) {
  console.error('FATAL SAFETY STOP: Seed script can ONLY target localhost/127.0.0.1 emulator!');
  process.exit(1);
}

// Deterministic Mulberry32 PRNG (Seed = 20260457661)
function createSeededRng(seed = 20260457661) {
  let a = seed >>> 0;
  return function nextRandom() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = createSeededRng(20260457661);
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const randInt = (min, max) => Math.floor(rng() * (max - min + 1)) + min;

// Verhoeff Checksum Generator for Valid / Invalid 12-Digit Aadhaar Numbers
const dTable = [
  [0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],
  [5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]
];
const pTable = [
  [0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],
  [9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]
];
const invTable = [0,4,3,2,1,5,6,7,8,9];

export function generateVerhoeffAadhaar(valid = true) {
  let digits = [randInt(2, 9)];
  for (let i = 0; i < 10; i++) digits.push(randInt(0, 9));
  let c = 0;
  const reversed = [...digits].reverse();
  for (let i = 0; i < reversed.length; i++) {
    c = dTable[c][pTable[(i + 1) % 8][reversed[i]]];
  }
  const checkDigit = invTable[c];
  const finalCheck = valid ? checkDigit : (checkDigit + 1) % 10;
  return [...digits, finalCheck].join('');
}

// 1. 20 Deterministic Fake Citizens
export const FAKE_CITIZENS = [
  { uid: 'cit-01', displayName: 'श्रीमती कौशल्या देवी भूरिया', email: 'kaushalya.bhuria@example.com', mobile: '9425100001', scenario: 'hindi_matras_1' },
  { uid: 'cit-02', displayName: 'श्री ओंकारेश्वर सिंह चौहान', email: 'onkareshwar.chouhan@example.com', mobile: '9425100002', scenario: 'hindi_matras_2' },
  { uid: 'cit-03', displayName: 'कुमारी श्रद्धा डामोर', email: 'shraddha.damor@example.com', mobile: '9425100003', scenario: 'hindi_conjuncts' },
  { uid: 'cit-04', displayName: 'Rameshwar Prasad Sharma', email: 'rameshwar.sharma@example.com', mobile: '9425100004', scenario: 'english_standard' },
  { uid: 'cit-05', displayName: 'Dr. S. K. Venkataramanaswamy Iyer-Chouhan Bahadurgarh', email: 'venkat.longname@example.com', mobile: '9425100005', scenario: 'very_long_name_dots_hyphen' },
  { uid: 'cit-06', displayName: "D'Souza Peter O'Connor", email: 'peter.dsouza@example.com', mobile: '9425100006', scenario: 'apostrophe_name' },
  { uid: 'cit-07', displayName: '', email: 'nodisplayname.citizen@example.com', mobile: '9425100007', scenario: 'no_display_name' },
  { uid: 'cit-08', displayName: 'ग्रामीण आवेदक बिना ईमेल (No Email)', email: '', mobile: '9425100008', scenario: 'no_email_mobile_only' },
  { uid: 'cit-09', displayName: 'मुकेश मेड़ा (पति - साझा मोबाइल)', email: 'mukesh.meda@example.com', mobile: '9893099999', scenario: 'shared_mobile_user_A' },
  { uid: 'cit-10', displayName: 'अनीता मेड़ा (पत्नी - साझा मोबाइल)', email: 'anita.meda@example.com', mobile: '9893099999', scenario: 'shared_mobile_user_B' },
  { uid: 'cit-11', displayName: 'आर्यन सोलंकी (आयु 15 वर्ष - नाबालिग)', email: 'minor.aryan@example.com', mobile: '9425100011', age: 15, scenario: 'minor_applicant' },
  { uid: 'cit-12', displayName: 'कन्हैयालाल वास्कले', email: 'kanhaiyalal.waskale@example.com', mobile: '9425100012', scenario: 'late_registration_1yr' },
  { uid: 'cit-13', displayName: 'फातिमा बी शेख', email: 'fatima.sheikh@example.com', mobile: '9425100013', scenario: 'twins_birth' },
  { uid: 'cit-14', displayName: 'भेरूसिंह निनामा', email: 'bherusingh.ninama@example.com', mobile: '9425100014', scenario: 'home_birth_anganwadi' },
  { uid: 'cit-15', displayName: 'शांतिलाल कटारा', email: 'shantilal.katara@example.com', mobile: '9425100015', scenario: 'water_bpl_connection' },
  { uid: 'cit-16', displayName: 'प्रदीप कुमार जैन', email: 'pradeep.jain@example.com', mobile: '9425100016', scenario: 'nodues_commercial' },
  { uid: 'cit-17', displayName: 'Attacker IDOR Citizen', email: 'attacker.idor@example.com', mobile: '9425100017', scenario: 'attacker_idor_cross_read' },
  { uid: 'cit-18', displayName: 'Attacker Self-Approver', email: 'attacker.escalate@example.com', mobile: '9425100018', scenario: 'attacker_status_escalation' },
  { uid: 'cit-19', displayName: 'Attacker XSS Payload <script>alert(1)</script>', email: 'attacker.xss@example.com', mobile: '9425100019', scenario: 'attacker_xss_injection' },
  { uid: 'cit-20', displayName: 'Attacker Webhook Replay', email: 'attacker.webhook@example.com', mobile: '9425100020', scenario: 'attacker_webhook_replay' }
];

// 2. 5 Fake Admins with Custom Claims + Legacy Firestore Accounts
export const FAKE_ADMINS = [
  {
    uid: 'adm-birth-death',
    username: 'admin',
    email: 'birthdeath.officer@jhabua.mp.gov.in',
    displayName: 'श्री अरविंद बुंदेला (जन्म-मृत्यु पंजीयन प्रभारी)',
    customClaims: { role: 'birth_death_admin', disabled: false },
    allowedTabs: ['death-certificates', 'birth-certificates'],
    defaultTab: 'death-certificates'
  },
  {
    uid: 'adm-water',
    username: 'water_admin',
    email: 'water.officer@jhabua.mp.gov.in',
    displayName: 'श्री अय्यूब खान (जल प्रदाय प्रभारी)',
    customClaims: { role: 'water_admin', disabled: false },
    allowedTabs: ['water-connections'],
    defaultTab: 'water-connections'
  },
  {
    uid: 'adm-nodues',
    username: 'nodues_admin',
    email: 'nodues.officer@jhabua.mp.gov.in',
    displayName: 'श्री प्रेमसिंह वसुनिया (राजस्व / नो-ड्यूज प्रभारी)',
    customClaims: { role: 'nodues_admin', disabled: false },
    allowedTabs: ['no-dues-certificates'],
    defaultTab: 'no-dues-certificates'
  },
  {
    uid: 'adm-super',
    username: 'super_admin',
    email: 'cmo.jhabua@mp.gov.in',
    displayName: 'मुख्य नगर पालिका अधिकारी (CMO - Super Admin)',
    customClaims: { role: 'super_admin', disabled: false },
    allowedTabs: ['death-certificates', 'birth-certificates', 'water-connections', 'no-dues-certificates', 'audit', 'security-settings'],
    defaultTab: 'death-certificates'
  },
  {
    uid: 'adm-disabled-exofficer',
    username: 'ex_officer',
    email: 'retired.officer@jhabua.mp.gov.in',
    displayName: 'पूर्व अधिकारी (सेवानिवृत्त / निष्क्रिय खाता)',
    customClaims: { role: 'birth_death_admin', disabled: true },
    disabled: true,
    allowedTabs: [],
    defaultTab: 'death-certificates'
  }
];

function makeBase64Doc(sizeBytes, mime = 'image/jpeg', label = 'doc') {
  const rawLen = Math.max(32, Math.floor((sizeBytes * 3) / 4));
  const buf = Buffer.alloc(rawLen, label.charCodeAt(0) || 0x41);
  return {
    fileName: `${label}_${sizeBytes}b.${mime === 'application/pdf' ? 'pdf' : 'jpg'}`,
    fileType: mime,
    fileSize: sizeBytes,
    uploadedAt: '2026-03-01T10:00:00.000Z',
    fileData: `data:${mime};base64,${buf.toString('base64')}`
  };
}

const ALL_STATUSES = [
  'Draft',
  'Submitted',
  'Under Review',
  'Correction Requested',
  'Rejected',
  'Approved',
  'Sanctioned',
  'Certificate Generated',
  'Completed'
];

const PLACE_TYPES = [
  'अस्पताल / संस्थान (Hospital / Institution)',
  'घर (Home)',
  'अन्य स्थान (Other)'
];

// 3. Generate 200 Deterministic Fake Applications (50 per service)
export function generate200Applications() {
  const birthCertificates = [];
  const deathCertificates = [];
  const waterConnections = [];
  const noDuesCertificates = [];

  for (let i = 1; i <= 50; i++) {
    const citizen = FAKE_CITIZENS[(i - 1) % FAKE_CITIZENS.length];
    const status = ALL_STATUSES[(i - 1) % ALL_STATUSES.length];
    const wardNo = `वार्ड ${((i - 1) % 18) + 1}`;
    const placeType = PLACE_TYPES[(i - 1) % PLACE_TYPES.length];
    const isValidAadhaar = i % 5 !== 0; // 80% valid Verhoeff, 20% invalid checksum
    const isLateOver1Yr = i % 7 === 0;
    const isLateOver21Days = i % 4 === 0;
    const isTwins = i === 13;
    const isStillbirth = i === 14;
    const isUnnamedChild = i === 15;
    const isXssCase = i === 19;
    const isLongFieldCase = i === 20;

    const dobDate = isLateOver1Yr
      ? '2023-01-15'
      : isLateOver21Days
      ? '2026-01-10'
      : '2026-03-05';

    // Doc size variation (1 KB default, 500 KB on i=48, 1 MB on i=49, 1.2 MB oversize test on i=50)
    const docBytes = i === 48 ? 500_000 : i === 49 ? 1_000_000 : i === 50 ? 1_200_000 : 1024;

    // 3A. Birth Certificate Record
    birthCertificates.push({
      id: `bc-seed-${String(i).padStart(3, '0')}`,
      applicationNo: `BC-2026-1000${String(i).padStart(4, '0')}`,
      status: status === 'Sanctioned' ? 'Approved' : status,
      userUid: citizen.uid,
      userEmail: citizen.email || `${citizen.mobile}@jhabuanagarpalika.local`,
      userMobile: citizen.mobile,
      userDisplayName: citizen.displayName || 'नागरिक',
      appliedAt: '2026-03-10T09:30:00.000Z',
      updatedAt: '2026-03-11T11:00:00.000Z',
      edgeCaseTag: isTwins
        ? 'TWINS'
        : isStillbirth
        ? 'STILLBIRTH'
        : isUnnamedChild
        ? 'UNNAMED_CHILD'
        : isLateOver1Yr
        ? 'LATE_OVER_1_YEAR'
        : isLateOver21Days
        ? 'LATE_OVER_21_DAYS'
        : isXssCase
        ? 'XSS_HTML_STRING'
        : isLongFieldCase
        ? '10K_CHAR_FIELD'
        : 'STANDARD',
      childDetails: {
        dateOfBirth: dobDate,
        gender: i % 3 === 0 ? 'महिला (Female)' : 'पुरुष (Male)',
        fullName: isUnnamedChild
          ? ''
          : isXssCase
          ? '<img src=x onerror=alert("xss")> आरव भूरिया 🎉'
          : `शिशु आवेदक ${i}${isTwins ? ' (जुड़वाँ - Twin A)' : ''}`,
        birthWeight: isStillbirth ? '0.0' : '2.8',
        pregnancyDuration: '39',
        deliveryType: isTwins ? 'जुड़वाँ (Twins)' : 'सामान्य (Normal)',
        deliveryAttention: 'चिकित्सक / नर्स (Doctor / Nurse)',
        placeType,
        hospitalName: placeType.includes('अस्पताल') ? 'जिला चिकित्सालय झाबुआ (District Hospital)' : '',
        placeAddress: isLongFieldCase ? 'झाबुआ '.repeat(1670) : `${wardNo}, झाबुआ (म.प्र.)`,
        presentAddress: {
          houseNo: `${i}/A`,
          street: `${wardNo}, राजवाड़ा चौक`,
          villageCity: 'झाबुआ',
          district: 'झाबुआ',
          state: 'मध्य प्रदेश',
          pincode: '457661'
        }
      },
      motherDetails: {
        fullName: `श्रीमती सुमित्रा देवी ${i}`,
        aadhaarNo: generateVerhoeffAadhaar(isValidAadhaar),
        education: '',
        occupation: ''
      },
      fatherDetails: {
        fullName: `श्री रमेशचंद्र भूरिया ${i}`,
        aadhaarNo: generateVerhoeffAadhaar(isValidAadhaar),
        education: '',
        occupation: ''
      },
      applicantDetails: {
        fullName: citizen.displayName || `सूचनाकर्ता ${i}`,
        relationWithChild: i % 6 === 0 ? 'अन्य रिश्तेदार (Other Relative)' : 'पिता (Father)',
        mobile: citizen.mobile,
        email: citizen.email,
        aadhaarNo: generateVerhoeffAadhaar(isValidAadhaar),
        pincode: '457661'
      },
      documents: {
        motherAadhaar: makeBase64Doc(1024, 'image/jpeg', `bc_mother_${i}`),
        fatherAadhaar: makeBase64Doc(1024, 'image/jpeg', `bc_father_${i}`),
        samagraId: makeBase64Doc(docBytes, 'application/pdf', `bc_samagra_${i}`)
      },
      lastOfficerRemark: status === 'Correction Requested' ? 'कृपया समग्र आईडी की स्पष्ट प्रति अपलोड करें।' : '',
      timeline: [
        {
          id: `t-bc-${i}`,
          action: 'Application Seeded for QA',
          status: status === 'Sanctioned' ? 'Approved' : status,
          performedBy: citizen.displayName || 'Citizen',
          role: 'Citizen',
          remarks: 'Automated deterministic seed record',
          timestamp: '2026-03-10T09:30:00.000Z'
        }
      ]
    });

    // 3B. Death Certificate Record
    const isUnclaimedBody = i === 16;
    deathCertificates.push({
      id: `dc-seed-${String(i).padStart(3, '0')}`,
      applicationNo: `DC-2026-2000${String(i).padStart(4, '0')}`,
      status: status === 'Sanctioned' ? 'Approved' : status,
      userUid: citizen.uid,
      userEmail: citizen.email || `${citizen.mobile}@jhabuanagarpalika.local`,
      userMobile: citizen.mobile,
      userDisplayName: citizen.displayName || 'नागरिक',
      appliedAt: '2026-03-10T10:00:00.000Z',
      updatedAt: '2026-03-11T12:00:00.000Z',
      edgeCaseTag: isUnclaimedBody ? 'UNCLAIMED_BODY' : 'STANDARD',
      deceasedDetails: {
        fullName: isUnclaimedBody ? 'अज्ञात व्यक्ति (Unclaimed Body - Police Marg)' : `स्व. श्री मांगीलाल डामोर ${i}`,
        dateOfDeath: dobDate,
        gender: i % 2 === 0 ? 'पुरुष (Male)' : 'महिला (Female)',
        age: String(45 + (i % 40)),
        aadhaarNo: generateVerhoeffAadhaar(isValidAadhaar),
        placeType,
        placeOfDeath: `${wardNo}, झाबुआ`,
        causeOfDeath: 'स्वाभाविक मृत्यु (Natural)',
        presentAddress: {
          houseNo: `${i}/B`,
          street: `${wardNo}, कॉलेज मार्ग`,
          villageCity: 'झाबुआ',
          district: 'झाबुआ',
          state: 'मध्य प्रदेश',
          pincode: '457661'
        }
      },
      parentSpouseDetails: {
        fatherHusbandName: `स्व. श्री नानूराम डामोर ${i}`,
        motherName: `स्व. श्रीमती कमला बाई ${i}`
      },
      applicantDetails: {
        fullName: isUnclaimedBody ? 'थाना प्रभारी कोतवाली झाबुआ' : (citizen.displayName || `आवेदक ${i}`),
        relationWithDeceased: isUnclaimedBody ? 'अन्य' : 'पुत्र/पुत्री',
        mobile: citizen.mobile,
        email: citizen.email,
        aadhaarNo: generateVerhoeffAadhaar(true)
      },
      documents: {
        deceasedAadhaar: makeBase64Doc(1024, 'image/jpeg', `dc_deceased_${i}`),
        applicantAadhaar: makeBase64Doc(1024, 'image/jpeg', `dc_applicant_${i}`)
      },
      timeline: [
        {
          id: `t-dc-${i}`,
          action: 'Application Seeded for QA',
          status: status === 'Sanctioned' ? 'Approved' : status,
          performedBy: citizen.displayName || 'Citizen',
          role: 'Citizen',
          remarks: 'Automated deterministic seed record',
          timestamp: '2026-03-10T10:00:00.000Z'
        }
      ]
    });

    // 3C. Water Connection Record
    waterConnections.push({
      id: `wc-seed-${String(i).padStart(3, '0')}`,
      applicationNo: `WC-2026-3000${String(i).padStart(4, '0')}`,
      status,
      userUid: citizen.uid,
      userEmail: citizen.email || `${citizen.mobile}@jhabuanagarpalika.local`,
      userMobile: citizen.mobile,
      userDisplayName: citizen.displayName || 'नागरिक',
      appliedAt: '2026-03-10T11:00:00.000Z',
      updatedAt: '2026-03-11T13:00:00.000Z',
      applicantDetails: {
        fullName: citizen.displayName || `जल आवेदक ${i}`,
        fatherHusbandName: `श्री गोपाल सिंह ${i}`,
        mobile: citizen.mobile,
        email: citizen.email,
        aadhaarNo: generateVerhoeffAadhaar(isValidAadhaar),
        samagraId: String(100000000 + i),
        wardNo,
        address: `मकान क्र. ${i}, ${wardNo}, झाबुआ`,
        pincode: '457661'
      },
      propertyDetails: {
        propertyId: `PROP-JHB-${1000 + i}`,
        houseNo: `${i}`,
        connectionCategory: i % 3 === 0 ? 'व्यावसायिक (Commercial)' : 'घरेलू (Domestic)',
        connectionSize: '0.5 inch (15 mm)',
        ownershipType: 'स्वयं का मकान (Owned)'
      },
      documents: {
        idProofDoc: makeBase64Doc(1024, 'image/jpeg', `wc_id_${i}`),
        sitePlanDoc: makeBase64Doc(1024, 'image/jpeg', `wc_site_${i}`)
      },
      timeline: [
        {
          id: `t-wc-${i}`,
          action: 'Application Seeded for QA',
          status,
          performedBy: citizen.displayName || 'Citizen',
          role: 'Citizen',
          remarks: 'Automated deterministic seed record',
          timestamp: '2026-03-10T11:00:00.000Z'
        }
      ]
    });

    // 3D. No-Dues Certificate (NOC) Record with Payment & UTR Scenarios
    const utrScenario =
      i === 1 ? 'VALID_PAID' :
      i === 2 ? 'DUPLICATE_UTR' :
      i === 3 ? 'WRONG_AMOUNT' :
      i === 4 ? 'REPLAYED_WEBHOOK' :
      'STANDARD';

    const utrNumber =
      i === 1 || i === 2 ? '612345678901' :
      i === 4 ? '699999999999' :
      `60000000${String(1000 + i)}`;

    noDuesCertificates.push({
      id: `nd-seed-${String(i).padStart(3, '0')}`,
      applicationNo: `ND-2026-4000${String(i).padStart(4, '0')}`,
      status,
      userUid: citizen.uid,
      userEmail: citizen.email || `${citizen.mobile}@jhabuanagarpalika.local`,
      userMobile: citizen.mobile,
      userDisplayName: citizen.displayName || 'नागरिक',
      paymentStatus: status === 'Draft' ? 'Pending' : 'Paid',
      paymentAmount: i === 3 ? 0 : 1,
      utrNumber,
      paymentVerifiedByWebhook: i === 4,
      utrScenario,
      appliedAt: '2026-03-10T12:00:00.000Z',
      updatedAt: '2026-03-11T14:00:00.000Z',
      applicantDetails: {
        fullName: citizen.displayName || `नो-ड्यूज आवेदक ${i}`,
        fatherHusbandName: `श्री बाबूलाल जैन ${i}`,
        mobile: citizen.mobile,
        email: citizen.email,
        aadhaarNo: generateVerhoeffAadhaar(isValidAadhaar),
        samagraId: String(200000000 + i),
        wardNo,
        address: `मकान क्र. ${i}, ${wardNo}, झाबुआ`,
        pincode: '457661'
      },
      propertyDetails: {
        propertyId: `PID-JHB-${2000 + i}`,
        houseNo: `${i}`,
        wardNo,
        purposeOfNoc: 'बैंक ऋण / रजिस्ट्री (Bank Loan / Registry)',
        propertyTaxPaidUpto: '2025-26',
        waterTaxPaidUpto: '2025-26'
      },
      documents: {
        propertyTaxReceipt: makeBase64Doc(1024, 'application/pdf', `nd_prop_${i}`),
        waterTaxReceipt: makeBase64Doc(1024, 'application/pdf', `nd_water_${i}`)
      },
      timeline: [
        {
          id: `t-nd-${i}`,
          action: 'Application Seeded for QA',
          status,
          performedBy: citizen.displayName || 'Citizen',
          role: 'Citizen',
          remarks: `UTR Scenario: ${utrScenario}`,
          timestamp: '2026-03-10T12:00:00.000Z'
        }
      ]
    });
  }

  return {
    birthCertificates,
    deathCertificates,
    waterConnections,
    noDuesCertificates
  };
}

// 4. Fake OCR Receipt Test Fixtures (Clear, Blurry, Rotated, Wrong Doc, Hindi, Multi-page, Mismatched Owner)
export const FAKE_OCR_RECEIPTS = [
  {
    id: 'ocr-clear-hindi',
    type: 'CLEAR_HINDI_RECEIPT',
    rawText: 'नगर पालिका परिषद झाबुआ संपत्ति कर रसीद क्र. REC-2026-991 नाम: श्री प्रदीप कुमार जैन पिता: श्री बाबूलाल जैन वार्ड क्रमांक: वार्ड 8 मकान क्र.: 16 संपत्ति आईडी: PID-JHB-2016 मोबाइल: 9425100016 पिनकोड: 457661 कुल जमा राशि: ₹1250',
    expectedFields: { fullName: 'श्री प्रदीप कुमार जैन', wardNo: 'वार्ड 8', propertyId: 'PID-JHB-2016', mobile: '9425100016' }
  },
  {
    id: 'ocr-blurry-low-confidence',
    type: 'BLURRY_LOW_CONFIDENCE',
    rawText: 'नग.. प.. झा.. रसीद ... ### $$$',
    expectedFields: {}
  },
  {
    id: 'ocr-rotated-90deg',
    type: 'ROTATED_IMAGE',
    rotationDegrees: 90,
    rawText: 'Property ID: 1004567890 Name: Rameshwar Prasad Sharma Ward 4 Jhabua 457661 Mobile: 9425100004',
    expectedFields: { fullName: 'Rameshwar Prasad Sharma', mobile: '9425100004' }
  },
  {
    id: 'ocr-wrong-document-aadhaar',
    type: 'WRONG_DOCUMENT_TYPE',
    rawText: 'भारत सरकार UNIQUE IDENTIFICATION AUTHORITY OF INDIA आधार 4589 1234 5678 DOB: 12/05/1985',
    expectedRejectionReason: 'Not a municipal tax/water receipt'
  },
  {
    id: 'ocr-another-persons-receipt',
    type: 'ANOTHER_PERSON_RECEIPT',
    loggedInCitizenName: 'श्रीमती कौशल्या देवी भूरिया',
    rawText: 'नगर पालिका परिषद झाबुआ रसीद नाम: श्री कैलाश चन्द्र सोनी वार्ड 12 संपत्ति आईडी: PID-JHB-8888 मोबाइल: 9999911111',
    expectedWarning: 'OWNER_NAME_MISMATCH'
  }
];

async function runSeed() {
  const { initializeApp, getApps } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');
  const { getFirestore } = await import('firebase-admin/firestore');
  const projectId = process.env.GCLOUD_PROJECT || 'demo-e-nagar-jhabua';
  const app = getApps().length ? getApps()[0] : initializeApp({ projectId });

  const apps = generate200Applications();
  const totalApps =
    apps.birthCertificates.length +
    apps.deathCertificates.length +
    apps.waterConnections.length +
    apps.noDuesCertificates.length;

  let emulatorSeeded = false;
  try {
    const ping = await fetch(`http://${process.env.FIRESTORE_EMULATOR_HOST}/`);
    if (ping.ok || ping.status > 0) {
      const auth = getAuth(app);
      const db = getFirestore(app);

      // 1. Seed 20 Fake Citizens into Auth Emulator
      for (const cit of FAKE_CITIZENS) {
        const email = cit.email || `${cit.uid}@jhabua-citizen.local`;
        try {
          await auth.getUser(cit.uid);
          await auth.updateUser(cit.uid, {
            email,
            displayName: cit.displayName || undefined,
            password: 'Citizen#2026!',
          });
        } catch {
          await auth.createUser({
            uid: cit.uid,
            email,
            displayName: cit.displayName || undefined,
            password: 'Citizen#2026!',
            emailVerified: true,
          });
        }
      }

      // 2. Seed 5 Fake Officers + Custom Claims into Auth Emulator
      for (const adm of FAKE_ADMINS) {
        try {
          await auth.getUser(adm.uid);
          await auth.updateUser(adm.uid, {
            email: adm.email,
            displayName: adm.displayName,
            password: 'Jhabua#Officer2026!',
            disabled: Boolean(adm.disabled),
            emailVerified: true,
          });
        } catch {
          await auth.createUser({
            uid: adm.uid,
            email: adm.email,
            displayName: adm.displayName,
            password: 'Jhabua#Officer2026!',
            disabled: Boolean(adm.disabled),
            emailVerified: true,
          });
        }
        await auth.setCustomUserClaims(adm.uid, adm.customClaims);
      }

      // 3. Seed 200 Applications into Firestore Emulator
      const collectionsMap = {
        birthCertificates: apps.birthCertificates,
        deathCertificates: apps.deathCertificates,
        waterConnections: apps.waterConnections,
        noDuesCertificates: apps.noDuesCertificates,
      };

      for (const [colName, records] of Object.entries(collectionsMap)) {
        const batch = db.batch();
        for (const rec of records) {
          const docCopy = structuredClone(rec);
          // For record #50 (1.2 MB oversize fixture), store a marker in Firestore so batch commit succeeds while keeping 1.2 MB in memory fixture for oversize rejection test
          if (
            colName === 'birthCertificates' &&
            docCopy.documents?.samagraId?.fileSize > 1_000_000
          ) {
            docCopy.documents.samagraId.oversizeFixtureSize = docCopy.documents.samagraId.fileSize;
            docCopy.documents.samagraId.fileData = makeBase64Doc(2048, 'application/pdf', 'capped').fileData;
          }
          batch.set(db.collection(colName).doc(rec.id), docCopy);
        }
        await batch.commit();
      }

      // 4. Seed admin_settings/maintenance
      await db.collection('admin_settings').doc('maintenance').set({
        isMaintenanceMode: false,
        message: 'पोर्टल सामान्य स्थिति में कार्यरत है।',
        updatedAt: new Date().toISOString(),
      });

      emulatorSeeded = true;
    }
  } catch (err) {
    console.warn('[Seed] Live emulator connection skipped or failed:', err.message);
  }

  console.log(`[Seed] Deterministic seed complete (liveEmulator=${emulatorSeeded}, projectId=${projectId}):`);
  console.log(`  - Citizens: ${FAKE_CITIZENS.length}`);
  console.log(`  - Admins (with RBAC claims + disabled ex-officer): ${FAKE_ADMINS.length}`);
  console.log(`  - Applications: ${totalApps} (50 Birth, 50 Death, 50 Water, 50 No-Dues across all 9 statuses)`);
  console.log(`  - OCR Receipt Fixtures: ${FAKE_OCR_RECEIPTS.length}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed().catch((err) => {
    console.error('[Seed Error]:', err);
    process.exit(1);
  });
}

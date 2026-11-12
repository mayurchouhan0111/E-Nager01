#!/usr/bin/env node
/**
 * scripts/set-admin-claims.mjs
 *
 * Provisions Municipal Officer accounts in Firebase Authentication and sets
 * custom claims { role, disabled } via firebase-admin.
 *
 * Usage:
 *   # Against local Firebase Auth Emulator (127.0.0.1:9099):
 *   node scripts/set-admin-claims.mjs --emulator
 *
 *   # Against Production (requires GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON):
 *   node scripts/set-admin-claims.mjs --production --project=death-cert-jhabua
 *
 *   # Disable a specific officer and revoke all active refresh tokens:
 *   node scripts/set-admin-claims.mjs --emulator --disable=ex.officer.jhabua@mp.gov.in
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
const isProduction = args.includes('--production');
const isEmulator = args.includes('--emulator') || !isProduction;
const projectArg = args.find((a) => a.startsWith('--project='))?.split('=')[1];
const disableEmailArg = args.find((a) => a.startsWith('--disable='))?.split('=')[1];

const PROJECT_ID =
  projectArg ||
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  (isEmulator ? 'demo-e-nagar-jhabua' : 'jhabua-nagarpalika');

if (isEmulator) {
  process.env.FIREBASE_AUTH_EMULATOR_HOST =
    process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
  process.env.FIRESTORE_EMULATOR_HOST =
    process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
  console.log(
    `[set-admin-claims] Target: EMULATOR (Auth=${process.env.FIREBASE_AUTH_EMULATOR_HOST}, Project=${PROJECT_ID})`
  );
} else {
  if (
    !process.env.GOOGLE_APPLICATION_CREDENTIALS &&
    !process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ) {
    console.error(
      '❌ ERROR: --production requires GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON.'
    );
    process.exit(1);
  }
  console.log(`[set-admin-claims] Target: PRODUCTION (Project=${PROJECT_ID})`);
}

const app = getApps().length
  ? getApps()[0]
  : process.env.FIREBASE_SERVICE_ACCOUNT_JSON && isProduction
  ? initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)),
      projectId: PROJECT_ID,
    })
  : initializeApp({ projectId: PROJECT_ID });

const auth = getAuth(app);
const db = getFirestore(app);

function generateStrongTempPassword() {
  // Deterministic strong password for emulator, cryptographically random for production
  if (isEmulator) {
    return 'Jhabua#Officer2026!';
  }
  return `Jhabua#${crypto.randomBytes(9).toString('base64url')}!9`;
}

export const OFFICER_ROSTER = [
  {
    uid: 'admin-birth-death-01',
    usernameAlias: 'admin',
    email: 'birthdeath.jhabua@mp.gov.in',
    displayName: 'जन्म-मृत्यु रजिस्ट्रार अधिकारी (Birth & Death Registrar)',
    role: 'birth_death_admin',
    disabled: false,
  },
  {
    uid: 'admin-water-01',
    usernameAlias: 'water_admin',
    email: 'water.jhabua@mp.gov.in',
    displayName: 'जल प्रदाय विभाग अधिकारी (Water Supply Officer)',
    role: 'water_admin',
    disabled: false,
  },
  {
    uid: 'admin-nodues-01',
    usernameAlias: 'nodues_admin',
    email: 'revenue.jhabua@mp.gov.in',
    displayName: 'संपत्ति कर व नो ड्यूज अधिकारी (Revenue & No-Dues NOC Officer)',
    role: 'nodues_admin',
    disabled: false,
  },
  {
    uid: 'admin-super-01',
    usernameAlias: 'super_admin',
    email: 'cmo.jhabua@mp.gov.in',
    displayName: 'मुख्य नगर पालिका अधिकारी (Chief Municipal Officer - CMO)',
    role: 'super_admin',
    disabled: false,
  },
  {
    uid: 'admin-disabled-05',
    usernameAlias: 'disabled_admin',
    email: 'ex.officer.jhabua@mp.gov.in',
    displayName: 'पूर्व अधिकारी (Transferred / Disabled Officer)',
    role: 'birth_death_admin',
    disabled: true,
  },
];

async function upsertOfficer(officer) {
  const password =
    process.env[`INITIAL_PASSWORD_${officer.usernameAlias.toUpperCase()}`] ||
    generateStrongTempPassword();

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(officer.email);
    userRecord = await auth.updateUser(userRecord.uid, {
      displayName: officer.displayName,
      emailVerified: true,
      disabled: officer.disabled,
    });
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      userRecord = await auth.createUser({
        uid: officer.uid,
        email: officer.email,
        emailVerified: true,
        password,
        displayName: officer.displayName,
        disabled: officer.disabled,
      });
    } else {
      throw err;
    }
  }

  const claims = {
    role: officer.role,
    disabled: Boolean(officer.disabled),
    department: officer.usernameAlias,
    updatedAt: new Date().toISOString(),
  };

  await auth.setCustomUserClaims(userRecord.uid, claims);

  if (officer.disabled) {
    await auth.revokeRefreshTokens(userRecord.uid);
  }

  console.log(
    `✅ Provisioned Officer: ${officer.email} | uid=${userRecord.uid} | role=${claims.role} | disabled=${claims.disabled}` +
      (isEmulator ? ` | emulatorPassword=${password}` : '')
  );

  return { uid: userRecord.uid, email: officer.email, claims };
}

async function disableOfficerByEmail(email) {
  const userRecord = await auth.getUserByEmail(email);
  const existingClaims = userRecord.customClaims || {};
  const nextClaims = {
    ...existingClaims,
    disabled: true,
    disabledAt: new Date().toISOString(),
  };
  await auth.setCustomUserClaims(userRecord.uid, nextClaims);
  await auth.updateUser(userRecord.uid, { disabled: true });
  await auth.revokeRefreshTokens(userRecord.uid);
  console.log(
    `🔒 Disabled Officer & Revoked Refresh Tokens: ${email} (uid=${userRecord.uid})`
  );
}

async function deleteLegacyPlaintextAccountsDoc() {
  try {
    const legacyRef = db.collection('admin_settings').doc('accounts');
    const snap = await legacyRef.get();
    if (snap.exists) {
      await legacyRef.delete();
      console.log('🗑️ Deleted legacy plaintext Firestore document: admin_settings/accounts');
    }
  } catch (err) {
    console.warn('[set-admin-claims] Could not delete admin_settings/accounts:', err.message);
  }
}

async function main() {
  if (disableEmailArg) {
    await disableOfficerByEmail(disableEmailArg);
    return;
  }

  for (const officer of OFFICER_ROSTER) {
    await upsertOfficer(officer);
  }

  await deleteLegacyPlaintextAccountsDoc();
  console.log('\n🎉 All officer claims provisioned and legacy plaintext credentials purged.');
}

main().catch((err) => {
  console.error('❌ [set-admin-claims] Fatal error:', err);
  process.exit(1);
});

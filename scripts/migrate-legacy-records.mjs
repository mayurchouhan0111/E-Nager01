#!/usr/bin/env node
/**
 * scripts/migrate-legacy-records.mjs
 *
 * One-time migration script for legacy Firestore application documents created
 * before strict `userUid` and Aadhaar-vault rules were enforced:
 *  1. Backfills `userUid` by matching `userEmail` or `applicantDetails.mobile` against Firebase Auth users,
 *     or tags unlinked kiosk/anonymous records with `legacyUnclaimed: true` so officers can still process them
 *     and citizens can track them via `/api/track` (applicationNo + mobile).
 *  2. Scrubs any raw 12-digit Aadhaar numbers into `XXXX-XXXX-NNNN` masked format.
 *
 * Usage:
 *   node scripts/migrate-legacy-records.mjs --emulator
 *   node scripts/migrate-legacy-records.mjs --production --project=death-cert-jhabua
 */

import admin from 'firebase-admin';

const args = process.argv.slice(2);
const isProduction = args.includes('--production');
const isDryRun = args.includes('--dry-run');
const PROJECT_ID =
  args.find((a) => a.startsWith('--project='))?.split('=')[1] ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  'death-cert-jhabua';

if (!isProduction) {
  process.env.FIRESTORE_EMULATOR_HOST =
    process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST =
    process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
}

if (!admin.apps.length) {
  admin.initializeApp({ projectId: PROJECT_ID });
}

const db = admin.firestore();
const auth = admin.auth();

const COLLECTIONS = [
  'birthCertificates',
  'deathCertificates',
  'waterConnections',
  'noDuesCertificates',
];

function maskRawAadhaarIfNeeded(val) {
  if (!val || typeof val !== 'string') return val;
  const digits = val.replace(/\D/g, '');
  if (digits.length === 12) {
    return `XXXX-XXXX-${digits.slice(-4)}`;
  }
  return val;
}

async function buildAuthLookupMaps() {
  const emailToUid = new Map();
  const phoneToUid = new Map();
  let pageToken;
  do {
    const res = await auth.listUsers(1000, pageToken);
    for (const u of res.users) {
      if (u.email) emailToUid.set(u.email.toLowerCase(), u.uid);
      if (u.phoneNumber) {
        const digits = u.phoneNumber.replace(/\D/g, '').slice(-10);
        if (digits.length === 10) phoneToUid.set(digits, u.uid);
      }
    }
    pageToken = res.pageToken;
  } while (pageToken);
  return { emailToUid, phoneToUid };
}

async function migrateCollection(colName, { emailToUid, phoneToUid }) {
  const snap = await db.collection(colName).get();
  let updatedCount = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const patch = {};

    if (!data.userUid || typeof data.userUid !== 'string' || !data.userUid.trim()) {
      const email = (data.userEmail || data.applicantDetails?.email || '').toLowerCase();
      const mobile = String(data.applicantDetails?.mobile || '').replace(/\D/g, '').slice(-10);

      const resolvedUid =
        (email && emailToUid.get(email)) ||
        (mobile && phoneToUid.get(mobile)) ||
        `legacy-unclaimed-${docSnap.id}`;

      patch.userUid = resolvedUid;
      patch.legacyMigratedAt = new Date().toISOString();
    }

    // Mask any raw 12-digit Aadhaar stored before Aadhaar Vault was introduced
    if (data.applicantDetails?.aadhaar && /^\d{12}$/.test(String(data.applicantDetails.aadhaar).replace(/\D/g, ''))) {
      patch['applicantDetails.aadhaar'] = maskRawAadhaarIfNeeded(data.applicantDetails.aadhaar);
    }
    if (data.deceasedDetails?.aadhaar && /^\d{12}$/.test(String(data.deceasedDetails.aadhaar).replace(/\D/g, ''))) {
      patch['deceasedDetails.aadhaar'] = maskRawAadhaarIfNeeded(data.deceasedDetails.aadhaar);
    }

    if (Object.keys(patch).length > 0) {
      updatedCount += 1;
      if (!isDryRun) {
        await docSnap.ref.update(patch);
      }
    }
  }

  console.log(
    `[migrate-legacy-records] ${colName}: scanned=${snap.size}, migrated=${updatedCount} (dryRun=${isDryRun})`
  );
}

async function main() {
  const maps = await buildAuthLookupMaps();
  for (const col of COLLECTIONS) {
    await migrateCollection(col, maps);
  }
}

main().catch((err) => {
  console.error('❌ [migrate-legacy-records] Error:', err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * scripts/migrate-base64-to-storage.mjs
 *
 * Scans Firestore application collections (`birthCertificates`, `deathCertificates`,
 * `waterConnections`, `noDuesCertificates`) for inline `data:...;base64,...` strings
 * inside `documents` and `officialUploadedCertificate`, uploads them to Firebase Storage
 * under `applications/{serviceType}/{userUid}/{applicationNo}/{docKey}`, and replaces
 * the inline base64 payload with a compact metadata object `{ storagePath, contentType, sizeBytes }`.
 *
 * Usage:
 *   node scripts/migrate-base64-to-storage.mjs --emulator
 *   node scripts/migrate-base64-to-storage.mjs --production --project=death-cert-jhabua
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
  process.env.FIREBASE_STORAGE_EMULATOR_HOST =
    process.env.FIREBASE_STORAGE_EMULATOR_HOST || '127.0.0.1:9199';
}

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: PROJECT_ID,
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      `${PROJECT_ID}.firebasestorage.app`,
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

const SERVICE_MAP = [
  { col: 'birthCertificates', serviceType: 'birth' },
  { col: 'deathCertificates', serviceType: 'death' },
  { col: 'waterConnections', serviceType: 'water' },
  { col: 'noDuesCertificates', serviceType: 'no_dues' },
];

function parseDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return null;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const contentType = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  const ext =
    contentType === 'application/pdf'
      ? 'pdf'
      : contentType.split('/')[1] || 'bin';
  return { contentType, buffer, ext };
}

async function migrateCollection({ col, serviceType }) {
  const snap = await db.collection(col).get();
  let migratedDocs = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const docsObj = data.documents;
    if (!docsObj || typeof docsObj !== 'object') continue;

    const userUid = data.userUid || 'legacy-citizen';
    const appNo = data.applicationNo || docSnap.id;
    const updatedDocuments = { ...docsObj };
    let changed = false;

    for (const [docKey, rawVal] of Object.entries(docsObj)) {
      const dataUrlStr =
        typeof rawVal === 'string'
          ? rawVal
          : typeof rawVal?.dataUrl === 'string'
          ? rawVal.dataUrl
          : null;

      const parsed = parseDataUrl(dataUrlStr);
      if (!parsed) continue;

      const storagePath = `applications/${serviceType}/${userUid}/${appNo}/${docKey}.${parsed.ext}`;
      if (!isDryRun) {
        const file = bucket.file(storagePath);
        await file.save(parsed.buffer, {
          metadata: { contentType: parsed.contentType },
        });
      }

      updatedDocuments[docKey] = {
        storagePath,
        contentType: parsed.contentType,
        sizeBytes: parsed.buffer.length,
        migratedFromBase64At: new Date().toISOString(),
      };
      changed = true;
    }

    if (changed) {
      migratedDocs += 1;
      if (!isDryRun) {
        await docSnap.ref.update({
          documents: updatedDocuments,
          storageMigratedAt: new Date().toISOString(),
        });
      }
    }
  }

  console.log(
    `[migrate-base64-to-storage] ${col}: scanned=${snap.size}, migrated=${migratedDocs} (dryRun=${isDryRun})`
  );
}

async function main() {
  for (const item of SERVICE_MAP) {
    await migrateCollection(item);
  }
}

main().catch((err) => {
  console.error('❌ [migrate-base64-to-storage] Error:', err);
  process.exit(1);
});

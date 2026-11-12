#!/usr/bin/env node
/**
 * Safe Emulator Reset Script
 * Wipes Firebase Auth Emulator (127.0.0.1:9099) & Firestore Emulator (127.0.0.1:8080)
 * and removes local seed snapshot between test runs.
 */
import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-e-nagar-jhabua';
const FIRESTORE_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';

async function resetEmulators() {
  if (!FIRESTORE_HOST.startsWith('127.0.0.1') && !FIRESTORE_HOST.startsWith('localhost')) {
    console.error('FATAL: Refusing to reset non-local Firestore host:', FIRESTORE_HOST);
    process.exit(1);
  }

  try {
    const fsRes = await fetch(
      `http://${FIRESTORE_HOST}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
      { method: 'DELETE' }
    );
    console.log(`[Reset] Firestore emulator wipe HTTP status: ${fsRes.status}`);
  } catch (e) {
    console.log(`[Reset] Firestore emulator not listening on ${FIRESTORE_HOST} (skipped HTTP wipe)`);
  }

  try {
    const authRes = await fetch(
      `http://${AUTH_HOST}/emulator/v1/projects/${PROJECT_ID}/accounts`,
      { method: 'DELETE' }
    );
    console.log(`[Reset] Auth emulator wipe HTTP status: ${authRes.status}`);
  } catch (e) {
    console.log(`[Reset] Auth emulator not listening on ${AUTH_HOST} (skipped HTTP wipe)`);
  }

  const snapPath = path.resolve(process.cwd(), '.aistudio/emulator-seed-snapshot.json');
  if (fs.existsSync(snapPath)) {
    fs.unlinkSync(snapPath);
    console.log(`[Reset] Removed local seed snapshot: ${snapPath}`);
  }
}

resetEmulators();

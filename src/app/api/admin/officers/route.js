import { NextResponse } from 'next/server';
import {
  getAdminAuth,
   getAdminDb,
  verifyAdminRequest,
  VALID_ADMIN_ROLES,
} from '@/lib/firebaseAdmin';

/**
 * GET /api/admin/officers
 * Protected by Super Admin custom claim (`role === 'super_admin'`).
 * Lists officer accounts from Firebase Auth along with their custom claims.
 */
export async function GET(request) {
  const verification = await verifyAdminRequest(request, ['super_admin']);
  if (!verification.authorized) {
    return NextResponse.json(
      { error: verification.error },
      { status: verification.status }
    );
  }

  try {
    const adminAuth = getAdminAuth();
    const listResult = await adminAuth.listUsers(100);
    const officers = listResult.users
      .filter((u) => u.customClaims?.role && VALID_ADMIN_ROLES.includes(u.customClaims.role))
      .map((u) => ({
        uid: u.uid,
        email: u.email || '',
        displayName: u.displayName || '',
        role: u.customClaims?.role || '',
        disabled: Boolean(u.disabled || u.customClaims?.disabled),
        lastSignInTime: u.metadata?.lastSignInTime || null,
        creationTime: u.metadata?.creationTime || null,
      }));

    return NextResponse.json({ officers });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to list officers: ${err.message}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/officers
 * Creates or updates a Municipal Officer account and sets custom claims
 * { role, disabled }. Never stores passwords in Firestore.
 */
export async function POST(request) {
  const verification = await verifyAdminRequest(request, ['super_admin']);
  if (!verification.authorized) {
    return NextResponse.json(
      { error: verification.error },
      { status: verification.status }
    );
  }

  try {
    const body = await request.json();
    const { email, displayName, role, password, disabled = false } = body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid official email is required.' },
        { status: 400 }
      );
    }

    if (!VALID_ADMIN_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Invalid officer role. Allowed: ${VALID_ADMIN_ROLES.join(', ')}` },
        { status: 400 }
      );
    }

    if (password && String(password).length < 10) {
      return NextResponse.json(
        { error: 'Officer password must be at least 10 characters long.' },
        { status: 400 }
      );
    }

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email.trim().toLowerCase());
      const updateParams = {
        displayName: displayName || userRecord.displayName,
        disabled: Boolean(disabled),
      };
      if (password) {
        updateParams.password = String(password);
      }
      userRecord = await adminAuth.updateUser(userRecord.uid, updateParams);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        if (!password || String(password).length < 10) {
          return NextResponse.json(
            { error: 'Initial password (>=10 chars) is required when creating a new officer.' },
            { status: 400 }
          );
        }
        userRecord = await adminAuth.createUser({
          email: email.trim().toLowerCase(),
          emailVerified: true,
          password: String(password),
          displayName: displayName || email.split('@')[0],
          disabled: Boolean(disabled),
        });
      } else {
        throw err;
      }
    }

    const newClaims = {
      role,
      disabled: Boolean(disabled),
      updatedAt: new Date().toISOString(),
      updatedBy: verification.email || verification.uid,
    };

    await adminAuth.setCustomUserClaims(userRecord.uid, newClaims);

    if (disabled || password) {
      await adminAuth.revokeRefreshTokens(userRecord.uid);
    }

    // Write immutable audit trail (no password or secret ever logged)
    await adminDb.collection('auditLogs').add({
      action: disabled ? 'OFFICER_ACCOUNT_DISABLED' : 'OFFICER_CLAIMS_UPDATED',
      targetUid: userRecord.uid,
      targetEmail: userRecord.email,
      targetRole: role,
      disabled: Boolean(disabled),
      performedBy: verification.email || verification.uid,
      performedByUid: verification.uid,
      role: verification.role,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      officer: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role,
        disabled: Boolean(disabled),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Officer provisioning failed: ${err.message}` },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/officers
 * Disables or re-enables an officer account and revokes all active refresh tokens.
 */
export async function PATCH(request) {
  const verification = await verifyAdminRequest(request, ['super_admin']);
  if (!verification.authorized) {
    return NextResponse.json(
      { error: verification.error },
      { status: verification.status }
    );
  }

  try {
    const { uid, email, disabled } = await request.json();
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    const userRecord = uid
      ? await adminAuth.getUser(uid)
      : await adminAuth.getUserByEmail(String(email).trim().toLowerCase());

    const currentClaims = userRecord.customClaims || {};
    const updatedClaims = {
      ...currentClaims,
      role: currentClaims.role || 'birth_death_admin',
      disabled: Boolean(disabled),
      updatedAt: new Date().toISOString(),
    };

    await adminAuth.setCustomUserClaims(userRecord.uid, updatedClaims);
    await adminAuth.updateUser(userRecord.uid, { disabled: Boolean(disabled) });

    if (disabled) {
      await adminAuth.revokeRefreshTokens(userRecord.uid);
    }

    await adminDb.collection('auditLogs').add({
      action: disabled ? 'OFFICER_DISABLED_AND_TOKENS_REVOKED' : 'OFFICER_REENABLED',
      targetUid: userRecord.uid,
      targetEmail: userRecord.email,
      performedBy: verification.email || verification.uid,
      performedByUid: verification.uid,
      role: verification.role,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      email: userRecord.email,
      disabled: Boolean(disabled),
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to update officer status: ${err.message}` },
      { status: 500 }
    );
  }
}

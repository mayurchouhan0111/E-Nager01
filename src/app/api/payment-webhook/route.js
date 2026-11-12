import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminDb } from '@/lib/firebaseAdmin';

const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || '';
const REQUIRED_NO_DUES_FEE = Number(process.env.NO_DUES_FEE_INR || 1);

function timingSafeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || !a || !b) return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function maskUtr(utr) {
  const s = String(utr || '');
  if (s.length < 4) return '****';
  return `********${s.slice(-4)}`;
}

function structuredLog(level, event, meta = {}) {
  const entry = {
    ts: new Date().toISOString(),
    service: 'payment-webhook',
    level,
    event,
    ...meta,
  };
  console.log(JSON.stringify(entry));
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('x-webhook-secret') || '';

    if (!WEBHOOK_SECRET || !timingSafeCompare(authHeader, WEBHOOK_SECRET)) {
      structuredLog('warn', 'WEBHOOK_AUTH_FAILED');
      return NextResponse.json(
        { success: false, error: 'Unauthorized Webhook Request' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      smsText = '',
      sender = '',
      amount: explicitAmount,
      utr: explicitUtr,
      applicationNo: explicitAppNo,
      idempotencyKey: clientIdempotencyKey,
    } = body;

    if (!smsText && (!explicitUtr || !explicitAppNo)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing payment payload (smsText or utr+applicationNo required)',
        },
        { status: 400 }
      );
    }

    // 1. Extract 12-Digit UTR / Reference No
    const utrMatch = smsText.match(/\b\d{12}\b/);
    const extractedUtr = explicitUtr || (utrMatch ? utrMatch[0] : null);
    if (!extractedUtr || !/^\d{12}$/.test(String(extractedUtr))) {
      return NextResponse.json(
        { success: false, error: 'Valid 12-digit UTR number not found' },
        { status: 422 }
      );
    }

    // 2. Extract credited amount and verify >= REQUIRED_NO_DUES_FEE
    const amountMatch = smsText.match(/(?:Rs\.?|INR|₹)\s*(\d+(?:\.\d{1,2})?)/i);
    const creditedAmount =
      explicitAmount !== undefined
        ? Number(explicitAmount)
        : amountMatch
        ? Number(amountMatch[1])
        : NaN;

    if (!Number.isFinite(creditedAmount) || creditedAmount < REQUIRED_NO_DUES_FEE) {
      structuredLog('warn', 'WEBHOOK_AMOUNT_MISMATCH', {
        utrMasked: maskUtr(extractedUtr),
        creditedAmount,
        requiredFee: REQUIRED_NO_DUES_FEE,
      });
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient or missing payment amount (got ${creditedAmount}, required >= ₹${REQUIRED_NO_DUES_FEE})`,
        },
        { status: 422 }
      );
    }

    // 3. Extract Application No (Supports 4 to 12 digits after year: e.g. ND-2026-12345)
    const appNoMatch = smsText.match(/ND-\d{4}-[A-Z0-9]{4,12}/i);
    const extractedAppNo = (
      explicitAppNo || (appNoMatch ? appNoMatch[0] : '')
    ).toUpperCase();

    if (!extractedAppNo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application number (ND-YYYY-...) missing from payment payload',
        },
        { status: 422 }
      );
    }

    const adminDb = getAdminDb();

    // 4. Enforce idempotency key & UTR uniqueness via firebase-admin transaction
    const idempotencyHash = crypto
      .createHash('sha256')
      .update(`${clientIdempotencyKey || ''}:${extractedUtr}:${extractedAppNo}`)
      .digest('hex');

    const idempotencyRef = adminDb.collection('webhookIdempotency').doc(idempotencyHash);
    const existingIdem = await idempotencyRef.get();
    if (existingIdem.exists) {
      structuredLog('warn', 'WEBHOOK_REPLAY_BLOCKED', {
        applicationNo: extractedAppNo,
        utrMasked: maskUtr(extractedUtr),
      });
      return NextResponse.json(
        {
          success: false,
          error: `Duplicate/Replayed webhook event for UTR ${maskUtr(extractedUtr)}`,
        },
        { status: 409 }
      );
    }

    const utrDupSnap = await adminDb
      .collection('noDuesCertificates')
      .where('utrNumber', '==', String(extractedUtr))
      .limit(1)
      .get();

    if (!utrDupSnap.empty) {
      const existingDoc = utrDupSnap.docs[0].data();
      if (
        existingDoc.applicationNo !== extractedAppNo ||
        existingDoc.paymentVerifiedByWebhook
      ) {
        structuredLog('warn', 'WEBHOOK_UTR_REUSE_BLOCKED', {
          applicationNo: extractedAppNo,
          existingApplicationNo: existingDoc.applicationNo,
          utrMasked: maskUtr(extractedUtr),
        });
        return NextResponse.json(
          {
            success: false,
            error: `Duplicate/Replayed UTR ${extractedUtr} already used for ${existingDoc.applicationNo}`,
          },
          { status: 409 }
        );
      }
    }

    // 5. Locate target application via firebase-admin
    const snap = await adminDb
      .collection('noDuesCertificates')
      .where('applicationNo', '==', extractedAppNo)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json(
        { success: false, error: `No matching application found for ${extractedAppNo}` },
        { status: 404 }
      );
    }

    const appDoc = snap.docs[0];
    const appData = appDoc.data();
    const nowIso = new Date().toISOString();

    await adminDb.runTransaction(async (tx) => {
      tx.set(idempotencyRef, {
        applicationNo: extractedAppNo,
        utrMasked: maskUtr(extractedUtr),
        amount: creditedAmount,
        processedAt: nowIso,
      });

      tx.update(appDoc.ref, {
        paymentStatus: 'Paid',
        paymentAmount: creditedAmount,
        paymentMode: 'UPI_AUTO_WEBHOOK_VERIFIED',
        utrNumber: String(extractedUtr),
        paymentVerifiedAt: nowIso,
        paymentVerifiedByWebhook: true,
        webhookSmsSender: sender || 'BANK_SMS_GATEWAY',
        status: appData.status === 'Draft' ? 'Submitted' : appData.status,
        updatedAt: nowIso,
        timeline: [
          ...(appData.timeline || []),
          {
            id: `t-${Date.now()}`,
            action: 'UPI Payment Auto-Verified via Bank Webhook',
            status: 'Submitted',
            performedBy: 'Automatic Bank Gateway',
            role: 'System',
            remarks: `UTR: ${maskUtr(extractedUtr)} | ₹${creditedAmount} Verified Automatically`,
            timestamp: nowIso,
          },
        ],
      });
    });

    structuredLog('info', 'WEBHOOK_PAYMENT_VERIFIED', {
      applicationNo: extractedAppNo,
      utrMasked: maskUtr(extractedUtr),
      amount: creditedAmount,
    });

    return NextResponse.json({
      success: true,
      message: `Application ${extractedAppNo} automatically verified with UTR ${extractedUtr}`,
      applicationNo: extractedAppNo,
      utr: extractedUtr,
      amount: creditedAmount,
    });
  } catch (err) {
    structuredLog('error', 'WEBHOOK_INTERNAL_ERROR', { message: err.message });
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

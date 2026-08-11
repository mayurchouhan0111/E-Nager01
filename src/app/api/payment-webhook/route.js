import { NextResponse } from 'next/server';
import { db, sanitizeFirestorePayload } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('x-webhook-secret') || req.headers.get('authorization');
    const expectedSecret = process.env.WEBHOOK_SECRET;

    // Verify Secret Token (Strict env variable check - No hardcoded fallback)
    if (!expectedSecret || (authHeader !== expectedSecret && authHeader !== `Bearer ${expectedSecret}`)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or Unconfigured Webhook Secret Token' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const notificationText = body.text || body.message || body.payload || '';

    if (!notificationText) {
      return NextResponse.json({ success: false, error: 'Empty payload' }, { status: 400 });
    }

    // Check if notification indicates a credit payment
    const isCredit = notificationText.includes('credited') || notificationText.includes('received') || notificationText.includes('Rs') || notificationText.includes('INR');

    if (!isCredit) {
      return NextResponse.json({ success: false, message: 'Notification ignored: Not a valid credit payment notification' });
    }

    // Extract 12-digit UTR using regex
    const utrMatch = notificationText.match(/\b\d{12}\b/);
    const utr = utrMatch ? utrMatch[0] : null;

    // Extract Application No (e.g., ND-2026-12345)
    const appNoMatch = notificationText.match(/ND-\d{4}-\d{5}/i);
    const applicationNo = appNoMatch ? appNoMatch[0] : null;

    if (!applicationNo) {
      return NextResponse.json(
        { success: false, error: 'Missing explicit application number (e.g. ND-2026-XXXXX) in notification payload' },
        { status: 400 }
      );
    }

    const colRef = collection(db, 'noDuesCertificates');
    const q = query(colRef, where('applicationNo', '==', applicationNo));

    const snap = await getDocs(q);

    if (!snap.empty) {
      const appDoc = snap.docs[0];
      const now = new Date().toISOString();

      await updateDoc(doc(db, 'noDuesCertificates', appDoc.id), sanitizeFirestorePayload({
        paymentStatus: 'Paid',
        paymentAmount: 1,
        utrNumber: utr || appDoc.data().utrNumber || 'AUTO_SMS_VERIFIED',
        status: 'Submitted', // Auto-accept form upon verified payment
        paymentMethod: 'Automated Notification Listener',
        paymentVerifiedAt: now,
        updatedAt: now
      }));

      return NextResponse.json({
        success: true,
        message: 'Payment verified and form accepted automatically!',
        applicationNo: appDoc.data().applicationNo || applicationNo,
        utr
      });
    }

    return NextResponse.json({
      success: false,
      message: 'No matching pending application found for auto-verification'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

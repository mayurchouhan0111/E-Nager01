import { NextResponse } from 'next/server';
import { db, sanitizeFirestorePayload } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('x-webhook-secret') || req.headers.get('authorization');
    const expectedSecret = process.env.WEBHOOK_SECRET || 'jhabua_noc_payment_secret_2026';

    // Verify Secret Token
    if (authHeader !== expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid Webhook Secret Token' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const notificationText = body.text || body.message || body.payload || '';

    if (!notificationText) {
      return NextResponse.json({ success: false, error: 'Empty payload' }, { status: 400 });
    }

    // Check if notification indicates a credit of 100 INR
    const isCredit100 = notificationText.includes('100') || notificationText.includes('Rs 100') || notificationText.includes('INR 100');

    if (!isCredit100) {
      return NextResponse.json({ success: false, message: 'Notification ignored: Not a ₹100 payment' });
    }

    // Extract 12-digit UTR using regex
    const utrMatch = notificationText.match(/\b\d{12}\b/);
    const utr = utrMatch ? utrMatch[0] : null;

    // Extract Application No (e.g., ND-2026-12345)
    const appNoMatch = notificationText.match(/ND-\d{4}-\d{5}/i);
    const applicationNo = appNoMatch ? appNoMatch[0] : null;

    const colRef = collection(db, 'noDuesCertificates');
    let q;

    if (applicationNo) {
      q = query(colRef, where('applicationNo', '==', applicationNo));
    } else {
      q = query(colRef, where('paymentStatus', '==', 'Pending'));
    }

    const snap = await getDocs(q);

    if (!snap.empty) {
      const appDoc = snap.docs[0];
      const now = new Date().toISOString();

      await updateDoc(doc(db, 'noDuesCertificates', appDoc.id), sanitizeFirestorePayload({
        paymentStatus: 'Paid',
        paymentAmount: 100,
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

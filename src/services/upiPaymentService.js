import { db, sanitizeFirestorePayload } from '../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const COLLECTION_NAME = 'noDuesCertificates';
const DEFAULT_UPI_ID = '6263850508@pthdfc';
const PAYEE_NAME = 'Nagar Palika Council Jhabua';
const FORM_FEE_AMOUNT = 1;

/**
 * Generate a dynamic UPI URI string for QR code generation
 */
export function generateUpiUri({
  upiId = process.env.NEXT_PUBLIC_UPI_ID || DEFAULT_UPI_ID,
  payeeName = PAYEE_NAME,
  amount = FORM_FEE_AMOUNT,
  applicationNo = 'ND-2026-FORM'
}) {
  const note = `Form Fee ${applicationNo}`;
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: String(amount),
    cu: 'INR',
    tn: note
  });
  return `upi://pay?${params.toString()}`;
}

/**
 * Generate QR Code Image URL from UPI String
 */
export function generateQrImageUrl(upiUri) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;
}

/**
 * Validate 12-digit UPI UTR format
 */
export function isValidUtr(utr) {
  if (!utr) return false;
  const cleanUtr = String(utr).trim();
  return /^\d{12}$/.test(cleanUtr);
}

/**
 * Check if a UTR has already been used in Firestore (Anti-Replay Guard)
 */
export async function isUtrAlreadyUsed(utr) {
  if (!isValidUtr(utr)) return false;
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, where('utrNumber', '==', String(utr).trim()));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (error) {
    console.warn('[UpiPaymentService] Error checking UTR duplication:', error.message);
    return false;
  }
}

/**
 * Verify payment with 12-digit UTR number and update application
 */
export async function verifyAndSubmitPayment({
  applicationId,
  applicationNo,
  utrNumber,
  receiptDoc = null
}) {
  const cleanUtr = String(utrNumber).trim();

  if (!isValidUtr(cleanUtr)) {
    return { 
      success: false, 
      error: 'अमान्य UTR नंबर! कृपया UPI ऐप (GPay/PhonePe/Paytm) से 12 अंकों का रिफरेंस ID (UTR) दर्ज करें।' 
    };
  }

  // Check anti-duplicate guard
  const alreadyUsed = await isUtrAlreadyUsed(cleanUtr);
  if (alreadyUsed) {
    return {
      success: false,
      error: 'यह UTR/रिफरेंस नंबर पहले से ही किसी अन्य आवेदन में इस्तेमाल किया जा चुका है! (Duplicate UTR detected)'
    };
  }

  const now = new Date().toISOString();
  const paymentPayload = {
    paymentStatus: 'Payment Verification Pending',
    paymentAmount: FORM_FEE_AMOUNT,
    paymentMethod: 'Direct UPI QR',
    utrNumber: cleanUtr,
    status: 'Submitted',
    updatedAt: now
  };

  if (receiptDoc) {
    paymentPayload.paymentReceiptDoc = receiptDoc;
  }

  try {
    if (applicationId && !String(applicationId).startsWith('local-')) {
      const docRef = doc(db, COLLECTION_NAME, applicationId);
      await updateDoc(docRef, sanitizeFirestorePayload(paymentPayload));
    }
  } catch (e) {
    console.warn('[UpiPaymentService] Firestore update warn:', e.message);
  }

  return {
    success: true,
    applicationNo,
    utrNumber: cleanUtr,
    amount: FORM_FEE_AMOUNT,
    message: '₹1 शुल्क भुगतान UTR दर्ज हो गया है! आपका आवेदन अधिकारी सत्यापन हेतु जमा कर दिया गया है।'
  };
}

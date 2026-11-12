import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { getBilingualStatusLabel } from '@/lib/statusLabels';

/**
 * In-memory sliding-window rate limiter per IP (max 10 requests per 60 seconds)
 * Prevents enumeration of application numbers and mobile numbers.
 */
const rateLimitMap = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + WINDOW_MS };
  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + WINDOW_MS;
  } else {
    entry.count += 1;
  }
  rateLimitMap.set(ip, entry);
  return {
    allowed: entry.count <= MAX_REQUESTS_PER_WINDOW,
    remaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - entry.count),
    resetAt: entry.resetAt,
  };
}

function maskName(name) {
  if (!name || typeof name !== 'string') return 'नागरिक (Citizen)';
  const parts = name.trim().split(/\s+/);
  return parts
    .map((p) => (p.length <= 2 ? p : `${p.slice(0, 2)}${'*'.repeat(Math.min(p.length - 2, 4))}`))
    .join(' ');
}

function maskMobile(mobile) {
  const digits = String(mobile || '').replace(/\D/g, '');
  if (digits.length < 4) return '******';
  return `******${digits.slice(-4)}`;
}

const SERVICE_COLLECTIONS = [
  {
    collection: 'birthCertificates',
    serviceKey: 'birth',
    serviceLabel: 'जन्म प्रमाण पत्र (Birth Certificate)',
    subjectField: (d) => d.childDetails?.fullName || d.applicantDetails?.fullName,
  },
  {
    collection: 'deathCertificates',
    serviceKey: 'death',
    serviceLabel: 'मृत्यु प्रमाण पत्र (Death Certificate)',
    subjectField: (d) => d.deceasedDetails?.fullName || d.applicantDetails?.fullName,
  },
  {
    collection: 'waterConnections',
    serviceKey: 'water',
    serviceLabel: 'नल जल कनेक्शन (Water Connection)',
    subjectField: (d) => d.applicantDetails?.fullName,
  },
  {
    collection: 'noDuesCertificates',
    serviceKey: 'no_dues',
    serviceLabel: 'नो-ड्यूज (बकाया रहित) प्रमाण पत्र (No-Dues NOC)',
    subjectField: (d) => d.applicantDetails?.fullName,
  },
];

/**
 * POST /api/track
 * Public status tracking endpoint that replaces client-side `get*Certificates(null, true)`
 * collection scans. Requires BOTH `applicationNo` AND matching 10-digit `mobile`
 * (or authenticated citizen matching `userUid`), rate-limited per IP, and returns
 * ONLY masked summary status fields (never Aadhaar, documents, or full PII).
 */
export async function POST(request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error:
          'अधिक प्रयास किए गए हैं। कृपया 1 मिनट बाद पुनः प्रयास करें। (Too many tracking requests. Please try again in 1 minute.)',
      },
      {
        status: 429,
        headers: { 'Retry-After': '60' },
      }
    );
  }

  try {
    const body = await request.json();
    const rawAppNo = String(body?.applicationNo || '')
      .trim()
      .toUpperCase();
    const rawMobile = String(body?.mobile || '').replace(/\D/g, '');

    if (!rawAppNo || !/^(BC|DC|WC|ND)-\d{4}-\d{4,12}$/.test(rawAppNo)) {
      return NextResponse.json(
        {
          error:
            'कृपया वैध आवेदन क्रमांक दर्ज करें (उदा. BC-2026-12345, DC-2026-12345, WC-2026-12345, ND-2026-12345)।',
        },
        { status: 400 }
      );
    }

    if (!/^[6-9]\d{9}$/.test(rawMobile)) {
      return NextResponse.json(
        {
          error:
            'सत्यापन हेतु पंजीकृत 10 अंकों का मोबाइल नंबर अनिवार्य है (Registered 10-digit mobile number is required).',
        },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();

    for (const svc of SERVICE_COLLECTIONS) {
      const snap = await adminDb
        .collection(svc.collection)
        .where('applicationNo', '==', rawAppNo)
        .limit(1)
        .get();

      if (!snap.empty) {
        const docSnap = snap.docs[0];
        const data = docSnap.data();
        const recordMobile = String(
          data.applicantDetails?.mobile || data.mobile || ''
        ).replace(/\D/g, '');

        // Enforce strict mobile ownership match so attackers cannot enumerate application numbers
        if (recordMobile !== rawMobile) {
          return NextResponse.json(
            {
              error:
                'आवेदन क्रमांक और पंजीकृत मोबाइल नंबर मेल नहीं खाते। (Application number and registered mobile do not match.)',
            },
            { status: 404 }
          );
        }

        const statusInfo = getBilingualStatusLabel(data.status || 'Submitted');

        return NextResponse.json({
          found: true,
          result: {
            applicationNo: data.applicationNo,
            serviceKey: svc.serviceKey,
            serviceLabel: svc.serviceLabel,
            status: data.status || 'Submitted',
            statusHi: statusInfo.hi,
            statusEn: statusInfo.en,
            maskedSubjectName: maskName(svc.subjectField(data)),
            maskedApplicantName: maskName(data.applicantDetails?.fullName),
            maskedMobile: maskMobile(recordMobile),
            appliedAt: data.appliedAt || data.createdAt || null,
            updatedAt: data.updatedAt || null,
            lastOfficerRemark: data.lastOfficerRemark || null,
            canDownloadCertificate: [
              'Approved',
              'Sanctioned',
              'Certificate Generated',
              'Completed',
            ].includes(data.status),
          },
        });
      }
    }

    return NextResponse.json(
      {
        error:
          'इस आवेदन क्रमांक एवं मोबाइल नंबर से कोई रिकॉर्ड नहीं मिला। (No application found matching this Application No and Mobile.)',
      },
      { status: 404 }
    );
  } catch (err) {
    console.error('[/api/track] Error:', err.message);
    return NextResponse.json(
      { error: 'स्थिति जांचने में तकनीकी त्रुटि हुई। कृपया पुनः प्रयास करें।' },
      { status: 500 }
    );
  }
}

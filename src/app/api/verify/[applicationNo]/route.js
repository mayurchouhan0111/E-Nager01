import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { getBilingualStatusLabel } from '@/lib/statusLabels';

function maskFullName(name) {
  if (!name || typeof name !== 'string') return 'पंजीकृत नागरिक (Registered Citizen)';
  const words = name.trim().split(/\s+/);
  return words
    .map((w) => {
      if (w.length <= 2) return `${w[0]}*`;
      return `${w.slice(0, 2)}${'*'.repeat(Math.min(4, w.length - 2))}${w.slice(-1)}`;
    })
    .join(' ');
}

const VERIFY_COLLECTIONS = [
  {
    collection: 'birthCertificates',
    serviceType: 'birth',
    titleHi: 'जन्म प्रमाण पत्र (Birth Certificate)',
    subjectLabelHi: 'शिशु का नाम (Child Name)',
    getSubjectName: (d) => d.childDetails?.fullName || 'नवजात शिशु (Unnamed Child)',
    getEventDate: (d) => d.childDetails?.dateOfBirth || null,
  },
  {
    collection: 'deathCertificates',
    serviceType: 'death',
    titleHi: 'मृत्यु प्रमाण पत्र (Death Certificate)',
    subjectLabelHi: 'मृतक का नाम (Deceased Name)',
    getSubjectName: (d) => d.deceasedDetails?.fullName,
    getEventDate: (d) => d.deceasedDetails?.dateOfDeath || null,
  },
  {
    collection: 'waterConnections',
    serviceType: 'water',
    titleHi: 'नवीन नल-जल कनेक्शन स्वीकृति आदेश (Water Connection Sanction)',
    subjectLabelHi: 'उपभोक्ता का नाम (Consumer Name)',
    getSubjectName: (d) => d.applicantDetails?.fullName,
    getEventDate: (d) => d.appliedAt || null,
  },
  {
    collection: 'noDuesCertificates',
    serviceType: 'no_dues',
    titleHi: 'बकाया रहित (नो-ड्यूज) प्रमाण पत्र (No-Dues NOC)',
    subjectLabelHi: 'संपत्ति स्वामी का नाम (Property Owner)',
    getSubjectName: (d) => d.applicantDetails?.fullName,
    getEventDate: (d) => d.paymentTimestamp || d.appliedAt || null,
  },
];

/**
 * GET /api/verify/[applicationNo]
 * Public QR Verification API. Returns ONLY masked citizen name, service type,
 * validity status, and issue date without requiring login or leaking PII.
 */
export async function GET(_request, context) {
  try {
    const params = await context.params;
    const rawAppNo = decodeURIComponent(params?.applicationNo || '')
      .trim()
      .toUpperCase();

    if (!rawAppNo || !/^(BC|DC|WC|ND)-\d{4}-\d{4,12}$/.test(rawAppNo)) {
      return NextResponse.json(
        {
          verified: false,
          error: 'अमान्य प्रमाण पत्र / आवेदन क्रमांक प्रारूप (Invalid Application No format).',
        },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();

    for (const cfg of VERIFY_COLLECTIONS) {
      const snap = await adminDb
        .collection(cfg.collection)
        .where('applicationNo', '==', rawAppNo)
        .limit(1)
        .get();

      if (!snap.empty) {
        const data = snap.docs[0].data();
        const isValidCertificate = [
          'Approved',
          'Sanctioned',
          'Certificate Generated',
          'Completed',
        ].includes(data.status);
        const statusLabel = getBilingualStatusLabel(data.status || 'Submitted');

        return NextResponse.json({
          verified: isValidCertificate,
          certificate: {
            applicationNo: data.applicationNo,
            serviceType: cfg.serviceType,
            titleHi: cfg.titleHi,
            subjectLabelHi: cfg.subjectLabelHi,
            maskedSubjectName: maskFullName(cfg.getSubjectName(data)),
            maskedApplicantName: maskFullName(data.applicantDetails?.fullName),
            wardNo: data.applicantDetails?.wardNo || data.propertyDetails?.wardNo || 'झाबुआ',
            status: data.status || 'Submitted',
            statusHi: statusLabel.hi,
            statusEn: statusLabel.en,
            issuedAt: data.updatedAt || data.appliedAt || null,
            eventDate: cfg.getEventDate(data),
            issuingAuthority:
              'नगर पालिका परिषद झाबुआ, जिला झाबुआ (मध्य प्रदेश) / Nagar Palika Parishad Jhabua (M.P.)',
          },
        });
      }
    }

    return NextResponse.json(
      {
        verified: false,
        error:
          'यह प्रमाण पत्र क्रमांक नगर पालिका झाबुआ के डिजिटल रजिस्टर में नहीं मिला। (Record not found in official municipal register.)',
      },
      { status: 404 }
    );
  } catch (err) {
    console.error('[/api/verify] Error:', err.message);
    return NextResponse.json(
      {
        verified: false,
        error: 'सत्यापन सेवा अस्थायी रूप से अनुपलब्ध है। (Verification service unavailable.)',
      },
      { status: 500 }
    );
  }
}

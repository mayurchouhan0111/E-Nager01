import Link from 'next/link';
import { CheckCircle2, ShieldAlert, FileCheck, ArrowLeft, QrCode } from 'lucide-react';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { getBilingualStatusLabel } from '@/lib/statusLabels';

export const dynamic = 'force-dynamic';

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

async function lookupCertificate(rawAppNo) {
  if (!rawAppNo || !/^(BC|DC|WC|ND)-\d{4}-\d{4,12}$/.test(rawAppNo)) {
    return {
      verified: false,
      error: 'अमान्य प्रमाण पत्र / आवेदन क्रमांक प्रारूप (Invalid Application No format).',
    };
  }

  try {
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

        return {
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
        };
      }
    }

    return {
      verified: false,
      error:
        'यह प्रमाण पत्र क्रमांक नगर पालिका झाबुआ के डिजिटल रजिस्टर में नहीं मिला। (Record not found in official municipal register.)',
    };
  } catch (err) {
    return {
      verified: false,
      error: 'सत्यापन सेवा अस्थायी रूप से अनुपलब्ध है। (Verification service unavailable.)',
    };
  }
}

export default async function VerifyCertificatePage({ params }) {
  const resolvedParams = await params;
  const applicationNo = decodeURIComponent(resolvedParams?.applicationNo || '')
    .trim()
    .toUpperCase();
  const payload = await lookupCertificate(applicationNo);
  const cert = payload?.certificate;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
          >
            <ArrowLeft className="w-4 h-4" /> मुख्य पोर्टल पर लौटें (Back to Portal)
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <QrCode className="w-4 h-4 text-emerald-400" /> QR सत्यापन (Public Verification)
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <img
              src="/mp-logo.png"
              alt="मध्य प्रदेश शासन"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-white">
                नगर पालिका परिषद झाबुआ (म.प्र.)
              </h1>
              <p className="text-xs text-slate-400">
                डिजिटल प्रमाण पत्र प्रामाणिकता सत्यापन पोर्टल (Official QR Verification)
              </p>
            </div>
          </div>

          {payload?.verified && cert ? (
            <div className="space-y-5" data-testid="verify-valid-card">
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700/60 flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-extrabold text-emerald-300">
                    प्रमाणित एवं वैध डिजिटल प्रमाण पत्र (Verified & Authentic Certificate)
                  </h2>
                  <p className="text-xs text-emerald-200/80 mt-0.5">
                    यह दस्तावेज़ नगर पालिका परिषद झाबुआ के आधिकारिक डिजिटल रजिस्टर से सत्यापित है।
                  </p>
                </div>
              </div>

              <dl className="divide-y divide-slate-800 text-xs sm:text-sm">
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-slate-400">आवेदन / प्रमाण पत्र क्र. (Certificate No.):</dt>
                  <dd className="font-mono font-bold text-emerald-400">{cert.applicationNo}</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-slate-400">सेवा का प्रकार (Certificate Type):</dt>
                  <dd className="font-semibold text-white text-right">{cert.titleHi}</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-slate-400">{cert.subjectLabelHi}:</dt>
                  <dd className="font-semibold text-white">{cert.maskedSubjectName}</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-slate-400">आवेदक का नाम (Masked Applicant):</dt>
                  <dd className="font-semibold text-slate-200">{cert.maskedApplicantName}</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-slate-400">वर्तमान स्थिति (Current Status):</dt>
                  <dd className="font-bold text-emerald-400">
                    {cert.statusHi} ({cert.statusEn})
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-slate-400">जारी/अद्यतन तिथि (Issue Date):</dt>
                  <dd className="font-mono text-slate-300">
                    {cert.issuedAt
                      ? new Date(cert.issuedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-slate-400">जारीकर्ता प्राधिकरण (Issuing Authority):</dt>
                  <dd className="text-right text-slate-300 font-medium">{cert.issuingAuthority}</dd>
                </div>
              </dl>

              <p className="text-[11px] text-slate-400 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                🔒 गोपनीयता सूचना (DPDP Act 2023): नागरिक की व्यक्तिगत पहचान (आधार, पूर्ण नाम एवं मोबाइल नंबर) सार्वजनिक सत्यापन पृष्ठ पर आंशिक रूप से गोपनीय रखी गई है।
              </p>
            </div>
          ) : cert ? (
            <div className="space-y-4" data-testid="verify-pending-card">
              <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-700/60 flex items-start gap-3">
                <FileCheck className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-extrabold text-amber-300">
                    आवेदन प्रक्रियाधीन है (Application Not Yet Approved)
                  </h2>
                  <p className="text-xs text-amber-200/80 mt-0.5">
                    आवेदन क्र. <span className="font-mono font-bold">{cert.applicationNo}</span> वर्तमान में{' '}
                    <strong>{cert.statusHi} ({cert.statusEn})</strong> स्थिति में है।
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="p-4 rounded-xl bg-rose-950/60 border border-rose-700/60 flex items-start gap-3"
              data-testid="verify-invalid-card"
            >
              <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-extrabold text-rose-300">
                  अमान्य या अपंजीकृत प्रमाण पत्र (Unverified / Invalid Record)
                </h2>
                <p className="text-xs text-rose-200/80 mt-1">
                  {payload?.error ||
                    `प्रमाण पत्र क्रमांक "${applicationNo}" नगर पालिका परिषद झाबुआ के रिकॉर्ड में नहीं मिला।`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

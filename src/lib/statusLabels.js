export const STATUS_HINDI_LABELS = {
  Submitted: 'जमा किया गया (Submitted)',
  'Under Review': 'समीक्षाधीन (Under Review)',
  'Correction Requested': 'सुधार अपेक्षित (Correction Requested)',
  Rejected: 'अस्वीकृत (Rejected)',
  Approved: 'स्वीकृत (Approved)',
  Sanctioned: 'स्वीकृत / मंजूर (Sanctioned)',
  'Certificate Generated': 'प्रमाण पत्र जारी (Generated)',
  Completed: 'पूर्ण (Completed)',
  Draft: 'ड्राफ्ट (Draft)',
};

export const STATUS_BILINGUAL_MAP = {
  Draft: { hi: 'ड्राफ्ट', en: 'Draft' },
  Submitted: { hi: 'जमा किया गया', en: 'Submitted' },
  'Under Review': { hi: 'समीक्षाधीन', en: 'Under Review' },
  'Correction Requested': { hi: 'सुधार अपेक्षित', en: 'Correction Requested' },
  Rejected: { hi: 'अस्वीकृत', en: 'Rejected' },
  Approved: { hi: 'स्वीकृत', en: 'Approved' },
  Sanctioned: { hi: 'स्वीकृत / मंजूर', en: 'Sanctioned' },
  'Certificate Generated': { hi: 'प्रमाण पत्र जारी', en: 'Certificate Generated' },
  Completed: { hi: 'पूर्ण', en: 'Completed' },
};

export function getHindiStatus(status) {
  return STATUS_HINDI_LABELS[status] || status || 'अज्ञात (Unknown)';
}

export function getBilingualStatusLabel(status) {
  return (
    STATUS_BILINGUAL_MAP[status] || {
      hi: status || 'अज्ञात',
      en: status || 'Unknown',
    }
  );
}

export function getStatusChipClass(status) {
  switch (status) {
    case 'Approved':
    case 'Sanctioned':
    case 'Certificate Generated':
    case 'Completed':
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    case 'Rejected':
      return 'bg-red-100 text-red-900 border-red-300';
    case 'Correction Requested':
      return 'bg-amber-100 text-amber-900 border-amber-300';
    case 'Under Review':
      return 'bg-purple-100 text-purple-900 border-purple-300';
    case 'Submitted':
      return 'bg-blue-100 text-blue-900 border-blue-300';
    case 'Draft':
      return 'bg-slate-100 text-slate-700 border-slate-300';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300';
  }
}

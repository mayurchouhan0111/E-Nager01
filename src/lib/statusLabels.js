export const STATUS_LABELS = {
  'Draft': 'प्रारूप (Draft)',
  'Submitted': 'जमा (Submitted)',
  'Under Review': 'समीक्षाधीन (Under Review)',
  'Approved': 'स्वीकृत (Approved)',
  'Rejected': 'अस्वीकृत (Rejected)',
  'Correction Requested': 'सुधार अनुरोधित (Correction Requested)',
  'Certificate Generated': 'प्रमाण पत्र जनरेट (Certificate Generated)',
  'Completed': 'पूर्ण (Completed)',
}

export function getStatusLabel(status) {
  return STATUS_LABELS[status] || status || 'जमा (Submitted)'
}

export function getStatusChipClass(status) {
  switch (status) {
    case 'Approved':
    case 'Certificate Generated':
    case 'Completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'Rejected':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'Correction Requested':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'Under Review':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'Submitted':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300'
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200'
  }
}

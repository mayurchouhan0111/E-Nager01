/**
 * Universal Form Validation, Auto-Navigation & Smooth Scroll Helper
 * e-Nagar Palika Jhabua Intelligence Portal
 */

export function validateBirthCertificateForm(formData, dpdpConsent) {
  const fieldErrors = {};
  const errorList = [];
  const child = formData.childDetails || {};
  const mother = formData.motherDetails || {};
  const father = formData.fatherDetails || {};
  const applicant = formData.applicantDetails || {};

  // Tab 0: शिशु एवं जन्म स्थान विवरण
  if (!child.dateOfBirth) {
    fieldErrors['childDetails.dateOfBirth'] = {
      tab: 0,
      fieldId: 'field_child_dateOfBirth',
      message: '⚠️ शिशु की जन्म तिथि दर्ज करना अनिवार्य है (Date of Birth is required)'
    };
    errorList.push(fieldErrors['childDetails.dateOfBirth'].message);
  } else {
    const dob = new Date(child.dateOfBirth);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (dob > today) {
      fieldErrors['childDetails.dateOfBirth'] = {
        tab: 0,
        fieldId: 'field_child_dateOfBirth',
        message: '⚠️ जन्म तिथि भविष्य की नहीं हो सकती (Date of Birth cannot be in the future)'
      };
      errorList.push(fieldErrors['childDetails.dateOfBirth'].message);
    }
  }

  // Tab 1: माता-पिता एवं आवेदक विवरण
  if (!mother.fullName || !mother.fullName.trim()) {
    fieldErrors['motherDetails.fullName'] = {
      tab: 1,
      fieldId: 'field_mother_fullName',
      message: '⚠️ माता का पूरा नाम दर्ज करना अनिवार्य है (Mother Name is required)'
    };
    errorList.push(fieldErrors['motherDetails.fullName'].message);
  }

  if (!father.fullName || !father.fullName.trim()) {
    fieldErrors['fatherDetails.fullName'] = {
      tab: 1,
      fieldId: 'field_father_fullName',
      message: '⚠️ पिता का पूरा नाम दर्ज करना अनिवार्य है (Father Name is required)'
    };
    errorList.push(fieldErrors['fatherDetails.fullName'].message);
  }

  if (!applicant.fullName || !applicant.fullName.trim()) {
    fieldErrors['applicantDetails.fullName'] = {
      tab: 1,
      fieldId: 'field_applicant_fullName',
      message: '⚠️ आवेदक का नाम दर्ज करना अनिवार्य है (Applicant Name is required)'
    };
    errorList.push(fieldErrors['applicantDetails.fullName'].message);
  }

  if (!applicant.mobile || !applicant.mobile.trim()) {
    fieldErrors['applicantDetails.mobile'] = {
      tab: 1,
      fieldId: 'field_applicant_mobile',
      message: '⚠️ 10 अंकों का मोबाइल नंबर दर्ज करना अनिवार्य है'
    };
    errorList.push(fieldErrors['applicantDetails.mobile'].message);
  } else {
    const cleanMobile = applicant.mobile.replace(/[\s-]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      fieldErrors['applicantDetails.mobile'] = {
        tab: 1,
        fieldId: 'field_applicant_mobile',
        message: '⚠️ कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें (Invalid 10-digit mobile number)'
      };
      errorList.push(fieldErrors['applicantDetails.mobile'].message);
    }
  }

  if (mother.aadhaarNo) {
    const clean = mother.aadhaarNo.replace(/[\s-]/g, '');
    if (clean.length > 0 && !/^\d{12}$/.test(clean)) {
      fieldErrors['motherDetails.aadhaarNo'] = {
        tab: 1,
        fieldId: 'field_mother_aadhaarNo',
        message: '⚠️ माता का आधार नंबर 12 अंकों का होना चाहिए (Mother Aadhaar must be 12 digits)'
      };
      errorList.push(fieldErrors['motherDetails.aadhaarNo'].message);
    }
  }

  if (father.aadhaarNo) {
    const clean = father.aadhaarNo.replace(/[\s-]/g, '');
    if (clean.length > 0 && !/^\d{12}$/.test(clean)) {
      fieldErrors['fatherDetails.aadhaarNo'] = {
        tab: 1,
        fieldId: 'field_father_aadhaarNo',
        message: '⚠️ पिता का आधार नंबर 12 अंकों का होना चाहिए (Father Aadhaar must be 12 digits)'
      };
      errorList.push(fieldErrors['fatherDetails.aadhaarNo'].message);
    }
  }

  if (applicant.aadhaarNo) {
    const clean = applicant.aadhaarNo.replace(/[\s-]/g, '');
    if (clean.length > 0 && !/^\d{12}$/.test(clean)) {
      fieldErrors['applicantDetails.aadhaarNo'] = {
        tab: 1,
        fieldId: 'field_applicant_aadhaarNo',
        message: '⚠️ आवेदक का आधार नंबर 12 अंकों का होना चाहिए (Applicant Aadhaar must be 12 digits)'
      };
      errorList.push(fieldErrors['applicantDetails.aadhaarNo'].message);
    }
  }

  // Tab 2: दस्तावेज एवं घोषणा
  if (!dpdpConsent) {
    fieldErrors['dpdpConsent'] = {
      tab: 2,
      fieldId: 'field_dpdpConsent',
      message: '⚠️ DPDP Act 2023 के तहत प्राइवेसी सहमति देना अनिवार्य है'
    };
    errorList.push(fieldErrors['dpdpConsent'].message);
  }

  return { fieldErrors, errorList };
}

export function validateDeathCertificateForm(formData, dpdpConsent) {
  const fieldErrors = {};
  const errorList = [];
  const deceased = formData.deceasedDetails || {};
  const applicant = formData.applicantDetails || {};

  // Tab 0: मृतक विवरण
  if (!deceased.fullName || !deceased.fullName.trim()) {
    fieldErrors['deceasedDetails.fullName'] = {
      tab: 0,
      fieldId: 'field_deceased_fullName',
      message: '⚠️ मृतक का पूरा नाम दर्ज करना अनिवार्य है (Deceased Full Name is required)'
    };
    errorList.push(fieldErrors['deceasedDetails.fullName'].message);
  }

  if (!deceased.dateOfDeath) {
    fieldErrors['deceasedDetails.dateOfDeath'] = {
      tab: 0,
      fieldId: 'field_deceased_dateOfDeath',
      message: '⚠️ मृत्यु की तिथि दर्ज करना अनिवार्य है (Date of Death is required)'
    };
    errorList.push(fieldErrors['deceasedDetails.dateOfDeath'].message);
  } else {
    const deathDate = new Date(deceased.dateOfDeath);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (deathDate > today) {
      fieldErrors['deceasedDetails.dateOfDeath'] = {
        tab: 0,
        fieldId: 'field_deceased_dateOfDeath',
        message: '⚠️ मृत्यु की तिथि भविष्य की नहीं हो सकती (Date of Death cannot be in future)'
      };
      errorList.push(fieldErrors['deceasedDetails.dateOfDeath'].message);
    }
  }

  if (deceased.age !== '' && deceased.age !== null) {
    const ageNum = Number(deceased.age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      fieldErrors['deceasedDetails.age'] = {
        tab: 0,
        fieldId: 'field_deceased_age',
        message: '⚠️ आयु 0 से 120 वर्षों के बीच होनी चाहिए (Age must be between 0 and 120 years)'
      };
      errorList.push(fieldErrors['deceasedDetails.age'].message);
    }
  }

  if (deceased.aadhaarNo) {
    const clean = deceased.aadhaarNo.replace(/[\s-]/g, '');
    if (clean.length > 0 && !/^\d{12}$/.test(clean)) {
      fieldErrors['deceasedDetails.aadhaarNo'] = {
        tab: 0,
        fieldId: 'field_deceased_aadhaarNo',
        message: '⚠️ मृतक का आधार नंबर 12 अंकों का होना चाहिए'
      };
      errorList.push(fieldErrors['deceasedDetails.aadhaarNo'].message);
    }
  }

  // Tab 1: आवेदक विवरण
  if (!applicant.fullName || !applicant.fullName.trim()) {
    fieldErrors['applicantDetails.fullName'] = {
      tab: 1,
      fieldId: 'field_applicant_fullName',
      message: '⚠️ आवेदक का नाम दर्ज करना अनिवार्य है (Informant Name is required)'
    };
    errorList.push(fieldErrors['applicantDetails.fullName'].message);
  }

  if (!applicant.mobile || !applicant.mobile.trim()) {
    fieldErrors['applicantDetails.mobile'] = {
      tab: 1,
      fieldId: 'field_applicant_mobile',
      message: '⚠️ आवेदक का 10 अंकों का मोबाइल नंबर दर्ज करना अनिवार्य है'
    };
    errorList.push(fieldErrors['applicantDetails.mobile'].message);
  } else {
    const cleanMobile = applicant.mobile.replace(/[\s-]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      fieldErrors['applicantDetails.mobile'] = {
        tab: 1,
        fieldId: 'field_applicant_mobile',
        message: '⚠️ कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें'
      };
      errorList.push(fieldErrors['applicantDetails.mobile'].message);
    }
  }

  if (applicant.aadhaarNo) {
    const clean = applicant.aadhaarNo.replace(/[\s-]/g, '');
    if (clean.length > 0 && !/^\d{12}$/.test(clean)) {
      fieldErrors['applicantDetails.aadhaarNo'] = {
        tab: 1,
        fieldId: 'field_applicant_aadhaarNo',
        message: '⚠️ आवेदक का आधार नंबर 12 अंकों का होना चाहिए'
      };
      errorList.push(fieldErrors['applicantDetails.aadhaarNo'].message);
    }
  }

  // Tab 2: घोषणा
  if (!dpdpConsent) {
    fieldErrors['dpdpConsent'] = {
      tab: 2,
      fieldId: 'field_dpdpConsent',
      message: '⚠️ DPDP Act 2023 के तहत डेटा प्राइवेसी सहमति देना अनिवार्य है'
    };
    errorList.push(fieldErrors['dpdpConsent'].message);
  }

  return { fieldErrors, errorList };
}

export function validateWaterConnectionForm(formData, dpdpConsent) {
  const fieldErrors = {};
  const errorList = [];
  const applicant = formData.applicantDetails || {};
  const property = formData.propertyDetails || {};

  // Tab 0: आवेदक विवरण
  if (!applicant.fullName || !applicant.fullName.trim()) {
    fieldErrors['applicantDetails.fullName'] = {
      tab: 0,
      fieldId: 'field_applicant_fullName',
      message: '⚠️ आवेदक का नाम दर्ज करना अनिवार्य है (Applicant Full Name is required)'
    };
    errorList.push(fieldErrors['applicantDetails.fullName'].message);
  }

  if (!applicant.mobile || !applicant.mobile.trim()) {
    fieldErrors['applicantDetails.mobile'] = {
      tab: 0,
      fieldId: 'field_applicant_mobile',
      message: '⚠️ 10 अंकों का मोबाइल नंबर दर्ज करना अनिवार्य है'
    };
    errorList.push(fieldErrors['applicantDetails.mobile'].message);
  } else {
    const cleanMobile = applicant.mobile.replace(/[\s-]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      fieldErrors['applicantDetails.mobile'] = {
        tab: 0,
        fieldId: 'field_applicant_mobile',
        message: '⚠️ कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें'
      };
      errorList.push(fieldErrors['applicantDetails.mobile'].message);
    }
  }

  // Tab 1: मकान व संपत्ति विवरण
  if (!property.houseNo || !property.houseNo.trim()) {
    fieldErrors['propertyDetails.houseNo'] = {
      tab: 1,
      fieldId: 'field_property_houseNo',
      message: '⚠️ मकान क्रमांक या भवन का पता दर्ज करना अनिवार्य है'
    };
    errorList.push(fieldErrors['propertyDetails.houseNo'].message);
  }

  // Tab 2: घोषणा
  if (!dpdpConsent) {
    fieldErrors['dpdpConsent'] = {
      tab: 2,
      fieldId: 'field_dpdpConsent',
      message: '⚠️ DPDP Act 2023 के तहत डेटा प्राइवेसी सहमति देना अनिवार्य है'
    };
    errorList.push(fieldErrors['dpdpConsent'].message);
  }

  return { fieldErrors, errorList };
}

/**
 * Executes Auto-Navigation, Tab Switch & Smooth Scroll to the first missing field element
 */
export function navigateToFirstErrorField(fieldErrors, setActiveTab) {
  const errorKeys = Object.keys(fieldErrors);
  if (errorKeys.length === 0) return;

  const firstErrorKey = errorKeys[0];
  const firstError = fieldErrors[firstErrorKey];
  if (!firstError) return;

  // 1. Switch active tab if needed
  if (typeof setActiveTab === 'function' && firstError.tab !== undefined) {
    setActiveTab(firstError.tab);
  }

  // 2. Smooth Scroll & Focus to element
  setTimeout(() => {
    const el = document.getElementById(firstError.fieldId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof el.focus === 'function') {
        el.focus();
      }
      el.classList.add('border-red-500', 'ring-2', 'ring-red-300', 'animate-pulse');
      setTimeout(() => {
        el.classList.remove('animate-pulse');
      }, 2500);
    }
  }, 200);
}

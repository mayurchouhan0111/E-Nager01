'use client';

import React, { useState, useEffect } from 'react';
import ServiceHeader from '../../components/ServiceHeader';
import ApplicationTimeline from '../../components/ApplicationTimeline';
import DeathCertificateTemplate from '../../components/DeathCertificateTemplate';
import { 
  saveDeathCertificateDraft, 
  submitDeathCertificate, 
  getDeathCertificates 
} from '../../services/deathCertificateService';
import { FileText, Activity, CheckCircle2, AlertCircle, RefreshCw, Printer, X, History, Plus, Building2, User, Home, HeartPulse, CheckSquare } from 'lucide-react';

const defaultDeceasedDetails = {
  fullName: '',
  gender: 'पुरुष (Male)',
  dateOfDeath: '',
  placeType: 'अस्पताल (Hospital)',
  placeOfDeath: '',
  hospitalName: '',
  homeAddress: '',
  otherPlaceDetails: '',
  age: '',
  aadhaarNo: '',
  causeOfDeath: '',
  presentAddress: {
    houseNo: '',
    street: '',
    villageCity: 'झाबुआ',
    district: 'झाबुआ',
    state: 'मध्य प्रदेश',
    pincode: '457661'
  },
  permanentAddress: {
    houseNo: '',
    street: '',
    villageCity: 'झाबुआ',
    district: 'झाबुआ',
    state: 'मध्य प्रदेश',
    pincode: '457661',
    isSameAsPresent: true
  }
};

const defaultApplicantDetails = {
  fullName: '',
  relationWithDeceased: 'पुत्र/पुत्री (Son/Daughter)',
  mobile: '',
  email: '',
  aadhaarNo: '',
  address: '',
  villageCity: 'झाबुआ',
  district: 'झाबुआ',
  state: 'मध्य प्रदेश',
  pincode: '457661'
};

const defaultParentSpouseDetails = {
  fatherHusbandName: '',
  motherName: ''
};

const defaultStatisticalDetails = {
  religion: 'हिंदू (Hindu)',
  occupation: 'अन्य / गैर-नौकरी (Other / Unemployed)',
  medicalTreatmentBeforeDeath: 'संस्थागत चिकित्सा देखभाल (Institutional Medical Care)',
  isMedicallyCertified: 'हाँ (Yes)',
  pregnancyRelatedDeath: 'लागू नहीं (Not Applicable)',
  lifestyleHistory: {
    smoking: 'नहीं (No)',
    smokingYears: '',
    tobacco: 'नहीं (No)',
    tobaccoYears: '',
    gutka: 'नहीं (No)',
    gutkaYears: '',
    alcohol: 'नहीं (No)',
    alcoholYears: ''
  }
};

export default function DeathCertificatePage() {
  const [activeTab, setActiveTab] = useState('apply'); // 'apply' | 'track'
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    applicationNo: '',
    status: 'Draft',
    deceasedDetails: { ...defaultDeceasedDetails },
    applicantDetails: { ...defaultApplicantDetails },
    parentSpouseDetails: { ...defaultParentSpouseDetails },
    statisticalDetails: { ...defaultStatisticalDetails },
    documents: [
      { name: 'अस्पताल मृत्यु प्रमाण पत्र / दाह संस्कार रसीद (Hospital/Cremation Receipt)', uploaded: true, filename: 'hospital_death_receipt.pdf' },
      { name: 'आवेदक आधार कार्ड (Applicant Aadhaar)', uploaded: true, filename: 'applicant_aadhaar.pdf' }
    ]
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    const data = await getDeathCertificates();
    setApplications(data);
    setLoading(false);
  };

  const handleInputChange = (section, field, value, subField = null) => {
    setFormData(prev => {
      if (subField) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: {
              ...prev[section]?.[field],
              [subField]: value
            }
          }
        };
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
  };

  const toggleSameAsPresentAddress = (checked) => {
    setFormData(prev => {
      const present = prev.deceasedDetails.presentAddress;
      return {
        ...prev,
        deceasedDetails: {
          ...prev.deceasedDetails,
          permanentAddress: {
            ...prev.deceasedDetails.permanentAddress,
            isSameAsPresent: checked,
            ...(checked ? {
              houseNo: present.houseNo,
              street: present.street,
              villageCity: present.villageCity,
              district: present.district,
              state: present.state,
              pincode: present.pincode
            } : {})
          }
        }
      };
    });
  };

  const validateForm = () => {
    const errors = [];
    const deceased = formData.deceasedDetails || {};
    const applicant = formData.applicantDetails || {};

    // 1. Deceased Full Name
    if (!deceased.fullName || !deceased.fullName.trim()) {
      errors.push('मृतक का पूरा नाम आवश्यक है (Deceased Full Name is required)');
    }

    // 2. Date of Death
    if (!deceased.dateOfDeath) {
      errors.push('मृत्यु की तिथि आवश्यक है (Date of Death is required)');
    } else {
      const deathDate = new Date(deceased.dateOfDeath);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (deathDate > today) {
        errors.push('मृत्यु की तिथि भविष्य की नहीं हो सकती (Date of Death cannot be in the future)');
      }
    }

    // 3. Age Validation
    if (deceased.age !== '' && deceased.age !== null) {
      const ageNum = Number(deceased.age);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
        errors.push('आयु 0 से 120 वर्षों के बीच होनी चाहिए (Age must be between 0 and 120 years)');
      }
    }

    // 4. Deceased Aadhaar
    if (deceased.aadhaarNo) {
      const cleanAadhaar = deceased.aadhaarNo.replace(/[\s-]/g, '');
      if (cleanAadhaar.length > 0 && !/^\d{12}$/.test(cleanAadhaar)) {
        errors.push('मृतक का आधार नंबर 12 अंकों का होना चाहिए (Deceased Aadhaar must be 12 digits)');
      }
    }

    // 5. Informant Full Name
    if (!applicant.fullName || !applicant.fullName.trim()) {
      errors.push('आवेदक / सूचनाकर्ता का नाम आवश्यक है (Informant Name is required)');
    }

    // 6. Informant Mobile Number
    if (!applicant.mobile || !applicant.mobile.trim()) {
      errors.push('आवेदक का मोबाइल नंबर आवश्यक है (Informant Mobile is required)');
    } else {
      const cleanMobile = applicant.mobile.replace(/[\s-]/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
        errors.push('कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें (Invalid 10-digit mobile number)');
      }
    }

    // 7. Informant Aadhaar
    if (applicant.aadhaarNo) {
      const cleanAadhaar = applicant.aadhaarNo.replace(/[\s-]/g, '');
      if (cleanAadhaar.length > 0 && !/^\d{12}$/.test(cleanAadhaar)) {
        errors.push('आवेदक का आधार नंबर 12 अंकों का होना चाहिए (Informant Aadhaar must be 12 digits)');
      }
    }

    // 8. Pincode Validations
    if (deceased.presentAddress?.pincode && !/^\d{6}$/.test(deceased.presentAddress.pincode)) {
      errors.push('मृतक के वर्तमान पते का पिनकोड 6 अंकों का होना चाहिए (Present address pincode must be 6 digits)');
    }

    if (!deceased.permanentAddress?.isSameAsPresent && deceased.permanentAddress?.pincode && !/^\d{6}$/.test(deceased.permanentAddress.pincode)) {
      errors.push('मृतक के स्थायी पते का पिनकोड 6 अंकों का होना चाहिए (Permanent address pincode must be 6 digits)');
    }

    if (applicant.pincode && !/^\d{6}$/.test(applicant.pincode)) {
      errors.push('आवेदक का पिनकोड 6 अंकों का होना चाहिए (Informant pincode must be 6 digits)');
    }

    return errors;
  };

  const preparePayload = () => {
    const payload = JSON.parse(JSON.stringify(formData));
    if (payload.deceasedDetails?.permanentAddress?.isSameAsPresent) {
      const present = payload.deceasedDetails.presentAddress;
      payload.deceasedDetails.permanentAddress = {
        ...present,
        isSameAsPresent: true
      };
    }
    return payload;
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setMessage(null);
    setFormErrors([]);
    const payload = preparePayload();
    const res = await saveDeathCertificateDraft(payload, formData.id);
    setLoading(false);

    if (res.success) {
      setMessage({ type: 'success', text: `प्रारूप सफलतापूर्वक सहेजा गया (Draft saved! App No: ${res.applicationNo})` });
      setFormData(prev => ({ ...prev, id: res.id, applicationNo: res.applicationNo }));
      loadApplications();
    } else {
      setMessage({ type: 'error', text: res.error || 'प्रारूप सहेजने में विफलता (Failed to save draft)' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      setMessage({ type: 'error', text: 'कृपया फॉर्म में त्रुटियों को सुधारें (Please resolve validation errors in the form)' });
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setFormErrors([]);
    setLoading(true);
    setMessage(null);
    const payload = preparePayload();
    const res = await submitDeathCertificate(payload, formData.id);
    setLoading(false);

    if (res.success) {
      setMessage({ type: 'success', text: `आवेदन जमा हो गया है (Application submitted! App No: ${res.applicationNo})` });
      resetForm();
      loadApplications();
      setActiveTab('track');
    } else {
      setMessage({ type: 'error', text: res.error || 'आवेदन जमा करने में त्रुटि' });
    }
  };

  const handleEditForResubmit = (app) => {
    // Normalize data with default structures if missing
    const normalizedApp = {
      ...app,
      deceasedDetails: {
        ...defaultDeceasedDetails,
        ...(app.deceasedDetails || {}),
        presentAddress: { ...defaultDeceasedDetails.presentAddress, ...(app.deceasedDetails?.presentAddress || {}) },
        permanentAddress: { ...defaultDeceasedDetails.permanentAddress, ...(app.deceasedDetails?.permanentAddress || {}) }
      },
      applicantDetails: { ...defaultApplicantDetails, ...(app.applicantDetails || {}) },
      parentSpouseDetails: { ...defaultParentSpouseDetails, ...(app.parentSpouseDetails || {}) },
      statisticalDetails: {
        ...defaultStatisticalDetails,
        ...(app.statisticalDetails || {}),
        lifestyleHistory: { ...defaultStatisticalDetails.lifestyleHistory, ...(app.statisticalDetails?.lifestyleHistory || {}) }
      }
    };
    setFormData(normalizedApp);
    setActiveTab('apply');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormErrors([]);
    setFormData({
      id: null,
      applicationNo: '',
      status: 'Draft',
      deceasedDetails: JSON.parse(JSON.stringify(defaultDeceasedDetails)),
      applicantDetails: JSON.parse(JSON.stringify(defaultApplicantDetails)),
      parentSpouseDetails: JSON.parse(JSON.stringify(defaultParentSpouseDetails)),
      statisticalDetails: JSON.parse(JSON.stringify(defaultStatisticalDetails)),
      documents: [
        { name: 'अस्पताल मृत्यु प्रमाण पत्र / दाह संस्कार रसीद (Hospital/Cremation Receipt)', uploaded: true, filename: 'hospital_death_receipt.pdf' },
        { name: 'आवेदक आधार कार्ड (Applicant Aadhaar)', uploaded: true, filename: 'applicant_aadhaar.pdf' }
      ]
    });
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Approved':
      case 'Certificate Generated':
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Correction Requested':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Under Review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Submitted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const isFemaleAge15to49 = () => {
    const gender = formData.deceasedDetails.gender || '';
    const age = Number(formData.deceasedDetails.age);
    return (gender.includes('महिला') || gender.toLowerCase().includes('female')) && age >= 15 && age <= 49;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "मृत्यु प्रमाण पत्र के लिए ऑनलाइन आवेदन कैसे करें? (How to apply for death certificate online?)",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "नगर पालिका परिषद झाबुआ के ई-नगर पोर्टल पर जाएं। ऑनलाइन फॉर्म भरें, आवश्यक दस्तावेज अपलोड करें और जमा करें। आवेदन संख्या द्वारा स्थिति ट्रैक करें। Visit the e-Nagar portal of Nagar Palika Parishad Jhabua. Fill the online form, upload required documents, and submit. Track status using your application number."
                }
              },
              {
                "@type": "Question",
                "name": "मृत्यु प्रमाण पत्र हेतु कौन से दस्तावेज आवश्यक हैं? (What documents are required for death certificate?)",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "आवश्यक दस्तावेज: आवेदक का आधार कार्ड, अस्पताल/डॉक्टर द्वारा जारी मृत्यु प्रमाण पत्र, निवास पता प्रमाण, और पासपोर्ट साइज फोटो। Required documents: Aadhaar card, hospital/doctor issued death certificate, address proof, and passport size photo."
                }
              },
              {
                "@type": "Question",
                "name": "प्रमाण पत्र की स्थिति कैसे ट्रैक करें? (How to track death certificate status?)",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "ई-नगर पोर्टल पर 'ट्रैक करें' टैब में अपनी आवेदन संख्या दर्ज करें। आपको रियल-टाइम स्थिति और टाइमलाइन दिखाई देगी। Go to the Track tab on the e-Nagar portal, enter your application number. You will see real-time status and timeline."
                }
              },
              {
                "@type": "Question",
                "name": "ई-नगर पोर्टल पर मृत्यु प्रमाण पत्र कितने दिनों में बनता है? (How many days does it take to get death certificate?)",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "सामान्यतः आवेदन जमा करने के 7-15 कार्य दिवसों में प्रमाण पत्र जारी हो जाता है। Generally, the certificate is issued within 7-15 working days after application submission."
                }
              }
            ]
          })
        }}
      />
      <ServiceHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Banner */}
        <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-200 border border-white/15 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              मध्य प्रदेश शासन - लोक स्वास्थ्य एवं परिवार कल्याण विभाग
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              मृतक प्रमाण पत्र ऑनलाइन आवेदन
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-3xl leading-relaxed">
              नगर पालिका परिषद झाबुआ (म.प्र.) | जन्म और मृत्यु पंजीकरण अधिनियम, 1969 के अंतर्गत पूर्ण शासकीय मृत्यु पंजीकरण फॉर्म। ऑनलाइन आवेदन करें, स्थिति ट्रैक करें एवं स्वीकृत प्रमाण पत्र डाउनलोड करें।
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-1.5 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
            <button
              onClick={() => setActiveTab('apply')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'apply'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{formData.id ? 'आवेदन संपादित करें / पुन: प्रस्तुत करें' : 'नया ऑनलाइन आवेदन दर्ज करें'}</span>
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'track'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>मेरे आवेदन एवं स्थिति ({applications.length})</span>
            </button>
          </div>

          {formData.id && activeTab === 'apply' && (
            <button
              onClick={resetForm}
              className="btn btn-secondary btn-sm flex items-center gap-1 font-bold text-slate-700"
            >
              <Plus className="w-3.5 h-3.5" /> नया फॉर्म शुरू करें
            </button>
          )}
        </div>

        {/* Global Alert Message */}
        {message && (
          <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border shadow-sm ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form Validation Errors Display */}
        {formErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-900 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-sm text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>कृपया निम्नलिखित त्रुटियों को ठीक करें (Please fix the following validation errors):</span>
            </div>
            <ul className="list-disc list-inside text-xs space-y-1 pl-2">
              {formErrors.map((err, idx) => (
                <li key={idx} className="font-medium text-red-700">{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* TAB 1: APPLY FORM */}
        {activeTab === 'apply' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Correction Warning Banner if Resubmitting */}
            {formData.status === 'Correction Requested' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 space-y-1 shadow-sm">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>सुधार की आवश्यकता (Correction Requested by Officer)</span>
                </div>
                <p className="text-xs text-amber-800">
                  अधिकारी की टिप्पणी: <span className="font-bold bg-amber-100 px-2 py-0.5 rounded text-amber-900">{formData.lastOfficerRemark || 'विवरण सुधारें'}</span>
                </p>
                <p className="text-[11px] text-amber-700 pt-1">कृपया नीचे विवरण सुधारें एवं "आवेदन पुनः प्रस्तुत करें" बटन पर क्लिक करें।</p>
              </div>
            )}

            {/* SECTION 1: DECEASED PERSONAL DETAILS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs">👤</span> 1. मृतक का व्यक्तिगत विवरण (Deceased Personal Details - Government Part I)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">मृतक का पूरा नाम (Full Name) *</label>
                  <input
                    type="text"
                    required
                    value={formData.deceasedDetails.fullName}
                    onChange={(e) => handleInputChange('deceasedDetails', 'fullName', e.target.value)}
                    placeholder="जैसे: स्व. रामेश्वर प्रसाद शर्मा"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">लिंग (Gender) *</label>
                  <select
                    value={formData.deceasedDetails.gender}
                    onChange={(e) => handleInputChange('deceasedDetails', 'gender', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  >
                    <option>पुरुष (Male)</option>
                    <option>महिला (Female)</option>
                    <option>अन्य (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">मृत्यु की तिथि (Date of Death) *</label>
                  <input
                    type="date"
                    required
                    value={formData.deceasedDetails.dateOfDeath}
                    onChange={(e) => handleInputChange('deceasedDetails', 'dateOfDeath', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">मृत्यु के समय आयु (वर्षों में)</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={formData.deceasedDetails.age}
                    onChange={(e) => handleInputChange('deceasedDetails', 'age', e.target.value)}
                    placeholder="65"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">मृतक आधार संख्या (Aadhaar No. - 12 Digits)</label>
                  <input
                    type="text"
                    maxLength={14}
                    value={formData.deceasedDetails.aadhaarNo}
                    onChange={(e) => handleInputChange('deceasedDetails', 'aadhaarNo', e.target.value)}
                    placeholder="XXXX-XXXX-XXXX"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">धर्म (Religion)</label>
                  <select
                    value={formData.statisticalDetails.religion}
                    onChange={(e) => handleInputChange('statisticalDetails', 'religion', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  >
                    <option>हिंदू (Hindu)</option>
                    <option>मुस्लिम (Muslim)</option>
                    <option>ईसाई (Christian)</option>
                    <option>सिख (Sikh)</option>
                    <option>बौद्ध (Buddhist)</option>
                    <option>जैन (Jain)</option>
                    <option>अन्य (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">व्यवसाय (Occupation of Deceased)</label>
                  <input
                    type="text"
                    value={formData.statisticalDetails.occupation}
                    onChange={(e) => handleInputChange('statisticalDetails', 'occupation', e.target.value)}
                    placeholder="कृषि / व्यापार / गृहणी / सेवानिवृत्त"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: PLACE OF DEATH & ADDRESS DETAILS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs">🏢</span> 2. मृत्यु का स्थान एवं पता विवरण (Place of Death & Address Details)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">मृत्यु का स्थान प्रकार (Place Type)</label>
                  <select
                    value={formData.deceasedDetails.placeType}
                    onChange={(e) => handleInputChange('deceasedDetails', 'placeType', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  >
                    <option>अस्पताल (Hospital)</option>
                    <option>घर (Home)</option>
                    <option>अन्य स्थान (Other Place)</option>
                  </select>
                </div>

                {formData.deceasedDetails.placeType.includes('अस्पताल') && (
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">अस्पताल का नाम (Hospital Name)</label>
                    <input
                      type="text"
                      value={formData.deceasedDetails.hospitalName}
                      onChange={(e) => handleInputChange('deceasedDetails', 'hospitalName', e.target.value)}
                      placeholder="जैसे: जिला चिकित्सालय झाबुआ"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                    />
                  </div>
                )}

                {formData.deceasedDetails.placeType.includes('घर') && (
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">घर का पता (Home Address of Death)</label>
                    <input
                      type="text"
                      value={formData.deceasedDetails.homeAddress}
                      onChange={(e) => handleInputChange('deceasedDetails', 'homeAddress', e.target.value)}
                      placeholder="मकान नंबर, वार्ड नंबर, झाबुआ"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                    />
                  </div>
                )}

                {formData.deceasedDetails.placeType.includes('अन्य') && (
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">अन्य स्थान का विवरण (Other Place Details)</label>
                    <input
                      type="text"
                      value={formData.deceasedDetails.otherPlaceDetails}
                      onChange={(e) => handleInputChange('deceasedDetails', 'otherPlaceDetails', e.target.value)}
                      placeholder="घटना स्थल / मार्ग / अन्य पता"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">मृत्यु स्थल संपूर्ण विवरण (Full Place Description)</label>
                  <input
                    type="text"
                    value={formData.deceasedDetails.placeOfDeath}
                    onChange={(e) => handleInputChange('deceasedDetails', 'placeOfDeath', e.target.value)}
                    placeholder="जिला अस्पताल झाबुआ / वार्ड 12"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  />
                </div>
              </div>

              {/* Present Address */}
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3">📍 मृतक का मृत्यु के समय का पता (Present Address at Time of Death)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">मकान / द्वार संख्या (House / Door No.)</label>
                    <input
                      type="text"
                      value={formData.deceasedDetails.presentAddress.houseNo}
                      onChange={(e) => handleInputChange('deceasedDetails', 'presentAddress', e.target.value, 'houseNo')}
                      placeholder="मकान क्र. 12/B"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">मार्ग / मोहल्ला (Street / Colony)</label>
                    <input
                      type="text"
                      value={formData.deceasedDetails.presentAddress.street}
                      onChange={(e) => handleInputChange('deceasedDetails', 'presentAddress', e.target.value, 'street')}
                      placeholder="तिलक मार्ग"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ग्राम / नगर (Village / City)</label>
                    <input
                      type="text"
                      value={formData.deceasedDetails.presentAddress.villageCity}
                      onChange={(e) => handleInputChange('deceasedDetails', 'presentAddress', e.target.value, 'villageCity')}
                      placeholder="झाबुआ"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">जिला (District)</label>
                    <input
                      type="text"
                      value={formData.deceasedDetails.presentAddress.district}
                      onChange={(e) => handleInputChange('deceasedDetails', 'presentAddress', e.target.value, 'district')}
                      placeholder="झाबुआ"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">राज्य (State)</label>
                    <input
                      type="text"
                      value={formData.deceasedDetails.presentAddress.state}
                      onChange={(e) => handleInputChange('deceasedDetails', 'presentAddress', e.target.value, 'state')}
                      placeholder="मध्य प्रदेश"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">पिनकोड (Pincode - 6 Digits)</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.deceasedDetails.presentAddress.pincode}
                      onChange={(e) => handleInputChange('deceasedDetails', 'presentAddress', e.target.value, 'pincode')}
                      placeholder="457661"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Permanent Address */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">🏠 मृतक का स्थायी पता (Permanent Address of Deceased)</h3>
                  <label className="flex items-center gap-2 text-xs text-emerald-800 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.deceasedDetails.permanentAddress.isSameAsPresent}
                      onChange={(e) => toggleSameAsPresentAddress(e.target.checked)}
                      className="rounded text-emerald-700 focus:ring-emerald-600 h-4 w-4"
                    />
                    <span>वर्तमान पते के समान (Same as Present Address)</span>
                  </label>
                </div>

                {!formData.deceasedDetails.permanentAddress.isSameAsPresent && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">मकान / द्वार संख्या</label>
                      <input
                        type="text"
                        value={formData.deceasedDetails.permanentAddress.houseNo}
                        onChange={(e) => handleInputChange('deceasedDetails', 'permanentAddress', e.target.value, 'houseNo')}
                        placeholder="मकान क्र."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">मार्ग / मोहल्ला</label>
                      <input
                        type="text"
                        value={formData.deceasedDetails.permanentAddress.street}
                        onChange={(e) => handleInputChange('deceasedDetails', 'permanentAddress', e.target.value, 'street')}
                        placeholder="मोहल्ला"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">ग्राम / नगर</label>
                      <input
                        type="text"
                        value={formData.deceasedDetails.permanentAddress.villageCity}
                        onChange={(e) => handleInputChange('deceasedDetails', 'permanentAddress', e.target.value, 'villageCity')}
                        placeholder="झाबुआ"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">जिला</label>
                      <input
                        type="text"
                        value={formData.deceasedDetails.permanentAddress.district}
                        onChange={(e) => handleInputChange('deceasedDetails', 'permanentAddress', e.target.value, 'district')}
                        placeholder="झाबुआ"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">राज्य</label>
                      <input
                        type="text"
                        value={formData.deceasedDetails.permanentAddress.state}
                        onChange={(e) => handleInputChange('deceasedDetails', 'permanentAddress', e.target.value, 'state')}
                        placeholder="मध्य प्रदेश"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">पिनकोड</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={formData.deceasedDetails.permanentAddress.pincode}
                        onChange={(e) => handleInputChange('deceasedDetails', 'permanentAddress', e.target.value, 'pincode')}
                        placeholder="457661"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 3: PARENT / SPOUSE DETAILS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs">👪</span> 3. माता/पिता/पति का विवरण (Parent / Spouse Details)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">पिता / पति का पूरा नाम (Father / Husband Name)</label>
                  <input
                    type="text"
                    value={formData.parentSpouseDetails.fatherHusbandName}
                    onChange={(e) => handleInputChange('parentSpouseDetails', 'fatherHusbandName', e.target.value)}
                    placeholder="पिता या पति का नाम"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">माता का पूरा नाम (Mother Name)</label>
                  <input
                    type="text"
                    value={formData.parentSpouseDetails.motherName}
                    onChange={(e) => handleInputChange('parentSpouseDetails', 'motherName', e.target.value)}
                    placeholder="माता का नाम"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: APPLICANT / INFORMANT DETAILS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs">📝</span> 4. आवेदक / सूचनाकर्ता का विवरण (Applicant / Informant Details)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">आवेदक / सूचनाकर्ता का नाम *</label>
                  <input
                    type="text"
                    required
                    value={formData.applicantDetails.fullName}
                    onChange={(e) => handleInputChange('applicantDetails', 'fullName', e.target.value)}
                    placeholder="आपका नाम"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">मृतक से संबंध (Relation)</label>
                  <select
                    value={formData.applicantDetails.relationWithDeceased}
                    onChange={(e) => handleInputChange('applicantDetails', 'relationWithDeceased', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  >
                    <option>पुत्र/पुत्री (Son/Daughter)</option>
                    <option>पति/पत्नी (Spouse)</option>
                    <option>माता/पिता (Parent)</option>
                    <option>भाई/बहन (Sibling)</option>
                    <option>अन्य (Other Rel)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">मोबाइल नंबर *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.applicantDetails.mobile}
                    onChange={(e) => handleInputChange('applicantDetails', 'mobile', e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">ईमेल पता (Email Address)</label>
                  <input
                    type="email"
                    value={formData.applicantDetails.email}
                    onChange={(e) => handleInputChange('applicantDetails', 'email', e.target.value)}
                    placeholder="citizen@example.com"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">आवेदक आधार संख्या (12 Digits)</label>
                  <input
                    type="text"
                    maxLength={14}
                    value={formData.applicantDetails.aadhaarNo}
                    onChange={(e) => handleInputChange('applicantDetails', 'aadhaarNo', e.target.value)}
                    placeholder="XXXX-XXXX-XXXX"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">आवेदक का पता (Address)</label>
                  <input
                    type="text"
                    value={formData.applicantDetails.address}
                    onChange={(e) => handleInputChange('applicantDetails', 'address', e.target.value)}
                    placeholder="मकान नंबर, वार्ड नंबर, झाबुआ"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">ग्राम / नगर (Village / City)</label>
                  <input
                    type="text"
                    value={formData.applicantDetails.villageCity}
                    onChange={(e) => handleInputChange('applicantDetails', 'villageCity', e.target.value)}
                    placeholder="झाबुआ"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">जिला (District)</label>
                  <input
                    type="text"
                    value={formData.applicantDetails.district}
                    onChange={(e) => handleInputChange('applicantDetails', 'district', e.target.value)}
                    placeholder="झाबुआ"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">राज्य एवं पिनकोड (State & Pincode)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.applicantDetails.state}
                      onChange={(e) => handleInputChange('applicantDetails', 'state', e.target.value)}
                      placeholder="मध्य प्रदेश"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium"
                    />
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.applicantDetails.pincode}
                      onChange={(e) => handleInputChange('applicantDetails', 'pincode', e.target.value)}
                      placeholder="457661"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: STATISTICAL & LIFESTYLE DETAILS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs">📊</span> 5. सांख्यिकी एवं मृत्यु का कारण (Statistical & Cause of Death Details - Government Part II)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">मृत्यु पूर्व प्राप्त चिकित्सा (Medical Care Received)</label>
                  <select
                    value={formData.statisticalDetails.medicalTreatmentBeforeDeath}
                    onChange={(e) => handleInputChange('statisticalDetails', 'medicalTreatmentBeforeDeath', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  >
                    <option>संस्थागत चिकित्सा देखभाल (Institutional Medical Care)</option>
                    <option>गैर-संस्थागत चिकित्सा देखभाल (Non-Institutional Medical Care)</option>
                    <option>कोई चिकित्सा देखभाल नहीं (No Medical Care Received)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">क्या मृत्यु का कारण चिकित्सा द्वारा प्रमाणित है? (Medically Certified?)</label>
                  <select
                    value={formData.statisticalDetails.isMedicallyCertified}
                    onChange={(e) => handleInputChange('statisticalDetails', 'isMedicallyCertified', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  >
                    <option>हाँ (Yes)</option>
                    <option>नहीं (No)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">मृत्यु का प्राथमिक कारण (Cause of Death)</label>
                  <input
                    type="text"
                    value={formData.deceasedDetails.causeOfDeath}
                    onChange={(e) => handleInputChange('deceasedDetails', 'causeOfDeath', e.target.value)}
                    placeholder="प्राकृतिक / हृदय गति रुकना / बीमारी"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  />
                </div>

                {isFemaleAge15to49() && (
                  <div className="sm:col-span-2 bg-pink-50 border border-pink-200 p-4 rounded-2xl">
                    <label className="block text-xs font-bold text-pink-900 mb-1.5">
                       क्या मृत्यु गर्भावस्था, प्रसव या प्रसव के 42 दिनों के भीतर हुई? (Female Pregnancy-Related Death Question)
                    </label>
                    <select
                      value={formData.statisticalDetails.pregnancyRelatedDeath}
                      onChange={(e) => handleInputChange('statisticalDetails', 'pregnancyRelatedDeath', e.target.value)}
                      className="w-full bg-white border border-pink-300 rounded-xl px-3.5 py-2.5 text-xs text-pink-900 font-medium"
                    >
                      <option>नहीं (No)</option>
                      <option>हाँ, गर्भावस्था के दौरान (Yes, during pregnancy)</option>
                      <option>हाँ, प्रसव के समय (Yes, during delivery)</option>
                      <option>हाँ, प्रसव के 42 दिनों के भीतर (Yes, within 42 days of termination)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Lifestyle / Habit History */}
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3">🚬 आदतन जीवन शैली विवरण (Habitual History of Deceased)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Smoking */}
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2">
                    <span className="block text-xs font-bold text-slate-700">धूम्रपान की आदत (Smoking History)</span>
                    <select
                      value={formData.statisticalDetails.lifestyleHistory.smoking}
                      onChange={(e) => handleInputChange('statisticalDetails', 'lifestyleHistory', e.target.value, 'smoking')}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                    >
                      <option>नहीं (No)</option>
                      <option>हाँ (Yes)</option>
                    </select>
                    {formData.statisticalDetails.lifestyleHistory.smoking === 'हाँ (Yes)' && (
                      <input
                        type="number"
                        placeholder="अवधि (वर्षों में)"
                        value={formData.statisticalDetails.lifestyleHistory.smokingYears}
                        onChange={(e) => handleInputChange('statisticalDetails', 'lifestyleHistory', e.target.value, 'smokingYears')}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                      />
                    )}
                  </div>

                  {/* Tobacco */}
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2">
                    <span className="block text-xs font-bold text-slate-700">तंबाकू सेवन (Tobacco History)</span>
                    <select
                      value={formData.statisticalDetails.lifestyleHistory.tobacco}
                      onChange={(e) => handleInputChange('statisticalDetails', 'lifestyleHistory', e.target.value, 'tobacco')}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                    >
                      <option>नहीं (No)</option>
                      <option>हाँ (Yes)</option>
                    </select>
                    {formData.statisticalDetails.lifestyleHistory.tobacco === 'हाँ (Yes)' && (
                      <input
                        type="number"
                        placeholder="अवधि (वर्षों में)"
                        value={formData.statisticalDetails.lifestyleHistory.tobaccoYears}
                        onChange={(e) => handleInputChange('statisticalDetails', 'lifestyleHistory', e.target.value, 'tobaccoYears')}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                      />
                    )}
                  </div>

                  {/* Gutka / Pan Masala */}
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2">
                    <span className="block text-xs font-bold text-slate-700">गुटका / पान मसाला (Gutka History)</span>
                    <select
                      value={formData.statisticalDetails.lifestyleHistory.gutka}
                      onChange={(e) => handleInputChange('statisticalDetails', 'lifestyleHistory', e.target.value, 'gutka')}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                    >
                      <option>नहीं (No)</option>
                      <option>हाँ (Yes)</option>
                    </select>
                    {formData.statisticalDetails.lifestyleHistory.gutka === 'हाँ (Yes)' && (
                      <input
                        type="number"
                        placeholder="अवधि (वर्षों में)"
                        value={formData.statisticalDetails.lifestyleHistory.gutkaYears}
                        onChange={(e) => handleInputChange('statisticalDetails', 'lifestyleHistory', e.target.value, 'gutkaYears')}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                      />
                    )}
                  </div>

                  {/* Alcohol */}
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2">
                    <span className="block text-xs font-bold text-slate-700">मद्यपान / शराब (Alcohol History)</span>
                    <select
                      value={formData.statisticalDetails.lifestyleHistory.alcohol}
                      onChange={(e) => handleInputChange('statisticalDetails', 'lifestyleHistory', e.target.value, 'alcohol')}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                    >
                      <option>नहीं (No)</option>
                      <option>हाँ (Yes)</option>
                    </select>
                    {formData.statisticalDetails.lifestyleHistory.alcohol === 'हाँ (Yes)' && (
                      <input
                        type="number"
                        placeholder="अवधि (वर्षों में)"
                        value={formData.statisticalDetails.lifestyleHistory.alcoholYears}
                        onChange={(e) => handleInputChange('statisticalDetails', 'lifestyleHistory', e.target.value, 'alcoholYears')}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading}
                className="btn btn-secondary flex items-center gap-1.5 font-bold text-slate-700"
              >
                💾 ड्राफ्ट सहेजें (Save Draft)
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex items-center gap-2 shadow-lg shadow-emerald-700/20 font-bold"
              >
                {loading ? (
                  <RefreshCw className="animate-spin w-4 h-4 text-white" />
                ) : formData.status === 'Correction Requested' ? (
                  '🔄 आवेदन पुनः प्रस्तुत करें (Resubmit Application)'
                ) : (
                  '🚀 ऑनलाइन आवेदन जमा करें (Submit Application)'
                )}
              </button>
            </div>

          </form>
        )}

        {/* TAB 2: TRACK & APPLICATIONS LIST */}
        {activeTab === 'track' && (
          <div className="space-y-4">
            
            {applications.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-slate-800 font-bold text-base mb-1">कोई आवेदन नहीं मिला</h3>
                <p className="text-slate-500 text-xs mb-4">आपने अभी तक कोई मृत्यु प्रमाण पत्र आवेदन जमा नहीं किया है।</p>
                <button
                  onClick={() => setActiveTab('apply')}
                  className="btn btn-primary text-xs font-bold"
                >
                  + पहला आवेदन दर्ज करें
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {applications.map((app) => (
                  <div key={app.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">{app.applicationNo || 'DRAFT'}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusChip(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                      <h3 className="text-slate-900 font-extrabold text-base"> स्व. {app.deceasedDetails?.fullName || 'N/A'}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">आवेदक: {app.applicantDetails?.fullName} ({app.applicantDetails?.relationWithDeceased}) | मृत्यु तिथि: {app.deceasedDetails?.dateOfDeath}</p>
                      {app.deceasedDetails?.presentAddress?.villageCity && (
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">पता: {app.deceasedDetails.presentAddress.villageCity}, {app.deceasedDetails.presentAddress.district}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Resubmit Action if Correction Requested */}
                      {app.status === 'Correction Requested' && (
                        <button
                          onClick={() => handleEditForResubmit(app)}
                          className="btn btn-primary btn-sm bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold"
                        >
                          ✏️ सुधारें व पुनः प्रस्तुत करें
                        </button>
                      )}

                      {/* View & Download Certificate */}
                      {(app.status === 'Approved' || app.status === 'Certificate Generated' || app.status === 'Completed') && (
                        <button
                          onClick={() => { setSelectedApp(app); setShowCertModal(true); }}
                          className="btn btn-primary btn-sm bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold"
                        >
                          📜 प्रमाण पत्र डाउनलोड करें
                        </button>
                      )}

                      {/* View Timeline Modal Button */}
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="btn btn-secondary btn-sm flex items-center gap-1 font-bold text-slate-700"
                      >
                        <History className="w-3.5 h-3.5 text-slate-500" /> स्थिति व टाइमलाइन देखें
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* TIMELINE & APPLICATION DETAILS MODAL */}
        {selectedApp && !showCertModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">{selectedApp.applicationNo}</span>
                  <h3 className="text-slate-900 font-extrabold text-lg mt-1">मृतक: स्व. {selectedApp.deceasedDetails?.fullName}</h3>
                </div>
                <button onClick={() => setSelectedApp(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedApp.lastOfficerRemark && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
                  <span className="font-bold block text-amber-800">💬 अधिकारी टिप्पणी (Officer Remark):</span>
                  <p className="font-semibold">{selectedApp.lastOfficerRemark}</p>
                </div>
              )}

              {/* Extended Details Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
                <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1.5 uppercase tracking-wider text-[11px]">आवेदन सारांश (Application Details Summary)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div><span className="text-slate-500 block">लिंग / आयु:</span><span className="font-bold">{selectedApp.deceasedDetails?.gender} / {selectedApp.deceasedDetails?.age || 'N/A'} वर्ष</span></div>
                  <div><span className="text-slate-500 block">मृत्यु तिथि:</span><span className="font-bold">{selectedApp.deceasedDetails?.dateOfDeath}</span></div>
                  <div><span className="text-slate-500 block">मृत्यु स्थान:</span><span className="font-bold">{selectedApp.deceasedDetails?.placeType} ({selectedApp.deceasedDetails?.placeOfDeath || 'N/A'})</span></div>
                  <div><span className="text-slate-500 block">वर्तमान पता:</span><span className="font-bold">{selectedApp.deceasedDetails?.presentAddress?.villageCity || 'N/A'}, {selectedApp.deceasedDetails?.presentAddress?.district || 'N/A'}</span></div>
                  <div><span className="text-slate-500 block">धर्म / व्यवसाय:</span><span className="font-bold">{selectedApp.statisticalDetails?.religion || 'N/A'} / {selectedApp.statisticalDetails?.occupation || 'N/A'}</span></div>
                  <div><span className="text-slate-500 block">चिकित्सा प्रमाणन:</span><span className="font-bold">{selectedApp.statisticalDetails?.isMedicallyCertified || 'N/A'}</span></div>
                </div>
              </div>

              <h4 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">आवेदन टाइमलाइन विवरण (Activity Timeline)</h4>
              <ApplicationTimeline timeline={selectedApp.timeline || []} />
            </div>
          </div>
        )}

        {/* CERTIFICATE PREVIEW MODAL */}
        {selectedApp && showCertModal && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 my-8 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-slate-900 font-extrabold text-base flex items-center gap-2">
                  📜 आधिकारिक मृत्यु प्रमाण पत्र पूर्वावलोकन (Official Death Certificate Preview)
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="btn btn-primary btn-sm flex items-center gap-1 font-bold"
                  >
                    <Printer className="w-3.5 h-3.5" /> प्रिंट / PDF डाउनलोड करें
                  </button>
                  <button onClick={() => { setShowCertModal(false); setSelectedApp(null); }} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <DeathCertificateTemplate record={selectedApp} />
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-10 max-w-4xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-lg">❓</span> मृत्यु प्रमाण पत्र संबंधी प्रश्न (Death Certificate FAQ)
            </h3>
            <div className="space-y-4">
              {[
                {
                  q: 'मृत्यु प्रमाण पत्र के लिए ऑनलाइन आवेदन कैसे करें? (How to apply for death certificate online?)',
                  a: 'ऊपर दिए गए "नया ऑनलाइन आवेदन दर्ज करें" टैब में सभी आवश्यक विवरण भरें और "जमा करें" बटन दबाएं। आपको एक आवेदन संख्या (DC-2026-XXXXX) प्राप्त होगी। Fill all required details in the "New Application" tab above and click "Submit". You will receive an application number (DC-2026-XXXXX).'
                },
                {
                  q: 'आवेदन जमा करने के बाद क्या होता है? (What happens after submitting the application?)',
                  a: 'आवेदन जमा होने के बाद अधिकारी द्वारा समीक्षा की जाती है। स्वीकृति के बाद आप प्रमाण पत्र डाउनलोड कर सकते हैं। हर चरण पर आपको सूचना प्राप्त होती है। After submission, the application is reviewed by an officer. Once approved, you can download the certificate. You receive notifications at every stage.'
                },
                {
                  q: 'क्या मैं अपना आवेदन संपादित कर सकता हूँ? (Can I edit my application?)',
                  a: 'हाँ, यदि अधिकारी द्वारा सुधार की मांग की जाती है, तो आप विवरण संपादित करके पुनः प्रस्तुत कर सकते हैं। ड्राफ्ट स्थिति में भी संपादन संभव है। Yes, if correction is requested by the officer, you can edit details and resubmit. Editing is also possible in draft status.'
                },
                {
                  q: 'प्रमाण पत्र कितने दिनों में मिलता है? (How many days to get the certificate?)',
                  a: 'सामान्यतः 7-15 कार्य दिवसों में प्रमाण पत्र जारी हो जाता है। आप "मेरे आवेदन" टैब में स्थिति देख सकते हैं। Generally, the certificate is issued within 7-15 working days. You can check status in the "My Applications" tab.'
                },
              ].map((faq, i) => (
                <details key={i} className="group border border-slate-200 rounded-2xl overflow-hidden">
                  <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-bold text-slate-800 select-none">
                    <span>{faq.q}</span>
                    <span className="text-emerald-600 group-open:rotate-45 transition-transform text-lg shrink-0">+</span>
                  </summary>
                  <div className="px-5 py-4 text-xs text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

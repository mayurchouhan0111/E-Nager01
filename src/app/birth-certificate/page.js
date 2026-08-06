'use client';

import React, { useState, useEffect } from 'react';
import ServiceHeader from '@/components/ServiceHeader';
import ApplicationTimeline from '@/components/ApplicationTimeline';
import BirthCertificateTemplate from '@/components/BirthCertificateTemplate';
import ApplicationLetterTemplate from '@/components/ApplicationLetterTemplate';
import DocumentUploader from '@/components/DocumentUploader';
import { 
  saveBirthCertificateDraft, 
  submitBirthCertificate, 
  getBirthCertificates 
} from '@/services/birthCertificateService';
import { 
  Baby, Activity, CheckCircle2, AlertCircle, RefreshCw, Printer, X, History, Plus, 
  Building2, User, Home, HeartPulse, CheckSquare, FileText, Download 
} from 'lucide-react';
import Link from 'next/link';

const defaultChildDetails = {
  fullName: '',
  gender: 'पुरुष (Male)',
  dateOfBirth: '',
  placeType: 'अस्पताल (Hospital)',
  placeOfBirth: '',
  hospitalName: '',
  homeAddress: '',
  otherPlaceDetails: '',
  birthWeight: '',
  deliveryType: 'सामान्य (Normal)',
  pregnancyDurationWeeks: '37-40 सप्ताह',
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

const defaultMotherDetails = {
  fullName: '',
  aadhaarNo: '',
  education: 'माध्यमिक (Secondary)',
  occupation: 'गृहणी (Housewife)',
  ageAtMarriage: '',
  ageAtChildBirth: ''
};

const defaultFatherDetails = {
  fullName: '',
  aadhaarNo: '',
  education: 'उच्चतर माध्यमिक (Higher Secondary)',
  occupation: 'कृषि / व्यापार (Agriculture / Business)'
};

const defaultApplicantDetails = {
  fullName: '',
  relationWithChild: 'पिता (Father)',
  mobile: '',
  email: '',
  aadhaarNo: '',
  address: '',
  villageCity: 'झाबुआ',
  district: 'झाबुआ',
  state: 'मध्य प्रदेश',
  pincode: '457661'
};

export default function BirthCertificatePage() {
  const [activeTab, setActiveTab] = useState('apply'); // 'apply' | 'track'
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    applicationNo: '',
    status: 'Draft',
    childDetails: { ...defaultChildDetails },
    motherDetails: { ...defaultMotherDetails },
    fatherDetails: { ...defaultFatherDetails },
    applicantDetails: { ...defaultApplicantDetails },
    documents: {
      hospitalSlip: null,
      motherAadhaar: null,
      fatherAadhaar: null,
      addressProof: null
    }
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    const data = await getBirthCertificates();
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
      const present = prev.childDetails.presentAddress;
      return {
        ...prev,
        childDetails: {
          ...prev.childDetails,
          permanentAddress: {
            ...prev.childDetails.permanentAddress,
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

  const handleDocumentUpload = (docKey, uploadObj) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docKey]: uploadObj
      }
    }));
  };

  const handleDocumentRemove = (docKey) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docKey]: null
      }
    }));
  };

  const validateForm = () => {
    const errors = [];
    const child = formData.childDetails || {};
    const mother = formData.motherDetails || {};
    const father = formData.fatherDetails || {};
    const applicant = formData.applicantDetails || {};

    // 1. Date of Birth Validation
    if (!child.dateOfBirth) {
      errors.push('शिशु की जन्म तिथि आवश्यक है (Date of Birth is required)');
    } else {
      const dob = new Date(child.dateOfBirth);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (dob > today) {
        errors.push('जन्म तिथि भविष्य की नहीं हो सकती (Date of Birth cannot be in the future)');
      }
    }

    // 2. Mother's Name
    if (!mother.fullName || !mother.fullName.trim()) {
      errors.push('माता का पूरा नाम आवश्यक है (Mother Full Name is required)');
    }

    // 3. Father's Name
    if (!father.fullName || !father.fullName.trim()) {
      errors.push('पिता का पूरा नाम आवश्यक है (Father Full Name is required)');
    }

    // 4. Informant Full Name
    if (!applicant.fullName || !applicant.fullName.trim()) {
      errors.push('आवेदक / सूचनाकर्ता का नाम आवश्यक है (Informant Name is required)');
    }

    // 5. Informant Mobile Number
    if (!applicant.mobile || !applicant.mobile.trim()) {
      errors.push('आवेदक का मोबाइल नंबर आवश्यक है (Informant Mobile is required)');
    } else {
      const cleanMobile = applicant.mobile.replace(/[\s-]/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
        errors.push('कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें (Invalid 10-digit mobile number)');
      }
    }

    // 6. Aadhaar Validations
    if (mother.aadhaarNo) {
      const clean = mother.aadhaarNo.replace(/[\s-]/g, '');
      if (clean.length > 0 && !/^\d{12}$/.test(clean)) {
        errors.push('माता का आधार नंबर 12 अंकों का होना चाहिए (Mother Aadhaar must be 12 digits)');
      }
    }

    if (father.aadhaarNo) {
      const clean = father.aadhaarNo.replace(/[\s-]/g, '');
      if (clean.length > 0 && !/^\d{12}$/.test(clean)) {
        errors.push('पिता का आधार नंबर 12 अंकों का होना चाहिए (Father Aadhaar must be 12 digits)');
      }
    }

    if (applicant.aadhaarNo) {
      const clean = applicant.aadhaarNo.replace(/[\s-]/g, '');
      if (clean.length > 0 && !/^\d{12}$/.test(clean)) {
        errors.push('आवेदक का आधार नंबर 12 अंकों का होना चाहिए (Informant Aadhaar must be 12 digits)');
      }
    }

    // 7. Pincodes
    if (child.presentAddress?.pincode && !/^\d{6}$/.test(child.presentAddress.pincode)) {
      errors.push('वर्तमान पते का पिनकोड 6 अंकों का होना चाहिए (Present address pincode must be 6 digits)');
    }

    if (!child.permanentAddress?.isSameAsPresent && child.permanentAddress?.pincode && !/^\d{6}$/.test(child.permanentAddress.pincode)) {
      errors.push('स्थायी पते का पिनकोड 6 अंकों का होना चाहिए (Permanent address pincode must be 6 digits)');
    }

    return errors;
  };

  const preparePayload = () => {
    const payload = JSON.parse(JSON.stringify(formData));
    if (payload.childDetails?.permanentAddress?.isSameAsPresent) {
      const present = payload.childDetails.presentAddress;
      payload.childDetails.permanentAddress = {
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
    const res = await saveBirthCertificateDraft(payload, formData.id);
    setLoading(false);

    if (res.success) {
      setMessage({ type: 'success', text: `जन्म प्रमाण पत्र प्रारूप सहेजा गया (Draft saved! App No: ${res.applicationNo})` });
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
      setMessage({ type: 'error', text: 'कृपया फॉर्म में त्रुटियों को सुधारें (Please resolve validation errors)' });
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setFormErrors([]);
    setLoading(true);
    setMessage(null);
    const payload = preparePayload();
    const res = await submitBirthCertificate(payload, formData.id);
    setLoading(false);

    if (res.success) {
      setMessage({ 
        type: 'success', 
        text: `जन्म प्रमाण पत्र आवेदन सफलतापूर्वक जमा हुआ (Application submitted! App No: ${res.applicationNo})` 
      });
      
      // Auto open letter preview for current submitted application
      const submittedRecord = { ...payload, id: res.id, applicationNo: res.applicationNo, status: 'Submitted', appliedAt: new Date().toISOString() };
      setSelectedApp(submittedRecord);
      setShowLetterModal(true);

      resetForm();
      loadApplications();
      setActiveTab('track');
    } else {
      setMessage({ type: 'error', text: res.error || 'आवेदन जमा करने में त्रुटि' });
    }
  };

  const handleEditForResubmit = (app) => {
    const normalizedApp = {
      ...app,
      childDetails: {
        ...defaultChildDetails,
        ...(app.childDetails || {}),
        presentAddress: { ...defaultChildDetails.presentAddress, ...(app.childDetails?.presentAddress || {}) },
        permanentAddress: { ...defaultChildDetails.permanentAddress, ...(app.childDetails?.permanentAddress || {}) }
      },
      motherDetails: { ...defaultMotherDetails, ...(app.motherDetails || {}) },
      fatherDetails: { ...defaultFatherDetails, ...(app.fatherDetails || {}) },
      applicantDetails: { ...defaultApplicantDetails, ...(app.applicantDetails || {}) },
      documents: app.documents || { hospitalSlip: null, motherAadhaar: null, fatherAadhaar: null, addressProof: null }
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
      childDetails: JSON.parse(JSON.stringify(defaultChildDetails)),
      motherDetails: JSON.parse(JSON.stringify(defaultMotherDetails)),
      fatherDetails: JSON.parse(JSON.stringify(defaultFatherDetails)),
      applicantDetails: JSON.parse(JSON.stringify(defaultApplicantDetails)),
      documents: {
        hospitalSlip: null,
        motherAadhaar: null,
        fatherAadhaar: null,
        addressProof: null
      }
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      <ServiceHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Banner */}
        <div className="relative bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-blue-200 border border-white/15 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              मध्य प्रदेश शासन - लोक स्वास्थ्य एवं परिवार कल्याण विभाग
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              जन्म प्रमाण पत्र ऑनलाइन आवेदन
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-3xl leading-relaxed">
              नगर पालिका परिषद झाबुआ (म.प्र.) | जन्म और मृत्यु पंजीकरण अधिनियम, 1969 के अंतर्गत डिजिटल जन्म पंजीकरण सेवा। ऑनलाइन फॉर्म भरें, भौतिक सत्यापन पावती पत्र डाउनलोड करें एवं स्वीकृत प्रमाण पत्र प्राप्त करें।
            </p>
          </div>
        </div>

        {/* Platform Legal Disclaimer & Mandatory Submission Warning */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm space-y-2 text-amber-950">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs sm:text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>⚠️ वैधानिक चेतावनी एवं आवश्यक निर्देश (Official Legal Responsibility & Instructions)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed font-medium">
            <div className="bg-white/80 p-3 rounded-2xl border border-amber-200">
              <strong className="text-amber-900 block mb-1">1. आवेदक का वैधानिक उत्तरदायित्व:</strong>
              इस संपूर्ण प्लेटफॉर्म पर दर्ज समस्त विवरण शासकीय अभिलेख हेतु आधिकारिक है। यदि आवेदक द्वारा कोई असत्य या भ्रामक जानकारी दर्ज की जाती है, तो उसके लिए <strong>केवल आवेदक स्वयं व्यक्तिगत एवं कानूनी रूप से उत्तरदायी</strong> होगा।
            </div>
            <div className="bg-white/80 p-3 rounded-2xl border border-amber-200">
              <strong className="text-amber-900 block mb-1">2. अनिवार्य भौतिक पावती पत्र जमा:</strong>
              ऑनलाइन आवेदन फॉर्म भरने के पश्चात, जनरेट किए गए <strong>पावती पत्र (Hard Copy Application Letter)</strong> का प्रिंटआउट निकालें और अपने <strong>संलग्न मूल दस्तावेजों सहित नगर पालिका कार्यालय झाबुआ</strong> में अनिवार्य रूप से जमा करें।
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-1.5 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
            <button
              onClick={() => setActiveTab('apply')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'apply'
                  ? 'bg-blue-700 text-white shadow-md'
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
                  ? 'bg-blue-700 text-white shadow-md'
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

        {/* Form Validation Errors */}
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
            
            {/* Correction Warning Banner */}
            {formData.status === 'Correction Requested' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 space-y-1 shadow-sm">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>सुधार की आवश्यकता (Correction Requested by Officer)</span>
                </div>
                <p className="text-xs text-amber-800">
                  अधिकारी की टिप्पणी: <span className="font-bold bg-amber-100 px-2 py-0.5 rounded text-amber-900">{formData.lastOfficerRemark || 'विवरण सुधारें'}</span>
                </p>
                <p className="text-[11px] text-amber-700 pt-1">कृपया विवरण सुधारें एवं "आवेदन पुनः प्रस्तुत करें" बटन पर क्लिक करें।</p>
              </div>
            )}

            {/* SECTION 1: CHILD DETAILS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800 text-xs">👶</span> 1. नवजात शिशु का विवरण (Child Details)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    शिशु का पूरा नाम (Full Name of Child)
                  </label>
                  <input
                    type="text"
                    value={formData.childDetails.fullName}
                    onChange={(e) => handleInputChange('childDetails', 'fullName', e.target.value)}
                    placeholder="यदि नामकरण हो गया हो (जैसे: आरव शर्मा)"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">* नामकरण न होने पर खाली छोड़ सकते हैं</span>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    लिंग (Gender) *
                  </label>
                  <select
                    value={formData.childDetails.gender}
                    onChange={(e) => handleInputChange('childDetails', 'gender', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  >
                    <option>पुरुष (Male)</option>
                    <option>महिला (Female)</option>
                    <option>अन्य (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    जन्म की तिथि (Date of Birth) *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.childDetails.dateOfBirth}
                    onChange={(e) => handleInputChange('childDetails', 'dateOfBirth', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    जन्म के समय वजन (Weight in kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.childDetails.birthWeight}
                    onChange={(e) => handleInputChange('childDetails', 'birthWeight', e.target.value)}
                    placeholder="2.8 kg"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    प्रसव का प्रकार (Type of Delivery)
                  </label>
                  <select
                    value={formData.childDetails.deliveryType}
                    onChange={(e) => handleInputChange('childDetails', 'deliveryType', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  >
                    <option>सामान्य (Normal Delivery)</option>
                    <option>सिजेरियन (Cesarean)</option>
                    <option>अन्य (Vacuum / Assisted)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    गर्भावस्था की अवधि (Pregnancy Duration)
                  </label>
                  <select
                    value={formData.childDetails.pregnancyDurationWeeks}
                    onChange={(e) => handleInputChange('childDetails', 'pregnancyDurationWeeks', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  >
                    <option>37-40 सप्ताह (Full Term)</option>
                    <option>37 सप्ताह से कम (Pre-term)</option>
                    <option>40 सप्ताह से अधिक (Post-term)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: PLACE OF BIRTH & ADDRESS DETAILS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800 text-xs">🏥</span> 2. जन्म का स्थान एवं पता विवरण (Place of Birth & Address Details)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    जन्म का स्थान प्रकार (Place Type)
                  </label>
                  <select
                    value={formData.childDetails.placeType}
                    onChange={(e) => handleInputChange('childDetails', 'placeType', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  >
                    <option>अस्पताल (Hospital)</option>
                    <option>घर (Home)</option>
                    <option>अन्य स्थान (Other Place)</option>
                  </select>
                </div>

                {formData.childDetails.placeType.includes('अस्पताल') && (
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      अस्पताल का नाम (Hospital Name)
                    </label>
                    <input
                      type="text"
                      value={formData.childDetails.hospitalName}
                      onChange={(e) => handleInputChange('childDetails', 'hospitalName', e.target.value)}
                      placeholder="जिला चिकित्सालय झाबुआ / निजी अस्पताल"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                    />
                  </div>
                )}

                {formData.childDetails.placeType.includes('घर') && (
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      घर का पता (Home Address of Birth)
                    </label>
                    <input
                      type="text"
                      value={formData.childDetails.homeAddress}
                      onChange={(e) => handleInputChange('childDetails', 'homeAddress', e.target.value)}
                      placeholder="मकान नंबर, वार्ड नंबर, झाबुआ"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                    />
                  </div>
                )}

                {formData.childDetails.placeType.includes('अन्य') && (
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      अन्य स्थान विवरण (Other Place Details)
                    </label>
                    <input
                      type="text"
                      value={formData.childDetails.otherPlaceDetails}
                      onChange={(e) => handleInputChange('childDetails', 'otherPlaceDetails', e.target.value)}
                      placeholder="मार्ग / वाहन / अन्य पता"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                    />
                  </div>
                )}
              </div>

              {/* Present Address */}
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3">
                  📍 जन्म के समय माता-पिता का पता (Parents' Address at Time of Child Birth)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">मकान / द्वार संख्या (House / Door No.)</label>
                    <input
                      type="text"
                      value={formData.childDetails.presentAddress.houseNo}
                      onChange={(e) => handleInputChange('childDetails', 'presentAddress', e.target.value, 'houseNo')}
                      placeholder="मकान क्र. 12/B"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">मार्ग / मोहल्ला (Street / Colony)</label>
                    <input
                      type="text"
                      value={formData.childDetails.presentAddress.street}
                      onChange={(e) => handleInputChange('childDetails', 'presentAddress', e.target.value, 'street')}
                      placeholder="तिलक मार्ग"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ग्राम / नगर (Village / City)</label>
                    <input
                      type="text"
                      value={formData.childDetails.presentAddress.villageCity}
                      onChange={(e) => handleInputChange('childDetails', 'presentAddress', e.target.value, 'villageCity')}
                      placeholder="झाबुआ"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">जिला (District)</label>
                    <input
                      type="text"
                      value={formData.childDetails.presentAddress.district}
                      onChange={(e) => handleInputChange('childDetails', 'presentAddress', e.target.value, 'district')}
                      placeholder="झाबुआ"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">राज्य (State)</label>
                    <input
                      type="text"
                      value={formData.childDetails.presentAddress.state}
                      onChange={(e) => handleInputChange('childDetails', 'presentAddress', e.target.value, 'state')}
                      placeholder="मध्य प्रदेश"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">पिनकोड (Pincode - 6 Digits)</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.childDetails.presentAddress.pincode}
                      onChange={(e) => handleInputChange('childDetails', 'presentAddress', e.target.value, 'pincode')}
                      placeholder="457661"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Permanent Address */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    🏠 माता-पिता का स्थायी पता (Permanent Address of Parents)
                  </h3>
                  <label className="flex items-center gap-2 text-xs text-blue-800 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.childDetails.permanentAddress.isSameAsPresent}
                      onChange={(e) => toggleSameAsPresentAddress(e.target.checked)}
                      className="rounded text-blue-700 focus:ring-blue-600 h-4 w-4"
                    />
                    <span>वर्तमान पते के समान (Same as Present Address)</span>
                  </label>
                </div>

                {!formData.childDetails.permanentAddress.isSameAsPresent && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">मकान / द्वार संख्या</label>
                      <input
                        type="text"
                        value={formData.childDetails.permanentAddress.houseNo}
                        onChange={(e) => handleInputChange('childDetails', 'permanentAddress', e.target.value, 'houseNo')}
                        placeholder="मकान क्र."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">मार्ग / मोहल्ला</label>
                      <input
                        type="text"
                        value={formData.childDetails.permanentAddress.street}
                        onChange={(e) => handleInputChange('childDetails', 'permanentAddress', e.target.value, 'street')}
                        placeholder="मोहल्ला"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">ग्राम / नगर</label>
                      <input
                        type="text"
                        value={formData.childDetails.permanentAddress.villageCity}
                        onChange={(e) => handleInputChange('childDetails', 'permanentAddress', e.target.value, 'villageCity')}
                        placeholder="झाबुआ"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">जिला</label>
                      <input
                        type="text"
                        value={formData.childDetails.permanentAddress.district}
                        onChange={(e) => handleInputChange('childDetails', 'permanentAddress', e.target.value, 'district')}
                        placeholder="झाबुआ"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">राज्य</label>
                      <input
                        type="text"
                        value={formData.childDetails.permanentAddress.state}
                        onChange={(e) => handleInputChange('childDetails', 'permanentAddress', e.target.value, 'state')}
                        placeholder="मध्य प्रदेश"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">पिनकोड</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={formData.childDetails.permanentAddress.pincode}
                        onChange={(e) => handleInputChange('childDetails', 'permanentAddress', e.target.value, 'pincode')}
                        placeholder="457661"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 3: MOTHER'S DETAILS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800 text-xs">👩</span> 3. माता का विवरण (Mother's Details)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    माता का पूरा नाम (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.motherDetails.fullName}
                    onChange={(e) => handleInputChange('motherDetails', 'fullName', e.target.value)}
                    placeholder="जैसे: श्रीमती सुनीता शर्मा"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    माता आधार संख्या (12 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={14}
                    value={formData.motherDetails.aadhaarNo}
                    onChange={(e) => handleInputChange('motherDetails', 'aadhaarNo', e.target.value)}
                    placeholder="XXXX-XXXX-XXXX"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    शिक्षा का स्तर (Education Level)
                  </label>
                  <select
                    value={formData.motherDetails.education}
                    onChange={(e) => handleInputChange('motherDetails', 'education', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  >
                    <option>प्राथमिक (Primary)</option>
                    <option>माध्यमिक (Secondary)</option>
                    <option>उच्चतर माध्यमिक (Higher Secondary)</option>
                    <option>स्नातक / परास्नातक (Graduate / Post Graduate)</option>
                    <option>अशिक्षित (Illiterate)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    व्यवसाय (Occupation)
                  </label>
                  <input
                    type="text"
                    value={formData.motherDetails.occupation}
                    onChange={(e) => handleInputChange('motherDetails', 'occupation', e.target.value)}
                    placeholder="गृहणी / नौकरी / व्यापार"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    विवाह के समय माता की आयु (वर्षों में)
                  </label>
                  <input
                    type="number"
                    value={formData.motherDetails.ageAtMarriage}
                    onChange={(e) => handleInputChange('motherDetails', 'ageAtMarriage', e.target.value)}
                    placeholder="22"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    शिशु जन्म के समय माता की आयु (वर्षों में)
                  </label>
                  <input
                    type="number"
                    value={formData.motherDetails.ageAtChildBirth}
                    onChange={(e) => handleInputChange('motherDetails', 'ageAtChildBirth', e.target.value)}
                    placeholder="25"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: FATHER'S DETAILS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800 text-xs">👨</span> 4. पिता का विवरण (Father's Details)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    पिता का पूरा नाम (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fatherDetails.fullName}
                    onChange={(e) => handleInputChange('fatherDetails', 'fullName', e.target.value)}
                    placeholder="जैसे: श्री राजेश कुमार शर्मा"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    पिता आधार संख्या (12 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={14}
                    value={formData.fatherDetails.aadhaarNo}
                    onChange={(e) => handleInputChange('fatherDetails', 'aadhaarNo', e.target.value)}
                    placeholder="XXXX-XXXX-XXXX"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    शिक्षा का स्तर (Education Level)
                  </label>
                  <select
                    value={formData.fatherDetails.education}
                    onChange={(e) => handleInputChange('fatherDetails', 'education', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  >
                    <option>प्राथमिक (Primary)</option>
                    <option>माध्यमिक (Secondary)</option>
                    <option>उच्चतर माध्यमिक (Higher Secondary)</option>
                    <option>स्नातक / परास्नातक (Graduate / Post Graduate)</option>
                    <option>अशिक्षित (Illiterate)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    व्यवसाय (Occupation)
                  </label>
                  <input
                    type="text"
                    value={formData.fatherDetails.occupation}
                    onChange={(e) => handleInputChange('fatherDetails', 'occupation', e.target.value)}
                    placeholder="कृषि / व्यापार / शासकीय सेवा"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: APPLICANT / INFORMANT DETAILS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800 text-xs">📝</span> 5. आवेदक / सूचनाकर्ता का विवरण (Applicant / Informant Details)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    आवेदक / सूचनाकर्ता का पूरा नाम *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.applicantDetails.fullName}
                    onChange={(e) => handleInputChange('applicantDetails', 'fullName', e.target.value)}
                    placeholder="आपका नाम"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    शिशु से संबंध (Relation)
                  </label>
                  <select
                    value={formData.applicantDetails.relationWithChild}
                    onChange={(e) => handleInputChange('applicantDetails', 'relationWithChild', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  >
                    <option>पिता (Father)</option>
                    <option>माता (Mother)</option>
                    <option>दादा / दादी (Grandparent)</option>
                    <option>अन्य रिश्तेदार (Other Relative)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    मोबाइल नंबर *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.applicantDetails.mobile}
                    onChange={(e) => handleInputChange('applicantDetails', 'mobile', e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    ईमेल पता (Email Address)
                  </label>
                  <input
                    type="email"
                    value={formData.applicantDetails.email}
                    onChange={(e) => handleInputChange('applicantDetails', 'email', e.target.value)}
                    placeholder="citizen@example.com"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    आवेदक आधार संख्या (12 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={14}
                    value={formData.applicantDetails.aadhaarNo}
                    onChange={(e) => handleInputChange('applicantDetails', 'aadhaarNo', e.target.value)}
                    placeholder="XXXX-XXXX-XXXX"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    आवेदक का पता (Address)
                  </label>
                  <input
                    type="text"
                    value={formData.applicantDetails.address}
                    onChange={(e) => handleInputChange('applicantDetails', 'address', e.target.value)}
                    placeholder="मकान नंबर, वार्ड नंबर, झाबुआ"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 6: SUPPORTING DOCUMENT PHOTO UPLOADS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800 text-xs">📎</span> 6. आवश्यक दस्तावेज फोटो अपलोड (Supporting Document Uploads)
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                कृपया प्रमाण पत्र सत्यापन हेतु आवश्यक मूल दस्तावेजों की स्पष्ट फोटो या PDF फ़ाइल संलग्न करें।
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <DocumentUploader
                  title="अस्पताल जन्म डिस्चार्ज कार्ड / पर्ची"
                  description="अस्पताल द्वारा जारी जन्म पर्ची या डिस्चार्ज कार्ड"
                  required={true}
                  documentData={formData.documents.hospitalSlip}
                  onUpload={(doc) => handleDocumentUpload('hospitalSlip', doc)}
                  onRemove={() => handleDocumentRemove('hospitalSlip')}
                />

                <DocumentUploader
                  title="माता का आधार कार्ड फोटो"
                  description="शिशु की माता का आधार कार्ड (स्पष्ट फोटो)"
                  required={true}
                  documentData={formData.documents.motherAadhaar}
                  onUpload={(doc) => handleDocumentUpload('motherAadhaar', doc)}
                  onRemove={() => handleDocumentRemove('motherAadhaar')}
                />

                <DocumentUploader
                  title="पिता का आधार कार्ड फोटो"
                  description="शिशु के पिता का आधार कार्ड (स्पष्ट फोटो)"
                  required={true}
                  documentData={formData.documents.fatherAadhaar}
                  onUpload={(doc) => handleDocumentUpload('fatherAadhaar', doc)}
                  onRemove={() => handleDocumentRemove('fatherAadhaar')}
                />

                <DocumentUploader
                  title="निवास प्रमाण पत्र फोटो"
                  description="राशन कार्ड / वोटर ID / बिजली बिल / अन्य"
                  required={false}
                  documentData={formData.documents.addressProof}
                  onUpload={(doc) => handleDocumentUpload('addressProof', doc)}
                  onRemove={() => handleDocumentRemove('addressProof')}
                />
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
                className="btn btn-primary bg-blue-700 hover:bg-blue-800 flex items-center gap-2 shadow-lg shadow-blue-700/20 font-bold"
              >
                {loading ? (
                  <RefreshCw className="animate-spin w-4 h-4 text-white" />
                ) : formData.status === 'Correction Requested' ? (
                  '🔄 आवेदन पुनः प्रस्तुत करें (Resubmit Application)'
                ) : (
                  '🚀 जन्म प्रमाण पत्र आवेदन जमा करें (Submit Application)'
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
                <Baby className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-slate-800 font-bold text-base mb-1">कोई आवेदन नहीं मिला</h3>
                <p className="text-slate-500 text-xs mb-4">आपने अभी तक कोई जन्म प्रमाण पत्र आवेदन जमा नहीं किया है।</p>
                <button
                  onClick={() => setActiveTab('apply')}
                  className="btn btn-primary text-xs font-bold bg-blue-700 hover:bg-blue-800"
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
                        <span className="text-xs font-mono font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">{app.applicationNo || 'DRAFT'}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusChip(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                      <h3 className="text-slate-900 font-extrabold text-base">
                        👶 {app.childDetails?.fullName || 'शिशु (अनाम)'} (जन्म तिथि: {app.childDetails?.dateOfBirth || 'N/A'})
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        माता: {app.motherDetails?.fullName} | पिता: {app.fatherDetails?.fullName} | आवेदक: {app.applicantDetails?.fullName}
                      </p>
                      {app.childDetails?.presentAddress?.villageCity && (
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">पता: {app.childDetails.presentAddress.villageCity}, {app.childDetails.presentAddress.district}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Hard Copy Submission Letter */}
                      <button
                        onClick={() => { setSelectedApp(app); setShowLetterModal(true); }}
                        className="btn btn-secondary btn-sm flex items-center gap-1 font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border-blue-200"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-700" /> 🖨️ आवेदन पत्र (Hard Copy Letter)
                      </button>

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
                        <History className="w-3.5 h-3.5 text-slate-500" /> स्थिति देखें
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* TIMELINE & APPLICATION DETAILS MODAL */}
        {selectedApp && !showCertModal && !showLetterModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">{selectedApp.applicationNo}</span>
                  <h3 className="text-slate-900 font-extrabold text-lg mt-1">शिशु: {selectedApp.childDetails?.fullName || 'अनाम'}</h3>
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

              {/* Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
                <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1.5 uppercase tracking-wider text-[11px]">आवेदन विवरण (Application Details Summary)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div><span className="text-slate-500 block">जन्म तिथि / लिंग:</span><span className="font-bold">{selectedApp.childDetails?.dateOfBirth} / {selectedApp.childDetails?.gender}</span></div>
                  <div><span className="text-slate-500 block">माता का नाम:</span><span className="font-bold">{selectedApp.motherDetails?.fullName || 'N/A'}</span></div>
                  <div><span className="text-slate-500 block">पिता का नाम:</span><span className="font-bold">{selectedApp.fatherDetails?.fullName || 'N/A'}</span></div>
                  <div><span className="text-slate-500 block">जन्म स्थान:</span><span className="font-bold">{selectedApp.childDetails?.hospitalName || selectedApp.childDetails?.placeType}</span></div>
                  <div><span className="text-slate-500 block">आवेदक नाम:</span><span className="font-bold">{selectedApp.applicantDetails?.fullName} ({selectedApp.applicantDetails?.relationWithChild})</span></div>
                  <div><span className="text-slate-500 block">संपर्क नंबर:</span><span className="font-bold">{selectedApp.applicantDetails?.mobile}</span></div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowLetterModal(true)}
                  className="btn btn-secondary btn-sm text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-700" /> भौतिक पावती पत्र देखें / प्रिंट करें
                </button>
              </div>

              <h4 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">आवेदन टाइमलाइन विवरण (Activity Timeline)</h4>
              <ApplicationTimeline timeline={selectedApp.timeline || []} />
            </div>
          </div>
        )}

        {/* APPLICATION SUBMISSION LETTER MODAL */}
        {selectedApp && showLetterModal && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 my-8 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-slate-900 font-extrabold text-base flex items-center gap-2">
                  📄 भौतिक सत्यापन आवेदन पत्र (Application Submission Letter)
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="btn btn-primary btn-sm bg-blue-700 flex items-center gap-1 font-bold text-xs"
                  >
                    <Printer className="w-3.5 h-3.5" /> प्रिंट / PDF डाउनलोड करें
                  </button>
                  <button onClick={() => { setShowLetterModal(false); setSelectedApp(null); }} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <ApplicationLetterTemplate record={selectedApp} serviceType="birth" />
            </div>
          </div>
        )}

        {/* CERTIFICATE PREVIEW MODAL */}
        {selectedApp && showCertModal && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 my-8 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-slate-900 font-extrabold text-base flex items-center gap-2">
                  📜 आधिकारिक जन्म प्रमाण पत्र पूर्वावलोकन (Official Birth Certificate Preview)
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="btn btn-primary btn-sm flex items-center gap-1 font-bold text-xs"
                  >
                    <Printer className="w-3.5 h-3.5" /> प्रिंट / PDF डाउनलोड करें
                  </button>
                  <button onClick={() => { setShowCertModal(false); setSelectedApp(null); }} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <BirthCertificateTemplate record={selectedApp} />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

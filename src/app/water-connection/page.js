'use client';

import React, { useState, useEffect } from 'react';
import ServiceHeader from '@/components/ServiceHeader';
import ApplicationTimeline from '@/components/ApplicationTimeline';
import WaterConnectionTemplate from '@/components/WaterConnectionTemplate';
import ApplicationLetterTemplate from '@/components/ApplicationLetterTemplate';
import DocumentUploader from '@/components/DocumentUploader';
import DocumentChecklist from '@/components/DocumentChecklist';
import { 
  saveWaterConnectionDraft, 
  submitWaterConnection, 
  getWaterConnections 
} from '@/services/waterConnectionService';
import { 
  Droplet, Activity, CheckCircle2, AlertCircle, RefreshCw, Printer, X, History, Plus, 
  Building2, User, Home, FileText, Download, ShieldAlert, CheckSquare, Wrench, ListChecks
} from 'lucide-react';
import Link from 'next/link';

const defaultApplicantDetails = {
  fullName: '',
  fatherHusbandName: '',
  caste: '',
  wardNo: '',
  isTenant: false,
  mobile: '',
  email: '',
  aadhaarNo: '',
  address: '',
  occupation: ''
};

const defaultPropertyDetails = {
  houseNo: '',
  houseOwnerName: '',
  connectionSize: '1/2 इंच',
  ferruleSize: '1/2 इंच',
  tapCount: '1',
  consumerCount: '4',
  livestockCount: '0',
  dailyWaterLiters: '200',
  usagePurpose: 'घरेलू (Domestic)',
  distanceMainPipe: '20',
  pipeSize: '1/2 इंच',
  totalPipeLength: '25'
};

const defaultExistingConnectionDetails = {
  hasExistingConnection: false,
  existingConnNo: '',
  existingConnName: '',
  existingWardHouse: ''
};

const defaultPlumberDetails = {
  plumberName: '',
  plumberLicenseNo: ''
};

export default function WaterConnectionPage() {
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
    applicantDetails: { ...defaultApplicantDetails },
    propertyDetails: { ...defaultPropertyDetails },
    existingConnectionDetails: { ...defaultExistingConnectionDetails },
    plumberDetails: { ...defaultPlumberDetails },
    documents: {
      aadhaarCard: null,
      propertyReceipt: null,
      affidavitDoc: null,
      applicantPhoto: null
    }
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    const data = await getWaterConnections();
    setApplications(data);
    setLoading(false);
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
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
    const applicant = formData.applicantDetails || {};
    const property = formData.propertyDetails || {};

    if (!applicant.fullName || !applicant.fullName.trim()) {
      errors.push('आवेदक का पूरा नाम आवश्यक है (Applicant Full Name is required)');
    }

    if (!applicant.fatherHusbandName || !applicant.fatherHusbandName.trim()) {
      errors.push('पिता / पति का नाम आवश्यक है (Father/Husband Name is required)');
    }

    if (!applicant.wardNo || !applicant.wardNo.trim()) {
      errors.push('वार्ड क्रमांक आवश्यक है (Ward Number is required)');
    }

    if (!property.houseNo || !property.houseNo.trim()) {
      errors.push('भवन / मकान क्रमांक आवश्यक है (Building/House Number is required)');
    }

    if (!applicant.mobile || !applicant.mobile.trim()) {
      errors.push('आवेदक का मोबाइल नंबर आवश्यक है (Applicant Mobile Number is required)');
    } else {
      const cleanMobile = applicant.mobile.replace(/[\s-]/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
        errors.push('कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें (Invalid 10-digit mobile number)');
      }
    }

    if (applicant.aadhaarNo) {
      const clean = applicant.aadhaarNo.replace(/[\s-]/g, '');
      if (clean.length > 0 && !/^\d{12}$/.test(clean)) {
        errors.push('आवेदक का आधार नंबर 12 अंकों का होना चाहिए (Aadhaar Number must be 12 digits)');
      }
    }

    return errors;
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setMessage(null);
    setFormErrors([]);
    const res = await saveWaterConnectionDraft(formData, formData.id);
    setLoading(false);

    if (res.success) {
      setMessage({ type: 'success', text: `जल कनेक्शन आवेदन प्रारूप सहेजा गया (Draft saved! App No: ${res.applicationNo})` });
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
    const res = await submitWaterConnection(formData, formData.id);
    setLoading(false);

    if (res.success) {
      setMessage({ 
        type: 'success', 
        text: `जल कनेक्शन आवेदन सफलतापूर्वक जमा हुआ (Application submitted! App No: ${res.applicationNo})` 
      });
      
      const submittedRecord = { ...formData, id: res.id, applicationNo: res.applicationNo, status: 'Submitted', appliedAt: new Date().toISOString() };
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
    setFormData({
      ...app,
      applicantDetails: { ...defaultApplicantDetails, ...(app.applicantDetails || {}) },
      propertyDetails: { ...defaultPropertyDetails, ...(app.propertyDetails || {}) },
      existingConnectionDetails: { ...defaultExistingConnectionDetails, ...(app.existingConnectionDetails || {}) },
      plumberDetails: { ...defaultPlumberDetails, ...(app.plumberDetails || {}) },
      documents: app.documents || { aadhaarCard: null, propertyReceipt: null, affidavitDoc: null, applicantPhoto: null }
    });
    setActiveTab('apply');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormErrors([]);
    setFormData({
      id: null,
      applicationNo: '',
      status: 'Draft',
      applicantDetails: JSON.parse(JSON.stringify(defaultApplicantDetails)),
      propertyDetails: JSON.parse(JSON.stringify(defaultPropertyDetails)),
      existingConnectionDetails: JSON.parse(JSON.stringify(defaultExistingConnectionDetails)),
      plumberDetails: JSON.parse(JSON.stringify(defaultPlumberDetails)),
      documents: {
        aadhaarCard: null,
        propertyReceipt: null,
        affidavitDoc: null,
        applicantPhoto: null
      }
    });
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Approved':
      case 'Sanctioned':
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Correction Requested':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Under Review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Submitted':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      <ServiceHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Banner */}
        <div className="relative bg-gradient-to-br from-teal-800 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-teal-200 border border-white/15 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-300" />
              मध्य प्रदेश शासन — नगर पालिका परिषद झाबुआ (जल प्रदाय शाखा)
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              नल कनेक्शन हेतु ऑनलाइन आवेदन पत्र
            </h1>
            <p className="text-teal-100 text-xs sm:text-sm max-w-3xl leading-relaxed">
              कार्यालय नगर पालिका परिषद झाबुआ (म.प्र.)। नए जल कनेक्शन हेतु ऑनलाइन आवेदन दर्ज करें, पावती पत्र (Hard Copy) प्रिंट करें एवं भौतिक सत्यापन हेतु कार्यालय में प्रस्तुत करें।
            </p>
          </div>
        </div>

        {/* Platform Legal Disclaimer & Mandatory Submission Warning */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm space-y-2 text-amber-950">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs sm:text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>⚠️ वैधानिक चेतावनी एवं आवश्यक दिशा-निर्देश (Official Legal Responsibility & Instructions)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed font-medium">
            <div className="bg-white/80 p-3 rounded-2xl border border-amber-200">
              <strong className="text-amber-900 block mb-1">1. आवेदक का वैधानिक उत्तरदायित्व:</strong>
              इस संपूर्ण प्लेटफॉर्म पर आवेदक द्वारा प्रविष्ट समस्त विवरण शासकीय अभिलेख हेतु आधिकारिक माना जाएगा। यदि आवेदक द्वारा कोई असत्य, गलत या भ्रामक जानकारी दर्ज की जाती है, तो उसके लिए <strong>केवल आवेदक स्वयं व्यक्तिगत एवं कानूनी रूप से उत्तरदायी</strong> होगा।
            </div>
            <div className="bg-white/80 p-3 rounded-2xl border border-amber-200">
              <strong className="text-amber-900 block mb-1">2. अनिवार्य भौतिक पावती पत्र जमा:</strong>
              ऑनलाइन आवेदन फॉर्म भरने के पश्चात, जनरेट किए गए <strong>पावती पत्र (Hard Copy Printed Application Letter)</strong> का प्रिंटआउट निकालें और अपने <strong>संलग्न मूल दस्तावेजों सहित नगर पालिका कार्यालय झाबुआ</strong> में अनिवार्य रूप से जमा करें।
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
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Droplet className="w-4 h-4" />
              <span>{formData.id ? 'आवेदन संपादित करें / पुन: प्रस्तुत करें' : 'नया नल कनेक्शन आवेदन भरें'}</span>
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'track'
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>मेरे आवेदन एवं स्थिति ({applications.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'checklist'
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ListChecks className="w-4 h-4" />
              <span>आवश्यक दस्तावेज चैकलिस्ट</span>
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
              <span>कृपया निम्नलिखित त्रुटियों को ठीक करें:</span>
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

            {/* SECTION 1: APPLICANT DETAILS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="p-1.5 rounded-lg bg-teal-100 text-teal-800 text-xs">👤</span> 1. आवेदक का व्यक्तिगत विवरण (Applicant Details)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    आवेदक का पूरा नाम (Applicant Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.applicantDetails.fullName}
                    onChange={(e) => handleInputChange('applicantDetails', 'fullName', e.target.value)}
                    placeholder="जैसे: रामेश चंद्र शर्मा"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    पिता / पुत्र / पुत्री / पत्नी का नाम *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.applicantDetails.fatherHusbandName}
                    onChange={(e) => handleInputChange('applicantDetails', 'fatherHusbandName', e.target.value)}
                    placeholder="पिता / पति का नाम दर्ज करें"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    जाति (Caste)
                  </label>
                  <input
                    type="text"
                    value={formData.applicantDetails.caste}
                    onChange={(e) => handleInputChange('applicantDetails', 'caste', e.target.value)}
                    placeholder="जाति दर्ज करें"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    वार्ड क्रमांक (Ward Number) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.applicantDetails.wardNo}
                    onChange={(e) => handleInputChange('applicantDetails', 'wardNo', e.target.value)}
                    placeholder="वार्ड क्र. 5"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    क्या आवेदक किराएदार है? (Is Tenant?)
                  </label>
                  <select
                    value={formData.applicantDetails.isTenant ? 'हाँ' : 'नहीं'}
                    onChange={(e) => handleInputChange('applicantDetails', 'isTenant', e.target.value === 'हाँ')}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 font-medium"
                  >
                    <option value="नहीं">नहीं (No — Owner)</option>
                    <option value="हाँ">हाँ (Yes — Tenant)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    मोबाइल नंबर (Mobile No) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.applicantDetails.mobile}
                    onChange={(e) => handleInputChange('applicantDetails', 'mobile', e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 font-medium font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    आधार संख्या (Aadhaar Number)
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={formData.applicantDetails.aadhaarNo}
                    onChange={(e) => handleInputChange('applicantDetails', 'aadhaarNo', e.target.value)}
                    placeholder="12 अंकों का आधार क्र."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 font-medium font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    विभाग / संस्था (यदि सेवारत हों)
                  </label>
                  <input
                    type="text"
                    value={formData.applicantDetails.occupation}
                    onChange={(e) => handleInputChange('applicantDetails', 'occupation', e.target.value)}
                    placeholder="कार्यरत विभाग / व्यवसाय"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 font-medium"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    आवेदक का पूरा पता (Full Address)
                  </label>
                  <input
                    type="text"
                    value={formData.applicantDetails.address}
                    onChange={(e) => handleInputChange('applicantDetails', 'address', e.target.value)}
                    placeholder="मकान नंबर, मोहल्ला, वार्ड, झाबुआ (म.प्र.)"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: PROPERTY & CONNECTION SPECIFICATIONS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="p-1.5 rounded-lg bg-teal-100 text-teal-800 text-xs">🏡</span> 2. भवन एवं कनेक्शन माप विवरण (Property & Connection Details)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    भवन क्रमांक (Building / House No.) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.propertyDetails.houseNo}
                    onChange={(e) => handleInputChange('propertyDetails', 'houseNo', e.target.value)}
                    placeholder="जैसे: 45/A"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    भवन स्वामी का नाम (House Owner Name)
                  </label>
                  <input
                    type="text"
                    value={formData.propertyDetails.houseOwnerName}
                    onChange={(e) => handleInputChange('propertyDetails', 'houseOwnerName', e.target.value)}
                    placeholder="यदि स्वामी भिन्न हो तो नाम लिखें"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    कनेक्शन साइज (Connection Size)
                  </label>
                  <select
                    value={formData.propertyDetails.connectionSize}
                    onChange={(e) => handleInputChange('propertyDetails', 'connectionSize', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 font-medium"
                  >
                    <option>1/2 इंच (0.5 inch)</option>
                    <option>3/4 इंच (0.75 inch)</option>
                    <option>1 इंच (1.0 inch)</option>
                    <option>व्यावसायिक नाप (Commercial Size)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    फेरूल साइज (Ferrule Size)
                  </label>
                  <input
                    type="text"
                    value={formData.propertyDetails.ferruleSize}
                    onChange={(e) => handleInputChange('propertyDetails', 'ferruleSize', e.target.value)}
                    placeholder="1/2 इंच"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    टोटी की संख्या (Number of Taps)
                  </label>
                  <input
                    type="number"
                    value={formData.propertyDetails.tapCount}
                    onChange={(e) => handleInputChange('propertyDetails', 'tapCount', e.target.value)}
                    placeholder="1"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    उपयोगकर्ताओं की संख्या (No. of Consumers)
                  </label>
                  <input
                    type="number"
                    value={formData.propertyDetails.consumerCount}
                    onChange={(e) => handleInputChange('propertyDetails', 'consumerCount', e.target.value)}
                    placeholder="4"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    प्रतिदिन जल आवश्यकता (लीटर में)
                  </label>
                  <input
                    type="text"
                    value={formData.propertyDetails.dailyWaterLiters}
                    onChange={(e) => handleInputChange('propertyDetails', 'dailyWaterLiters', e.target.value)}
                    placeholder="200 लीटर"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    जल उपयोग प्रयोजन (Usage Purpose)
                  </label>
                  <select
                    value={formData.propertyDetails.usagePurpose}
                    onChange={(e) => handleInputChange('propertyDetails', 'usagePurpose', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 font-medium"
                  >
                    <option>घरेलू (Domestic Purpose)</option>
                    <option>व्यावसायिक (Commercial / Shop)</option>
                    <option>संस्थागत (Institutional / School)</option>
                    <option>निर्माण कार्य (Construction Purpose)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    मुख्य पाइप लाइन से दूरी (फीट में)
                  </label>
                  <input
                    type="text"
                    value={formData.propertyDetails.distanceMainPipe}
                    onChange={(e) => handleInputChange('propertyDetails', 'distanceMainPipe', e.target.value)}
                    placeholder="20 फीट"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: LICENSED PLUMBER DETAILS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="p-1.5 rounded-lg bg-teal-100 text-teal-800 text-xs">🔧</span> 3. अधिकृत लाइसेंसधारी प्लम्बर विवरण (Authorized Plumber Details)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    नगर पालिका/निगम अधिकृत प्लम्बर का नाम
                  </label>
                  <input
                    type="text"
                    value={formData.plumberDetails.plumberName}
                    onChange={(e) => handleInputChange('plumberDetails', 'plumberName', e.target.value)}
                    placeholder="प्लम्बर का पूरा नाम"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    दत्त लाइसेंस क्रमांक (Plumber License No.)
                  </label>
                  <input
                    type="text"
                    value={formData.plumberDetails.plumberLicenseNo}
                    onChange={(e) => handleInputChange('plumberDetails', 'plumberLicenseNo', e.target.value)}
                    placeholder="जैसे: PL-JH-2024-88"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: DOCUMENT UPLOADER */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="p-1.5 rounded-lg bg-teal-100 text-teal-800 text-xs">📎</span> 4. आवश्यक दस्तावेज अपलोड (Required Document Upload)
              </h2>

              <p className="text-xs text-slate-500">
                SOP एवं सरकारी नियमानुसार निम्नलिखित दस्तावेजों की फोटो/स्कैन कॉपी अपलोड करें:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DocumentUploader
                  label="1. आवेदक का आधार कार्ड (Aadhaar Card Photo) *"
                  documentKey="aadhaarCard"
                  uploadedData={formData.documents.aadhaarCard}
                  onUpload={(docObj) => handleDocumentUpload('aadhaarCard', docObj)}
                  onRemove={() => handleDocumentRemove('aadhaarCard')}
                />

                <DocumentUploader
                  label="2. भवन स्वामित्व / संपत्ति कर रसीद (Property Tax / Registry Document) *"
                  documentKey="propertyReceipt"
                  uploadedData={formData.documents.propertyReceipt}
                  onUpload={(docObj) => handleDocumentUpload('propertyReceipt', docObj)}
                  onRemove={() => handleDocumentRemove('propertyReceipt')}
                />

                <DocumentUploader
                  label="3. नोटरी शपथ पत्र (Notarized Affidavit on Stamp Paper) *"
                  documentKey="affidavitDoc"
                  uploadedData={formData.documents.affidavitDoc}
                  onUpload={(docObj) => handleDocumentUpload('affidavitDoc', docObj)}
                  onRemove={() => handleDocumentRemove('affidavitDoc')}
                />

                <DocumentUploader
                  label="4. आवेदक का पासपोर्ट साइज फोटो (Applicant Photo) *"
                  documentKey="applicantPhoto"
                  uploadedData={formData.documents.applicantPhoto}
                  onUpload={(docObj) => handleDocumentUpload('applicantPhoto', docObj)}
                  onRemove={() => handleDocumentRemove('applicantPhoto')}
                />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading}
                className="w-full sm:w-auto btn btn-secondary py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                प्रारूप सहेजें (Save Draft)
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto btn btn-primary bg-gradient-to-r from-teal-700 to-emerald-700 py-3.5 px-8 text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-teal-700/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      जमा हो रहा है...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {formData.id && formData.status === 'Correction Requested' ? 'आवेदन पुनः प्रस्तुत करें' : 'आवेदन प्रस्तुत करें (Submit Application)'}
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        )}

        {/* TAB 2: TRACK APPLICATIONS */}
        {activeTab === 'track' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">आपके जल कनेक्शन आवेदन</h2>
                <p className="text-xs text-slate-500">सभी जमा एवं सहेजे गए आवेदनों की वर्तमान स्थिति और पावती पत्र</p>
              </div>
              <button onClick={loadApplications} className="btn btn-secondary btn-sm flex items-center gap-1.5">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> रिफ्रेश
              </button>
            </div>

            {loading ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-sm">
                <RefreshCw className="animate-spin w-8 h-8 text-teal-600 mx-auto mb-2" />
                <p className="text-slate-500 text-xs font-semibold">आवेदन लोड हो रहे हैं...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-3xl p-8 space-y-3">
                <Droplet className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-slate-700 font-bold text-sm">कोई आवेदन नहीं पाया गया</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">आपने अभी तक कोई नल कनेक्शन आवेदन जमा नहीं किया है। नया आवेदन भरने के लिए नीचे बटन पर क्लिक करें।</p>
                <button
                  onClick={() => setActiveTab('apply')}
                  className="btn btn-primary btn-sm bg-teal-700"
                >
                  नया आवेदन भरें
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 hover:border-teal-200 transition-all">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-xs font-bold text-teal-900 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                            {app.applicationNo || 'DRAFT'}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusChip(app.status)}`}>
                            {app.status}
                          </span>
                        </div>
                        <h3 className="text-slate-900 font-extrabold text-sm sm:text-base">
                          आवेदक: {app.applicantDetails?.fullName || 'N/A'} (भवन क्र. {app.propertyDetails?.houseNo || 'N/A'}, वार्ड {app.applicantDetails?.wardNo || 'N/A'})
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          कनेक्शन साइज: {app.propertyDetails?.connectionSize} | मोबाइल: {app.applicantDetails?.mobile} | आवेदन तिथि: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('hi-IN') : 'Draft'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => { setSelectedApp(app); setShowLetterModal(true); }}
                          className="btn btn-secondary btn-sm flex items-center gap-1 font-bold text-teal-900 bg-teal-50 hover:bg-teal-100 border-teal-200 text-xs"
                        >
                          <Printer className="w-3.5 h-3.5 text-teal-700" /> पावती पत्र (Letter)
                        </button>

                        {(app.status === 'Approved' || app.status === 'Sanctioned' || app.status === 'Completed') && (
                          <button
                            onClick={() => { setSelectedApp(app); setShowCertModal(true); }}
                            className="btn btn-primary btn-sm bg-teal-700 font-bold text-xs"
                          >
                            📜 स्वीकृति पत्र (Permit)
                          </button>
                        )}

                        {app.status === 'Correction Requested' && (
                          <button
                            onClick={() => handleEditForResubmit(app)}
                            className="btn btn-secondary btn-sm bg-amber-50 text-amber-800 border-amber-300 font-bold text-xs"
                          >
                            ✏️ सुधारें व पुनः प्रस्तुत करें
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="pt-3 border-t border-slate-100">
                      <ApplicationTimeline timeline={app.timeline || []} currentStatus={app.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DOCUMENT CHECKLIST */}
        {activeTab === 'checklist' && (
          <DocumentChecklist defaultCategory="water" />
        )}

      </main>

      {/* Pawati Application Letter Modal */}
      {showLetterModal && selectedApp && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 my-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-slate-900 font-extrabold text-base flex items-center gap-2">
                📄 भौतिक पावती पत्र (Official Physical Submission Letter)
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn btn-primary btn-sm flex items-center gap-1 font-bold text-xs bg-teal-700"
                >
                  <Printer className="w-3.5 h-3.5" /> प्रिंट / PDF डाउनलोड
                </button>
                <button onClick={() => setShowLetterModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <ApplicationLetterTemplate record={selectedApp} serviceType="water_connection" />
          </div>
        </div>
      )}

      {/* Approved Permit Certificate Modal */}
      {showCertModal && selectedApp && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 my-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-slate-900 font-extrabold text-base flex items-center gap-2">
                📜 नल कनेक्शन स्वीकृत आदेश (Sanction Permit Certificate)
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn btn-primary btn-sm flex items-center gap-1 font-bold text-xs bg-teal-700"
                >
                  <Printer className="w-3.5 h-3.5" /> प्रिंट / PDF डाउनलोड
                </button>
                <button onClick={() => setShowCertModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <WaterConnectionTemplate record={selectedApp} />
          </div>
        </div>
      )}

    </div>
  );
}

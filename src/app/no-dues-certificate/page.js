'use client';

import React, { useState, useEffect } from 'react';
import ServiceHeader from '../../components/ServiceHeader';
import NoDuesCertificateTemplate from '../../components/NoDuesCertificateTemplate';
import NoDuesLetterTemplate from '../../components/NoDuesLetterTemplate';
import DocumentChecklist from '../../components/DocumentChecklist';
import FastReceiptUpload from '../../components/FastReceiptUpload';
import { 
  submitNoDuesCertificate, 
  getNoDuesCertificates 
} from '../../services/noDuesService';
import { getCurrentCitizen, loginWithGoogle, createOrUpdateLocalCitizenProfile, subscribeToCitizenAuth } from '../../services/citizenAuthService';
import toast from 'react-hot-toast';
import { downloadBlobFile } from '../../utils/fileStorage';
import { 
  FileText, Activity, CheckCircle2, AlertCircle, RefreshCw, Printer, X, History, Plus, 
  Download, Building2, UploadCloud, Info, ShieldCheck, CheckSquare, Search, Phone
} from 'lucide-react';

const INITIAL_FORM = {
  applicantDetails: {
    fullName: '',
    fatherHusbandName: '',
    mobile: '',
    email: '',
    aadhaarNo: '',
    wardNo: '6',
    address: '11, चन्द्रशेखर आजाद मार्ग/TTOGB-Ward-6, Ward-6, Zone-1, झाबुआ, 457661'
  },
  propertyDetails: {
    propertyId: '7001662737',
    propertyNo: '7001662737',
    wardNo: '6',
    zoneNo: '1',
    plotArea: '900',
    builtupArea: '900.0',
    openArea: '0.0',
    address: '11, चन्द्रशेखर आजाद मार्ग/TTOGB-Ward-6, Ward-6, Zone-1, झाबुआ, 457661',
    pincode: '457661'
  },
  taxDetails: {
    financialYear: '2026-27',
    triRefNo: 'PC-0179-03-6-1-00117',
    paymentDate: new Date().toISOString().split('T')[0],
    amountPaid: '7098.00'
  },
  documents: {
    taxReceipt: null,
    aadhaarCard: null,
    propertyDocument: null
  }
};

export default function NoDuesCertificatePage() {
  const [activeTab, setActiveTab] = useState('apply');
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);

  useEffect(() => {
    const unsubAuth = subscribeToCitizenAuth((user) => {
      if (user) {
        setFormData(prev => ({
          ...prev,
          applicantDetails: {
            ...prev.applicantDetails,
            fullName: prev.applicantDetails.fullName || user.displayName || '',
            email: prev.applicantDetails.email || (user.email?.includes('@jhabuanagarpalika.local') ? '' : (user.email || '')),
            mobile: prev.applicantDetails.mobile || user.mobile || ''
          }
        }));
        loadApplications(user.email);
      } else {
        loadApplications();
      }
    });

    return () => unsubAuth();
  }, []);

  const loadApplications = async (overrideEmail = null) => {
    setLoading(true);
    try {
      const citizen = getCurrentCitizen();
      const target = overrideEmail || citizen?.email;
      const data = await getNoDuesCertificates(target, false);
      setApplications(data);
    } catch (e) {
      console.warn('Error loading applications:', e);
    } finally {
      setLoading(false);
    }
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

  const handleFileUpload = (docKey, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docKey]: {
            name: file.name,
            data: e.target.result,
            uploadedAt: new Date().toISOString()
          }
        }
      }));
      toast.success(`दस्तावेज '${file.name}' सफलतापूर्वक अपलोड हुआ!`);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyFastData = (extractedData) => {
    if (!extractedData) return;
    setFormData(prev => ({
      ...prev,
      applicantDetails: {
        ...prev.applicantDetails,
        ...(extractedData.applicantDetails || {})
      },
      propertyDetails: {
        ...prev.propertyDetails,
        ...(extractedData.propertyDetails || {})
      },
      taxDetails: {
        ...prev.taxDetails,
        ...(extractedData.taxDetails || {})
      },
      documents: {
        ...prev.documents,
        taxReceipt: extractedData.fileData ? {
          name: extractedData.fileName || 'Property_Tax_Receipt_Auto.pdf',
          data: extractedData.fileData,
          uploadedAt: new Date().toISOString()
        } : (prev.documents.taxReceipt || {
          name: 'Jhabua_Property_Tax_Receipt_PC-0179.pdf',
          data: 'data:application/pdf;base64,JVBERi0xLjQ...',
          uploadedAt: new Date().toISOString()
        })
      }
    }));
    toast.success('⚡ रसीद के सभी विवरण (नाम, ID, राशि, TRI Ref) फॉर्म में स्वतः भर गए हैं!');
  };

  const validateForm = () => {
    const errors = [];
    const app = formData.applicantDetails;
    const prop = formData.propertyDetails;
    const tax = formData.taxDetails;

    if (!app.fullName?.trim()) errors.push('आवेदक का नाम आवश्यक है');
    if (!app.fatherHusbandName?.trim()) errors.push('पिता/पति का नाम आवश्यक है');
    if (!app.mobile?.trim() || app.mobile.length < 10) errors.push('10 अंकों का वैध मोबाइल नंबर आवश्यक है');
    if (!prop.propertyId?.trim()) errors.push('संपत्ति क्रमांक / प्रॉपर्टी आईडी आवश्यक है');
    if (!tax.triRefNo?.trim()) errors.push('कर भुगतान टी.आर.आई./रिफरेंस नंबर आवश्यक है');
    if (!tax.amountPaid || parseFloat(tax.amountPaid) <= 0) errors.push('जमा कर राशि दर्ज करें');
    
    if (!formData.documents.taxReceipt) {
      errors.push('अद्यतन संपत्ति कर भुगतान रसीद अपलोड करना अनिवार्य है (Current Tax Receipt Upload Mandatory)');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      toast.error(errors[0]);
      setMessage({ type: 'error', text: errors.join(', ') });
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    let citizen = getCurrentCitizen();
    if (!citizen) {
      toast.loading('🔐 नागरिक डेटा ट्रैकिंग हेतु गूगल साइन-इन प्रारम्भ किया जा रहा है...', { id: 'g-auth' });
      const authRes = await loginWithGoogle();
      toast.dismiss('g-auth');
      if (authRes.success) {
        citizen = authRes.user;
        toast.success(`नमस्ते ${citizen.displayName}! गूगल अकाउंट सफलतापूर्वक जुड़ गया।`);
      } else {
        citizen = createOrUpdateLocalCitizenProfile(formData.applicantDetails || {});
        toast.success('स्थानीय नागरिक प्रोफ़ाइल के साथ आवेदन जमा किया जा रहा है...');
      }
    }

    setMessage(null);
    const payloadToSubmit = {
      ...formData
    };
    const res = await submitNoDuesCertificate(payloadToSubmit, formData.id);
    setLoading(false);

    if (res.success) {
      toast.success(`सफलतापूर्वक जमा! आवेदन क्र: ${res.applicationNo}`);
      setMessage({
        type: 'success',
        text: `आपका नो ड्यूज प्रमाण पत्र (No Dues NOC) आवेदन सफलतापूर्वक जमा हो गया है! आवेदन क्रमांक: ${res.applicationNo}। यह 100% डिजिटल सेवा है — कार्यालय में भौतिक प्रति (Hard Copy) जमा करना अनिवार्य नहीं है।`
      });
      setFormData(INITIAL_FORM);
      loadApplications();
      setActiveTab('my-applications');
    } else {
      toast.error(res.error || 'आवेदन जमा करने में विफलता');
      setMessage({ type: 'error', text: res.error || 'आवेदन जमा करने में विफलता' });
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Approved':
      case 'Certificate Generated':
      case 'Completed':
      case 'Sanctioned':
        return 'bg-emerald-600 text-white font-extrabold shadow-2xs border border-emerald-700';
      case 'Rejected':
        return 'bg-rose-600 text-white font-extrabold shadow-2xs border border-rose-700';
      case 'Correction Requested':
        return 'bg-amber-500 text-slate-950 font-extrabold shadow-2xs border border-amber-600';
      case 'Under Review':
        return 'bg-purple-600 text-white font-extrabold shadow-2xs border border-purple-700';
      case 'Submitted':
        return 'bg-sky-600 text-white font-extrabold shadow-2xs border border-sky-700';
      default:
        return 'bg-slate-700 text-white font-extrabold shadow-2xs border border-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      <ServiceHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* HERO BANNER */}
        <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-3">
              <img 
                src="/mp-logo.png" 
                alt="मध्य प्रदेश शासन" 
                className="w-14 h-14 object-contain drop-shadow shrink-0" 
              />
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-emerald-200 border border-white/15 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                मध्य प्रदेश शासन — नगर पालिका परिषद झाबुआ
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              नो ड्यूज प्रमाण पत्र (Property Tax NOC) ऑनलाइन आवेदन
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-3xl leading-relaxed">
              ई-सेवा पोर्टल संपत्ति कर नो ड्यूज ऑनलाइन आवेदन करें, वर्तमान वित्तीय वर्ष कर भुगतान रसीद अपलोड करें एवं 1 से 3 दिनों में डिजिटल सत्यापन उपरांत हस्ताक्षरित प्रमाण पत्र प्राप्त करें। <strong className="text-emerald-300 font-extrabold">(नोट: नगर पालिका कार्यालय में भौतिक प्रति / Hard Copy जमा करना अनिवार्य नहीं है)।</strong>
            </p>
          </div>
        </div>

        {/* TOP CONTACT CARDS */}
        <div className="bg-white border border-emerald-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2.5">
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs">📞</span> संपत्ति कर नो ड्यूज विभागीय संपर्क सूत्र (Official Department Contact)
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              नगर पालिका परिषद झाबुआ (म.प्र.)
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">संपत्ति कर विभाग नोडल अधिकारी</span>
                <span className="font-extrabold text-slate-900 text-sm">राजस्व निरीक्षक / CMO Office</span>
              </div>
              <a href="tel:9713175838" className="font-mono font-extrabold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl border border-emerald-300 text-xs transition">
                📞 9713175838
              </a>
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">रसीद सत्यापन समय सीमा</span>
                <span className="font-extrabold text-slate-900 text-sm">न्यूनतम 1 दिन — अधिकतम 3 दिन</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                ⏱️ 1-3 कार्यदिवस
              </span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-950 font-bold flex items-center gap-2">
            <span className="text-base">⚡</span>
            <span>100% ऑनलाइन/डिजिटल सेवा: नो ड्यूज (Property Tax NOC) हेतु नगर पालिका कार्यालय में भौतिक आवेदन (Hard Copy) जमा करना अनिवार्य नहीं है।</span>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center justify-between flex-wrap gap-4 overflow-x-auto pb-1">
          <div className="flex gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-inner max-w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab('apply')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 ${
                activeTab === 'apply'
                  ? 'bg-white text-emerald-950 shadow-sm border border-emerald-200/80 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>नया नो ड्यूज आवेदन (New NOC Apply)</span>
            </button>

            <button
              onClick={() => { setActiveTab('my-applications'); loadApplications(); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 ${
                activeTab === 'my-applications'
                  ? 'bg-white text-emerald-950 shadow-sm border border-emerald-200/80 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-700" />
              <span>मेरे आवेदन एवं स्थिति ({applications.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 ${
                activeTab === 'checklist'
                  ? 'bg-white text-emerald-950 shadow-sm border border-emerald-200/80 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-emerald-700" />
              <span>नियम व चेकलिस्ट (Checklist)</span>
            </button>
          </div>
        </div>

        {/* TAB 1: APPLICATION FORM */}
        {activeTab === 'apply' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {message && (
              <div className={`p-4 rounded-2xl border text-xs font-bold ${
                message.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* FAST RECEIPT UPLOAD & AUTO-EXTRACT HEADER */}
              <FastReceiptUpload onApplyData={handleApplyFastData} />

              {/* SECTION 1: APPLICANT DETAILS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span>👤</span> 1. आवेदक का विवरण (Applicant Information)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">आवेदक का नाम (Full Name) *</label>
                    <input
                      type="text"
                      required
                      value={formData.applicantDetails.fullName}
                      onChange={e => handleInputChange('applicantDetails', 'fullName', e.target.value)}
                      placeholder="अनिल कुमार"
                      className="w-full border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">पिता / पति का नाम (Father/Husband Name) *</label>
                    <input
                      type="text"
                      required
                      value={formData.applicantDetails.fatherHusbandName}
                      onChange={e => handleInputChange('applicantDetails', 'fatherHusbandName', e.target.value)}
                      placeholder="बाबू लाल"
                      className="w-full border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">मोबाइल नंबर (Mobile No) *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={formData.applicantDetails.mobile}
                      onChange={e => handleInputChange('applicantDetails', 'mobile', e.target.value)}
                      placeholder="98260XXXXX"
                      className="w-full border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ईमेल पता (Email Address)</label>
                    <input
                      type="email"
                      value={formData.applicantDetails.email}
                      onChange={e => handleInputChange('applicantDetails', 'email', e.target.value)}
                      placeholder="citizen@example.com"
                      className="w-full border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">आधार नंबर (12 Digits Aadhaar)</label>
                    <input
                      type="text"
                      maxLength={14}
                      value={formData.applicantDetails.aadhaarNo}
                      onChange={e => handleInputChange('applicantDetails', 'aadhaarNo', e.target.value)}
                      placeholder="XXXX-XXXX-XXXX"
                      className="w-full border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">वार्ड नंबर (Ward No)</label>
                    <select
                      value={formData.applicantDetails.wardNo}
                      onChange={e => handleInputChange('applicantDetails', 'wardNo', e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-600"
                    >
                      {Array.from({ length: 18 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1)}>वार्ड क्रमांक {i + 1}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PROPERTY DETAILS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span>🏢</span> 2. संपत्ति का विवरण (Property Details)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">संपत्ति क्रमांक / प्रॉपर्टी आईडी (Property ID) *</label>
                    <input
                      type="text"
                      required
                      value={formData.propertyDetails.propertyId}
                      onChange={e => handleInputChange('propertyDetails', 'propertyId', e.target.value)}
                      placeholder="7001662737"
                      className="w-full border border-slate-300 rounded-xl p-2.5 font-bold font-mono text-emerald-950 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">कुल प्लॉट क्षेत्रफल (Plot Area sq.ft) *</label>
                    <input
                      type="text"
                      required
                      value={formData.propertyDetails.plotArea}
                      onChange={e => handleInputChange('propertyDetails', 'plotArea', e.target.value)}
                      placeholder="900"
                      className="w-full border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">बिल्ट-अप एरिया (Built-up Area sq.ft) *</label>
                    <input
                      type="text"
                      required
                      value={formData.propertyDetails.builtupArea}
                      onChange={e => handleInputChange('propertyDetails', 'builtupArea', e.target.value)}
                      placeholder="900.0"
                      className="w-full border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ओपन एरिया (Open Area sq.ft)</label>
                    <input
                      type="text"
                      value={formData.propertyDetails.openArea}
                      onChange={e => handleInputChange('propertyDetails', 'openArea', e.target.value)}
                      placeholder="0.0"
                      className="w-full border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ज़ोन नंबर (Zone No)</label>
                    <input
                      type="text"
                      value={formData.propertyDetails.zoneNo}
                      onChange={e => handleInputChange('propertyDetails', 'zoneNo', e.target.value)}
                      placeholder="Zone-1"
                      className="w-full border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block font-bold text-slate-700 mb-1">संपत्ति का पूर्ण पता (Full Property Address)</label>
                    <input
                      type="text"
                      value={formData.propertyDetails.address}
                      onChange={e => handleInputChange('propertyDetails', 'address', e.target.value)}
                      placeholder="11, चन्द्रशेखर आजाद मार्ग/TTOGB-Ward-6, Ward-6, Zone-1, झाबुआ, 457661"
                      className="w-full border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: TAX PAYMENT DETAILS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span>💰</span> 3. कर भुगतान एवं रिफरेंस विवरण (Tax Payment Reference)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">कर वर्ष (Financial Year) *</label>
                    <select
                      value={formData.taxDetails.financialYear}
                      onChange={e => handleInputChange('taxDetails', 'financialYear', e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 font-bold focus:outline-none focus:border-emerald-600"
                    >
                      <option value="2026-27">2026-27 (वर्तमान वर्ष)</option>
                      <option value="2025-26">2025-26</option>
                      <option value="2024-25">2024-25</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">T.R.I. / रिफरेंस नंबर (TRI Reference No) *</label>
                    <input
                      type="text"
                      required
                      value={formData.taxDetails.triRefNo}
                      onChange={e => handleInputChange('taxDetails', 'triRefNo', e.target.value)}
                      placeholder="PC-0179-03-6-1-00117"
                      className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">भुगतान दिनांक (Payment Date) *</label>
                    <input
                      type="date"
                      required
                      value={formData.taxDetails.paymentDate}
                      onChange={e => handleInputChange('taxDetails', 'paymentDate', e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">जमा कुल कर राशि (Amount Paid ₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.taxDetails.amountPaid}
                      onChange={e => handleInputChange('taxDetails', 'amountPaid', e.target.value)}
                      placeholder="7098.00"
                      className="w-full border border-slate-300 rounded-xl p-2.5 font-extrabold text-emerald-950 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: MANDATORY DOCUMENT UPLOAD */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 space-y-4">
                <h3 className="font-extrabold text-sm text-emerald-950 uppercase tracking-wider flex items-center gap-2 border-b border-emerald-200 pb-2">
                  <span>📤</span> 4. दस्तावेज अपलोड (Current Year Property Tax Receipt Mandatory Upload) *
                </h3>
                <p className="text-xs text-slate-600">
                  वर्तमान वित्तीय वर्ष (2026-27) की चुकता संपत्ति कर रसीद अपलोड करना अनिवार्य है।
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  
                  {/* Tax Receipt (Mandatory) */}
                  <div className="bg-white p-4 rounded-xl border border-slate-300 space-y-2">
                    <label className="block font-extrabold text-slate-900">
                      📄 संपत्ति कर रसीद (Tax Receipt) *
                    </label>
                    <input
                      type="file"
                      required={!formData.documents.taxReceipt}
                      accept="application/pdf,image/*"
                      onChange={e => handleFileUpload('taxReceipt', e.target.files?.[0])}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
                    />
                    {formData.documents.taxReceipt && (
                      <span className="text-[11px] font-bold text-emerald-700 block">
                        ✅ फ़ाइल: {formData.documents.taxReceipt.name}
                      </span>
                    )}
                  </div>

                  {/* Applicant Aadhaar */}
                  <div className="bg-white p-4 rounded-xl border border-slate-300 space-y-2">
                    <label className="block font-bold text-slate-900">
                      🆔 आवेदक आधार कार्ड (Optional)
                    </label>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={e => handleFileUpload('aadhaarCard', e.target.files?.[0])}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-800 cursor-pointer"
                    />
                    {formData.documents.aadhaarCard && (
                      <span className="text-[11px] font-bold text-emerald-700 block">
                        ✅ फ़ाइल: {formData.documents.aadhaarCard.name}
                      </span>
                    )}
                  </div>

                  {/* Property Document */}
                  <div className="bg-white p-4 rounded-xl border border-slate-300 space-y-2">
                    <label className="block font-bold text-slate-900">
                      🏠 संपत्ति नामांतरण / रजिस्ट्री (Optional)
                    </label>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={e => handleFileUpload('propertyDocument', e.target.files?.[0])}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-800 cursor-pointer"
                    />
                    {formData.documents.propertyDocument && (
                      <span className="text-[11px] font-bold text-emerald-700 block">
                        ✅ फ़ाइल: {formData.documents.propertyDocument.name}
                      </span>
                    )}
                  </div>

                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm px-8 py-3.5 rounded-2xl shadow-xl transition-all"
                >
                  {loading ? 'जमा हो रहा है...' : '📝 नो ड्यूज प्रमाण पत्र हेतु आवेदन प्रस्तुत करें'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 2: MY APPLICATIONS */}
        {activeTab === 'my-applications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">आपके नो ड्यूज (Property Tax NOC) आवेदन</h2>
              <button onClick={loadApplications} className="btn btn-secondary btn-sm flex items-center gap-1.5">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> ताज़ा करें
              </button>
            </div>

            {loading ? (
              <div className="text-center py-16 bg-white rounded-3xl">
                <RefreshCw className="animate-spin w-8 h-8 text-emerald-700 mx-auto mb-2" />
                <p className="text-slate-500 text-xs font-semibold">आवेदन लोड हो रहे हैं...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-16 bg-slate-800/60 rounded-3xl p-8 space-y-3 border border-slate-700">
                <Building2 className="w-12 h-12 text-slate-500 mx-auto" />
                <h3 className="text-slate-200 font-bold text-sm">कोई आवेदन नहीं पाया गया</h3>
                <p className="text-xs text-slate-400">आपने अभी तक कोई नो ड्यूज NOC आवेदन प्रस्तुत नहीं किया है।</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app, index) => (
                  <div key={app.id} className="bg-white text-slate-900 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 border border-slate-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-mono font-extrabold text-slate-900 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                            #{index + 1}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300">
                            📅 {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('hi-IN') : 'Draft'}
                          </span>
                          <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
                            {app.applicationNo}
                          </span>
                        </div>
                        <h3 className="font-black text-slate-950 text-base mt-1">
                          {app.applicantDetails?.fullName} (संपत्ति क्र: {app.propertyDetails?.propertyId})
                        </h3>
                        <p className="text-xs text-slate-500">
                          टी.आर.आई. रिफरेंस: {app.taxDetails?.triRefNo} | संपत्ति कर: ₹{app.taxDetails?.amountPaid}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getStatusChip(app.status)}`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <button
                        onClick={() => { setSelectedApp(app); setShowLetterModal(true); }}
                        className="btn btn-secondary btn-sm flex items-center gap-1 font-bold text-xs bg-slate-100"
                      >
                        <Printer className="w-3.5 h-3.5" /> 🖨️ आवेदन पत्र देखें (Letter)
                      </button>

                      {app.officialUploadedCertificate ? (
                        <button
                          type="button"
                          onClick={() => downloadBlobFile(app.officialUploadedCertificate, 'Official_Signed_No_Dues_NOC.pdf')}
                          className="btn btn-primary btn-sm bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 shadow-md cursor-pointer transition-all"
                        >
                          <Download className="w-3.5 h-3.5" /> 📜 अधिकारी हस्ताक्षरित NOC डाउनलोड
                        </button>
                      ) : (
                        (app.status === 'Approved' || app.status === 'Sanctioned' || app.status === 'Completed') && (
                          <button
                            onClick={() => { setSelectedApp(app); setShowCertModal(true); }}
                            className="btn btn-primary btn-sm bg-emerald-700 text-white font-bold text-xs"
                          >
                            📜 नो ड्यूज प्रमाण पत्र डाउनलोड
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CHECKLIST */}
        {activeTab === 'checklist' && (
          <DocumentChecklist defaultCategory="water" />
        )}

        {/* CERTIFICATE PREVIEW MODAL */}
        {selectedApp && showCertModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 overflow-y-auto p-4 flex items-center justify-center pt-8">
            <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
                <h3 className="font-extrabold text-slate-900 text-sm">📜 नो ड्यूज प्रमाण पत्र (No Dues Certificate Preview)</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.print()} className="btn btn-primary btn-sm text-xs font-bold"><Printer className="w-3.5 h-3.5" /> प्रिंट / PDF</button>
                  <button onClick={() => { setShowCertModal(false); setSelectedApp(null); }} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"><X className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="overflow-y-auto flex-1 pr-1">
                <NoDuesCertificateTemplate record={selectedApp} />
              </div>
            </div>
          </div>
        )}

        {/* APPLICATION LETTER MODAL */}
        {selectedApp && showLetterModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 overflow-y-auto p-4 flex items-center justify-center pt-8">
            <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
                <h3 className="font-extrabold text-slate-900 text-sm">📄 नो ड्यूज आवेदन पत्र (Application Submission Letter)</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.print()} className="btn btn-primary btn-sm text-xs font-bold"><Printer className="w-3.5 h-3.5" /> प्रिंट / PDF</button>
                  <button onClick={() => { setShowLetterModal(false); setSelectedApp(null); }} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"><X className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="overflow-y-auto flex-1 pr-1">
                <NoDuesLetterTemplate record={selectedApp} />
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

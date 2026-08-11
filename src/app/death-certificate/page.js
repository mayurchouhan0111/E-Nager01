'use client';

import React, { useState, useEffect } from 'react';
import ServiceHeader from '../../components/ServiceHeader';
import ApplicationTimeline from '../../components/ApplicationTimeline';
import DeathCertificateTemplate from '../../components/DeathCertificateTemplate';
import ApplicationLetterTemplate from '../../components/ApplicationLetterTemplate';
import DocumentUploader from '../../components/DocumentUploader';
import DocumentChecklist from '../../components/DocumentChecklist';
import { 
  saveDeathCertificateDraft, 
  submitDeathCertificate, 
  getDeathCertificates 
} from '../../services/deathCertificateService';
import { getCurrentCitizen, loginWithGoogle, createOrUpdateLocalCitizenProfile, subscribeToCitizenAuth } from '../../services/citizenAuthService';
import toast from 'react-hot-toast';
import { downloadBlobFile } from '../../utils/fileStorage';
import { validateDeathCertificateForm, navigateToFirstErrorField } from '../../utils/formValidationHelper';
import { 
  FileText, Activity, CheckCircle2, AlertCircle, RefreshCw, Printer, X, History, Plus, 
  Building2, User, Home, HeartPulse, CheckSquare, Download, ShieldAlert, ListChecks 
} from 'lucide-react';

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [selectedApp, setSelectedApp] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [showOfficialDocModal, setShowOfficialDocModal] = useState(false);
  const [dpdpConsent, setDpdpConsent] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    applicationNo: '',
    status: 'Draft',
    deceasedDetails: { ...defaultDeceasedDetails },
    applicantDetails: { ...defaultApplicantDetails },
    parentSpouseDetails: { ...defaultParentSpouseDetails },
    statisticalDetails: { ...defaultStatisticalDetails },
    documents: {
      deceasedAadhaar: null,
      applicantAadhaar: null,
      samagraId: null,
      cremationReceipt: null,
      panchnamaLetter: null,
      hospitalDeathSlip: null,
      addressProof: null
    }
  });

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

    const handleFocus = () => loadApplications();
    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);

    return () => {
      unsubAuth();
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  useEffect(() => {
    if (selectedApp) {
      const updated = applications.find(a => a.id === selectedApp.id || (a.applicationNo && a.applicationNo === selectedApp.applicationNo));
      if (updated && (updated.status !== selectedApp.status || updated.timeline?.length !== selectedApp.timeline?.length)) {
        setSelectedApp(updated);
      }
    }
  }, [applications, selectedApp]);

  const loadApplications = async (overrideEmail = null) => {
    setLoading(true);
    const citizen = getCurrentCitizen();
    const target = overrideEmail || citizen?.email;
    const data = await getDeathCertificates(target);
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

  const handleDocumentUpload = (docKey, uploadObj) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...(typeof prev.documents === 'object' && !Array.isArray(prev.documents) ? prev.documents : {}),
        [docKey]: uploadObj
      }
    }));
  };

  const handleDocumentRemove = (docKey) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...(typeof prev.documents === 'object' && !Array.isArray(prev.documents) ? prev.documents : {}),
        [docKey]: null
      }
    }));
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

    // 9. DPDP Act 2023 Mandatory Consent Validation
    if (!dpdpConsent) {
      errors.push('आपको DPDP Act 2023 के तहत डेटा प्राइवेसी सहमति देना अनिवार्य है (Mandatory DPDP consent required)');
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
    const { fieldErrors: errs, errorList } = validateDeathCertificateForm(formData, dpdpConsent);
    if (errorList.length > 0) {
      setFieldErrors(errs);
      setFormErrors(errorList);
      setMessage({ type: 'error', text: `⚠️ फॉर्म में ${errorList.length} आवश्यक जानकारी छूटी है। स्वतः उस स्थान पर ले जाया जा रहा है...` });
      navigateToFirstErrorField(errs);
      return;
    }

    // Citizen Profile Identification (Google Auth with fallback to Local Profile)
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

    setFieldErrors({});
    setFormErrors([]);
    setLoading(true);
    setMessage(null);
    const payload = preparePayload();
    const res = await submitDeathCertificate(payload, formData.id);
    setLoading(false);

    if (res.success) {
      setMessage({ type: 'success', text: `आवेदन जमा हो गया है (Application submitted! App No: ${res.applicationNo})` });
      
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
      },
      documents: app.documents || { deceasedAadhaar: null, applicantAadhaar: null, samagraId: null, cremationReceipt: null, panchnamaLetter: null, hospitalDeathSlip: null, addressProof: null }
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
      documents: {
        deceasedAadhaar: null,
        applicantAadhaar: null,
        samagraId: null,
        cremationReceipt: null,
        panchnamaLetter: null,
        hospitalDeathSlip: null,
        addressProof: null
      }
    });
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

  const isFemaleAge15to49 = () => {
    const gender = formData.deceasedDetails.gender || '';
    const age = Number(formData.deceasedDetails.age);
    return (gender.includes('महिला') || gender.toLowerCase().includes('female')) && age >= 15 && age <= 49;
  };

  const getDoc = (key) => {
    if (!formData.documents) return null;
    if (Array.isArray(formData.documents)) return null;
    return formData.documents[key] || null;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      <ServiceHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Banner */}
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
              मृतक प्रमाण पत्र ऑनलाइन आवेदन
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-3xl leading-relaxed">
              नगर पालिका परिषद झाबुआ (म.प्र.) | जन्म और मृत्यु पंजीकरण अधिनियम, 1969 के अंतर्गत पूर्ण शासकीय मृत्यु पंजीकरण फॉर्म। ऑनलाइन आवेदन करें, स्थिति ट्रैक करें, पावती पत्र डाउनलोड करें एवं स्वीकृत प्रमाण पत्र प्राप्त करें।
            </p>
          </div>
        </div>

        {/* Official Officer Contact Card */}
        <div className="bg-white border border-emerald-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2.5">
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs">📞</span> मृत्यु प्रमाण पत्र आधिकारिक विभागीय संपर्क सूत्र (Official Department Contacts)
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              नगर पालिका परिषद झाबुआ (म.प्र.)
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">मुख्य नगर पालिका अधिकारी (नोडल प्रशासक)</span>
                <span className="font-extrabold text-slate-900 text-sm">CMO Office / Nodal Administrator</span>
              </div>
              <a href="tel:9713175838" className="font-mono font-extrabold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl border border-emerald-300 text-xs transition">
                📞 9713175838
              </a>
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">जन्म एवं मृत्यु पंजीयन प्रभारी अधिकारी</span>
                <span className="font-extrabold text-slate-900 text-sm">श्री अरविंद बुंदेला</span>
              </div>
              <a href="tel:9993177917" className="font-mono font-extrabold text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-xl border border-blue-300 text-xs transition">
                📞 9993177917
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
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
              <span>{formData.id ? 'आवेदन संपादित करें / पुन: प्रस्तुत करें' : 'नया ऑनलाइन आवेदन दर्ज करें'}</span>
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 ${
                activeTab === 'track'
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
              <ListChecks className="w-4 h-4 text-emerald-700" />
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
                    id="field_deceased_fullName"
                    type="text"
                    required
                    value={formData.deceasedDetails.fullName}
                    onChange={(e) => {
                      handleInputChange('deceasedDetails', 'fullName', e.target.value);
                      if (fieldErrors['deceasedDetails.fullName']) {
                        setFieldErrors(prev => ({ ...prev, 'deceasedDetails.fullName': null }));
                      }
                    }}
                    placeholder="जैसे: स्व. रामेश्वर प्रसाद शर्मा"
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none font-medium transition-all ${
                      fieldErrors['deceasedDetails.fullName']
                        ? 'border-red-500 bg-red-50/40 ring-2 ring-red-300'
                        : 'border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20'
                    }`}
                  />
                  {fieldErrors['deceasedDetails.fullName'] && (
                    <p className="mt-1.5 text-[11px] font-bold text-red-600 flex items-center gap-1 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      {fieldErrors['deceasedDetails.fullName'].message}
                    </p>
                  )}
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
                    id="field_deceased_dateOfDeath"
                    type="date"
                    required
                    value={formData.deceasedDetails.dateOfDeath}
                    onChange={(e) => {
                      handleInputChange('deceasedDetails', 'dateOfDeath', e.target.value);
                      if (fieldErrors['deceasedDetails.dateOfDeath']) {
                        setFieldErrors(prev => ({ ...prev, 'deceasedDetails.dateOfDeath': null }));
                      }
                    }}
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none font-medium transition-all ${
                      fieldErrors['deceasedDetails.dateOfDeath']
                        ? 'border-red-500 bg-red-50/40 ring-2 ring-red-300'
                        : 'border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20'
                    }`}
                  />
                  {fieldErrors['deceasedDetails.dateOfDeath'] && (
                    <p className="mt-1.5 text-[11px] font-bold text-red-600 flex items-center gap-1 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      {fieldErrors['deceasedDetails.dateOfDeath'].message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">मृत्यु के समय आयु (वर्षों में)</label>
                  <input
                    id="field_deceased_age"
                    type="number"
                    min="0"
                    max="120"
                    value={formData.deceasedDetails.age}
                    onChange={(e) => {
                      handleInputChange('deceasedDetails', 'age', e.target.value);
                      if (fieldErrors['deceasedDetails.age']) {
                        setFieldErrors(prev => ({ ...prev, 'deceasedDetails.age': null }));
                      }
                    }}
                    placeholder="65"
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none font-medium transition-all ${
                      fieldErrors['deceasedDetails.age']
                        ? 'border-red-500 bg-red-50/40 ring-2 ring-red-300'
                        : 'border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20'
                    }`}
                  />
                  {fieldErrors['deceasedDetails.age'] && (
                    <p className="mt-1.5 text-[11px] font-bold text-red-600 flex items-center gap-1 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      {fieldErrors['deceasedDetails.age'].message}
                    </p>
                  )}
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
                    name="fatherHusbandName"
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
                    name="motherName"
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
                    name="informantName"
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
                    name="informantRelation"
                    value={formData.applicantDetails.relationWithDeceased}
                    onChange={(e) => handleInputChange('applicantDetails', 'relationWithDeceased', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                  >
                    <option value="पुत्र/पुत्री">पुत्र/पुत्री (Son/Daughter)</option>
                    <option value="पति/पत्नी">पति/पत्नी (Spouse)</option>
                    <option value="माता/पिता">माता/पिता (Parent)</option>
                    <option value="भाई/बहन">भाई/बहन (Sibling)</option>
                    <option value="अन्य">अन्य (Other Rel)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">मोबाइल नंबर *</label>
                  <input
                    type="tel"
                    name="informantMobile"
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
              </div>
            </div>

            {/* SECTION 5: STATISTICAL & LIFESTYLE DETAILS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs">📊</span> 5. सांख्यिकी एवं मृत्यु का कारण (Statistical & Cause of Death Details)
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
              </div>
            </div>

            {/* SECTION 6: SUPPORTING DOCUMENT PHOTO UPLOADS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs">📎</span> 6. आवश्यक दस्तावेज फोटो अपलोड (Supporting Document Uploads)
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('checklist')}
                  className="text-xs text-emerald-800 font-bold hover:underline flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                >
                  📋 शासकीय दस्तावेज सूची देखें (View Official Checklist)
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                नगर पालिका परिषद झाबुआ के निर्देशानुसार, <strong>{formData.deceasedDetails.placeType}</strong> हेतु आवश्यक मूल दस्तावेजों की स्पष्ट फोटो या PDF फ़ाइल संलग्न करें।
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <DocumentUploader
                  title="1. मृतक का आधार कार्ड फोटो"
                  description="मृतक व्यक्ति का आधार कार्ड (स्पष्ट फोटो)"
                  required={true}
                  documentData={getDoc('deceasedAadhaar') || getDoc('deathSlip')}
                  onUpload={(doc) => handleDocumentUpload('deceasedAadhaar', doc)}
                  onRemove={() => handleDocumentRemove('deceasedAadhaar')}
                />

                <DocumentUploader
                  title="2. सूचनादाता / आवेदक का आधार कार्ड फोटो"
                  description="आवेदन करने वाले रिश्तेदार/सूचनादाता का आधार कार्ड"
                  required={true}
                  documentData={getDoc('applicantAadhaar')}
                  onUpload={(doc) => handleDocumentUpload('applicantAadhaar', doc)}
                  onRemove={() => handleDocumentRemove('applicantAadhaar')}
                />

                <DocumentUploader
                  title="3. मृतक की समग्र आई.डी. फोटोकॉपी"
                  description="मृतक सदस्य का नाम दर्ज समग्र परिवार आईडी"
                  required={true}
                  documentData={getDoc('samagraId')}
                  onUpload={(doc) => handleDocumentUpload('samagraId', doc)}
                  onRemove={() => handleDocumentRemove('samagraId')}
                />

                {formData.deceasedDetails.placeType.includes('घर') ? (
                  <>
                    <DocumentUploader
                      title="4. मुक्तिधाम / मुस्लिम पंचायत / चर्च रसीद"
                      description="अंतिम संस्कार/दाह संस्कार/दफन की जारी रसीद फोटोकॉपी"
                      required={true}
                      documentData={getDoc('cremationReceipt')}
                      onUpload={(doc) => handleDocumentUpload('cremationReceipt', doc)}
                      onRemove={() => handleDocumentRemove('cremationReceipt')}
                    />

                    <DocumentUploader
                      title="5. पंचनामा या वार्ड पार्षद प्रमाणित पत्र"
                      description="मृत्यु स्थल एवं दिनांक प्रमाणीकरण पत्र (पार्षद द्वारा प्रमाणित)"
                      required={true}
                      documentData={getDoc('panchnamaLetter')}
                      onUpload={(doc) => handleDocumentUpload('panchnamaLetter', doc)}
                      onRemove={() => handleDocumentRemove('panchnamaLetter')}
                    />
                  </>
                ) : (
                  <DocumentUploader
                    title="4. अस्पताल मृत्यु प्रमाण पत्र (Form 4/4A)"
                    description="अस्पताल द्वारा जारी मेडिकल डेथ सर्टिफिकेट / डिस्चार्ज पर्ची"
                    required={true}
                    documentData={getDoc('hospitalDeathSlip') || getDoc('deathSlip')}
                    onUpload={(doc) => handleDocumentUpload('hospitalDeathSlip', doc)}
                    onRemove={() => handleDocumentRemove('hospitalDeathSlip')}
                  />
                )}

                <DocumentUploader
                  title="मृतक का निवास पता प्रमाण फोटो"
                  description="राशन कार्ड / वोटर ID / बिजली बिल / अन्य"
                  required={false}
                  documentData={getDoc('addressProof')}
                  onUpload={(doc) => handleDocumentUpload('addressProof', doc)}
                  onRemove={() => handleDocumentRemove('addressProof')}
                />
              </div>
            </div>

            {/* DPDP ACT 2023 CONSENT CHECKBOX */}
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 space-y-2 shadow-sm">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={dpdpConsent}
                  onChange={(e) => setDpdpConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-emerald-300 text-emerald-700 focus:ring-emerald-600 shrink-0"
                />
                <span className="text-xs text-slate-800 font-medium leading-relaxed">
                  मैं एतद्द्वारा घोषित करता/करती हूँ कि ऊपर दी गई समस्त जानकारी सत्य व सही है। मैं भारत के <strong>डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम (DPDP Act, 2023)</strong> के तहत मेरे द्वारा प्रदान किए गए डेटा के प्रक्रमण (Processing) हेतु नगर पालिका परिषद झाबुआ को सहमति प्रदान करता/करती हूँ। (<a href="/privacy-policy" className="text-emerald-700 underline font-bold" target="_blank" rel="noreferrer">प्राइवेसी नीति एवं नियम पढ़ें</a>)
                </span>
              </label>
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
                {applications.map((app, index) => (
                  <div key={app.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono font-extrabold text-slate-900 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                          #{index + 1}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          📅 {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('hi-IN') : 'Draft'}
                        </span>
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
                      {/* Hard Copy Submission Letter */}
                      <button
                        onClick={() => { setSelectedApp(app); setShowLetterModal(true); }}
                        className="btn btn-secondary btn-sm flex items-center gap-1 font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-700" /> 🖨️ आवेदन पत्र (Hard Copy Letter)
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

                      {/* View & Download Official Uploaded Certificate or Auto Generated Certificate */}
                      {app.officialUploadedCertificate ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedApp(app);
                            setShowOfficialDocModal(true);
                          }}
                          className="btn btn-primary btn-sm bg-gradient-to-r from-emerald-700 to-emerald-800 text-white font-bold flex items-center gap-1 shadow-md cursor-pointer transition-all"
                        >
                          <Download className="w-3.5 h-3.5" /> 📜 अधिकारी हस्ताक्षरित प्रमाण पत्र देखें व डाउनलोड
                        </button>
                      ) : (
                        (app.status === 'Approved' || app.status === 'Certificate Generated' || app.status === 'Completed') && (
                          <button
                            onClick={() => { setSelectedApp(app); setShowCertModal(true); }}
                            className="btn btn-primary btn-sm bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold"
                          >
                            📜 प्रमाण पत्र डाउनलोड करें
                          </button>
                        )
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

        {/* TAB 3: CHECKLIST */}
        {activeTab === 'checklist' && (
          <DocumentChecklist defaultCategory="death" />
        )}

        {/* TIMELINE & APPLICATION DETAILS MODAL */}
        {selectedApp && !showCertModal && !showLetterModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">{selectedApp.applicationNo}</span>
                  <h3 className="text-slate-900 font-extrabold text-lg mt-1">मृतक: स्व. {selectedApp.deceasedDetails?.fullName}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => loadApplications()} 
                    className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 flex items-center gap-1 transition-all"
                    title="लाइव सर्वर स्थिति रीफ्रेश करें"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> ताज़ा करें
                  </button>
                  <button onClick={() => setSelectedApp(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
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

              <div className="flex gap-2">
                <button
                  onClick={() => setShowLetterModal(true)}
                  className="btn btn-secondary btn-sm text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-700" /> भौतिक पावती पत्र देखें / प्रिंट करें
                </button>
              </div>

              <h4 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">आवेदन टाइमलाइन विवरण (Activity Timeline)</h4>
              <ApplicationTimeline timeline={selectedApp.timeline || []} currentStatus={selectedApp.status} />
            </div>
          </div>
        )}

        {/* APPLICATION SUBMISSION LETTER MODAL */}
        {selectedApp && showLetterModal && (
          <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-50 overflow-y-auto p-3 sm:p-6 flex items-start justify-center pt-4 sm:pt-8">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[84vh] sm:max-h-[86vh]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                <h3 className="text-slate-900 font-extrabold text-base flex items-center gap-2">
                  📄 भौतिक सत्यापन आवेदन पत्र (Application Submission Letter)
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="btn btn-primary btn-sm flex items-center gap-1 font-bold text-xs"
                  >
                    <Printer className="w-3.5 h-3.5" /> प्रिंट / PDF डाउनलोड करें
                  </button>
                  <button onClick={() => { setShowLetterModal(false); setSelectedApp(null); }} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 pr-1 pt-3">
                <ApplicationLetterTemplate record={selectedApp} serviceType="death" />
              </div>
            </div>
          </div>
        )}

        {/* CERTIFICATE PREVIEW MODAL */}
        {selectedApp && showCertModal && (
          <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-50 overflow-y-auto p-3 sm:p-6 flex items-start justify-center pt-4 sm:pt-8">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[84vh] sm:max-h-[86vh]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                <h3 className="text-slate-900 font-extrabold text-base flex items-center gap-2">
                  📜 आधिकारिक मृत्यु प्रमाण पत्र पूर्वावलोकन (Official Death Certificate Preview)
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="btn btn-primary btn-sm flex items-center gap-1 font-bold text-xs"
                  >
                    <Printer className="w-3.5 h-3.5" /> प्रिंट / PDF डाउनलोड करें
                  </button>
                  <button onClick={() => { setShowCertModal(false); setSelectedApp(null); }} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 pr-1 pt-3">
                <DeathCertificateTemplate record={selectedApp} />
              </div>
            </div>
        {/* OFFICIAL UPLOADED CERTIFICATE VIEWER & DOWNLOAD MODAL */}
        {selectedApp && showOfficialDocModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 overflow-y-auto p-4 flex items-center justify-center pt-8">
            <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <span>📜</span> अधिकारी द्वारा जारी एवं हस्ताक्षरित मृत्यु प्रमाण पत्र (Official Signed Certificate)
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {selectedApp.officialUploadedCertificate?.fileName || 'Official_Signed_Death_Certificate.pdf'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      const success = await downloadBlobFile(selectedApp.officialUploadedCertificate, selectedApp.officialUploadedCertificate?.fileName || 'Official_Signed_Death_Certificate.pdf');
                      if (!success) {
                        toast.success('प्रमाण पत्र डिजिटल टेम्पलेट में खोला जा रहा है...');
                        setShowOfficialDocModal(false);
                        setShowCertModal(true);
                      }
                    }}
                    className="btn btn-primary btn-sm bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" /> 📥 फ़ाइल डाउनलोड करें
                  </button>
                  <button onClick={() => { setShowOfficialDocModal(false); setSelectedApp(null); }} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 bg-slate-100 rounded-2xl p-4 flex justify-center items-center min-h-[350px]">
                {selectedApp.officialUploadedCertificate?.fileType?.includes('image') || selectedApp.officialUploadedCertificate?.fileData?.startsWith('data:image') ? (
                  <img
                    src={selectedApp.officialUploadedCertificate.fileData}
                    alt="Official Signed Document"
                    className="max-h-[65vh] w-auto object-contain rounded-xl shadow-md"
                  />
                ) : (
                  <iframe
                    src={selectedApp.officialUploadedCertificate?.fileData}
                    title="Official Signed Document"
                    className="w-full h-[65vh] rounded-xl border-0 shadow-sm"
                  />
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">
                  अपलोडकर्ता: {selectedApp.officialUploadedCertificate?.uploadedBy || 'Nagar Palika Officer'}
                </span>
                <button
                  onClick={() => { setShowOfficialDocModal(false); setShowCertModal(true); }}
                  className="text-emerald-800 font-bold hover:underline flex items-center gap-1"
                >
                  🖨️ डिजिटल टेम्पलेट (Digital Template View) देखें
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

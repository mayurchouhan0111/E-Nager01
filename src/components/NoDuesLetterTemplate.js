import React from 'react';
import QRCodeGenerator from './QRCodeGenerator';

export default function NoDuesLetterTemplate({ record }) {
  if (!record) return null;

  const applicant = record.applicantDetails || {};
  const property = record.propertyDetails || {};
  const tax = record.taxDetails || {};

  const formatDateStr = (dStr) => {
    if (!dStr) return new Date().toLocaleDateString('hi-IN');
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return dStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (e) {
      return dStr;
    }
  };

  const appNo = record.applicationNo || 'ND-DRAFT';
  const appliedDate = formatDateStr(record.appliedAt || record.createdAt || Date.now());

  const applicantName = applicant.fullName || 'अनिल कुमार';
  const fatherName = applicant.fatherHusbandName || 'बाबू लाल';
  const propertyId = property.propertyId || property.propertyNo || '7001662737';
  
  const addressText = property.address || `11, चन्द्रशेखर आजाद मार्ग/TTOGB-Ward-${property.wardNo || '6'}, Ward-${property.wardNo || '6'}, Zone-${property.zoneNo || '1'}, झाबुआ, ${property.pincode || '457661'}`;
  
  const plotArea = property.plotArea || '900';
  const builtupArea = property.builtupArea || '900.0';
  const financialYear = tax.financialYear || '2026-27';
  const triRefNo = tax.triRefNo || 'PC-0179-03-6-1-00117';
  const paymentDate = formatDateStr(tax.paymentDate || record.createdAt || Date.now());
  const amountPaid = tax.amountPaid ? parseFloat(tax.amountPaid).toFixed(2) : '7098.00';

  return (
    <div className="print-page-a4 print-container bg-white text-slate-900 p-8 sm:p-12 max-w-4xl mx-auto border-2 border-slate-900 shadow-2xl relative font-serif text-xs sm:text-sm leading-relaxed print:p-6 print:max-h-none print:shadow-none">
      {/* Outer Border */}
      <div className="border border-slate-800 p-6 sm:p-8 relative space-y-6">

        {/* HEADER BRANDING */}
        <div className="flex justify-between items-start border-b border-slate-300 pb-4">
          <div className="flex items-center gap-3">
            <img src="/mp-logo.png" alt="मध्य प्रदेश शासन" className="w-14 h-14 object-contain" />
            <div>
              <h2 className="font-extrabold text-xs text-slate-800 uppercase">मध्य प्रदेश शासन — नगरीय विकास एवं आवास विभाग</h2>
              <h1 className="font-black text-sm sm:text-base text-slate-950 uppercase">कार्यालय नगर पालिका परिषद झाबुआ (म.प्र.)</h1>
              <p className="text-[11px] text-slate-600 font-semibold">संपत्ति कर अनुभाग (Property Tax Revenue Section)</p>
            </div>
          </div>
          <div className="text-right font-mono text-xs font-bold bg-slate-100 p-2 rounded border border-slate-300">
            <div>आवेदन क्र: <span className="text-emerald-900">{appNo}</span></div>
            <div className="text-[10px] text-slate-600">दिनांक: {appliedDate}</div>
          </div>
        </div>

        {/* RECIPIENT ADDRESS */}
        <div className="space-y-1 font-semibold text-slate-900">
          <p className="font-bold">सेवा में,</p>
          <p className="pl-4">श्रीमान् मुख्य नगरपालिका अधिकारी महोदय,</p>
          <p className="pl-4">नगर पालिका परिषद, झाबुआ,</p>
          <p className="pl-4">जिला - झाबुआ (म.प्र.)</p>
        </div>

        {/* SUBJECT */}
        <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 font-bold text-slate-950 text-center uppercase tracking-wide">
          विषय :- नो ड्यूज प्रमाण पत्र (No Dues Certificate / NOC) प्राप्त करने हेतु आवेदन।
        </div>

        {/* APPLICATION BODY TEXT */}
        <div className="space-y-4 text-justify leading-relaxed">
          <p className="font-bold">महोदय,</p>
          
          <p className="pl-4">
            सविनय निवेदन है कि प्रार्थी/आवेदक <strong>{applicantName}</strong> पिता <strong>{fatherName}</strong> का नाम ई-सेवा पोर्टल पर संपत्ति क्रमांक <strong>{propertyId}</strong> (पता: {addressText}) दर्ज है।
          </p>

          <p className="pl-4">
            उक्त संपत्ति का कुल प्लॉट क्षेत्रफल <strong>{plotArea} वर्ग फुट</strong> एवं बिल्ट-अप एरिया <strong>{builtupArea} वर्ग फुट</strong> है। इस संपत्ति पर वर्ष <strong>{financialYear}</strong> तक का समस्त बकाया एवं वर्तमान कर (T.R.I./रिफरेंस <strong>{triRefNo}</strong> दिनांक <strong>{paymentDate}</strong> के अंतर्गत <strong>₹{amountPaid}</strong>) पूर्ण रूप से जमा किया जा चुका है। ई-सेवा पोर्टल के अनुसार इस संपत्ति पर वर्तमान में किसी भी प्रकार का कर या अन्य राशि बकाया नहीं है।
          </p>

          <p className="pl-4 font-semibold">
            अतः आपसे निवेदन है कि हमारी संपत्ति के संबंध में विधिवत नो ड्यूज प्रमाण पत्र (No Dues Certificate) जारी करने की कृपा करें।
          </p>
        </div>

        {/* DOCUMENTS ATTACHMENT CHECKLIST */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
          <h4 className="font-bold text-slate-950 uppercase border-b border-slate-300 pb-1">संलग्न दस्तावेज सूची (Attached Mandatory Documents):</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-medium text-slate-800">
            <li className="flex items-center gap-1.5">✅ 1. अद्यतन संपत्ति कर भुगतान रसीद (Tax Receipt FY {financialYear})</li>
            <li className="flex items-center gap-1.5">✅ 2. आवेदक आधार कार्ड (Applicant Aadhaar)</li>
            <li className="flex items-center gap-1.5">✅ 3. संपत्ति स्व-आकलन पत्र (SAF Property Form)</li>
            <li className="flex items-center gap-1.5">✅ 4. गूगल ऑथराइजेशन एवं आवेदक डिजिटल सत्यापन</li>
          </ul>
        </div>

        {/* FOOTER & APPLICANT SIGNATURE */}
        <div className="pt-6 flex justify-between items-end border-t border-slate-300">
          <div className="text-center space-y-1">
            <div className="p-1 bg-white border border-slate-300 rounded inline-block">
              <QRCodeGenerator 
                value={`https://jhabua-nagarpalika-aapke-dwar.netlify.app/verify?type=no_dues_letter&appNo=${encodeURIComponent(appNo)}`}
                size={75}
              />
            </div>
            <span className="block text-[8px] font-mono text-slate-500">भौतिक सत्यापन क्यूआर कोड</span>
          </div>

          <div className="text-right space-y-1 font-semibold text-slate-900">
            <p>सधन्यवाद!</p>
            <p className="text-xs">दिनांक: {appliedDate}</p>
            <p className="text-xs">स्थान: झाबुआ (म.प्र.)</p>
            <div className="pt-6">
              <p className="font-bold text-slate-950">भवदीय,</p>
              <p className="font-black text-sm uppercase">({applicantName})</p>
              <p className="text-xs text-slate-700">पिता - {fatherName}</p>
              <p className="text-[11px] text-slate-600">संपर्क सूत्र / पता: झाबुआ, म.प्र. (मो: {applicant.mobile || 'N/A'})</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

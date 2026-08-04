'use client';

import React from 'react';

export default function BirthCertificateTemplate({ record }) {
  if (!record) return null;

  const child = record.childDetails || {};
  const mother = record.motherDetails || {};
  const father = record.fatherDetails || {};
  const applicant = record.applicantDetails || {};

  const formattedDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('hi-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatAddress = (addrObj) => {
    if (!addrObj) return null;
    if (addrObj.isSameAsPresent) return 'वर्तमान पते के समान (Same as Present Address)';
    const parts = [
      addrObj.houseNo && `मकान क्र. ${addrObj.houseNo}`,
      addrObj.street,
      addrObj.villageCity,
      addrObj.district,
      addrObj.state,
      addrObj.pincode && `पिन: ${addrObj.pincode}`
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  const presentAddressText = formatAddress(child.presentAddress);
  const permanentAddressText = formatAddress(child.permanentAddress);

  return (
    <div className="bg-white text-slate-900 p-8 max-w-4xl mx-auto border-8 border-double border-blue-900/40 shadow-2xl relative font-serif">
      <div className="border border-blue-800/30 p-6 relative">
        
        {/* Official Header */}
        <div className="text-center border-b-2 border-blue-900/30 pb-4 mb-6">
          <div className="w-16 h-16 mx-auto mb-2 bg-blue-700/10 rounded-full border border-blue-700/40 flex items-center justify-center font-bold text-blue-950 text-2xl">
            नगर
          </div>
          <h2 className="text-sm uppercase tracking-widest text-slate-600 font-semibold mb-1">
            मध्य प्रदेश शासन - लोक स्वास्थ्य एवं परिवार कल्याण विभाग (Govt. of MP - Dept. of Public Health & Family Welfare)
          </h2>
          <h1 className="text-2xl font-bold text-blue-950 uppercase tracking-wider">
            कार्यालय नगर पालिका परिषद झाबुआ (म.प्र.) (Office of Nagar Palika Parishad Jhabua, MP)
          </h1>
          <h3 className="text-xl font-extrabold text-blue-900 underline decoration-blue-700 decoration-2 underline-offset-4 mt-2">
            जन्म प्रमाण पत्र (BIRTH CERTIFICATE)
          </h3>
          <p className="text-xs text-slate-600 mt-1 italic">
            (जन्म और मृत्यु पंजीकरण अधिनियम, 1969 की धारा 12/17 तथा मध्य प्रदेश जन्म-मृत्यु पंजीकरण नियम, 1999 के अधीन जारी)
          </p>
        </div>

        {/* Registration Details */}
        <div className="flex justify-between items-center bg-blue-500/10 p-3 rounded border border-blue-700/20 text-xs font-semibold text-blue-950 mb-6">
          <div>
            पंजीकरण क्रमांक (Reg. No): <span className="font-bold text-blue-900 font-mono text-sm">{record.certificateNo || `BC-CERT-${record.id?.slice(-6)}`}</span>
          </div>
          <div>
            आवेदन क्रमांक (App No): <span className="font-mono text-slate-800">{record.applicationNo}</span>
          </div>
          <div>
            पंजीकरण तिथि (Reg Date): <span className="font-mono text-slate-800">{formattedDate(record.approvedAt || record.updatedAt)}</span>
          </div>
        </div>

        <p className="text-sm leading-relaxed mb-6 text-justify">
          प्रमाणित किया जाता है कि निम्नलिखित जानकारी जन्म के मूल अभिलेख से ली गई है, जो कि नगर पालिका परिषद झाबुआ, तहसील झाबुआ, जिला झाबुआ, राज्य मध्य प्रदेश के रजिस्टर में दर्ज है:
        </p>

        {/* Data Table */}
        <table className="w-full text-xs border-collapse border border-slate-400 mb-6">
          <tbody>
            <tr className="border-b border-slate-300 bg-slate-50">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300 w-1/3">शिशु का पूरा नाम (Full Name of Child):</td>
              <td className="p-2.5 font-bold text-blue-950 text-sm">{child.fullName || 'नाम दर्ज नहीं (Not Named)'}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">लिंग (Gender):</td>
              <td className="p-2.5 font-bold text-slate-900">{child.gender || 'N/A'}</td>
            </tr>
            <tr className="border-b border-slate-300 bg-slate-50">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">जन्म की तिथि (Date of Birth):</td>
              <td className="p-2.5 font-semibold text-blue-950 text-sm">{formattedDate(child.dateOfBirth)}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">जन्म का स्थान (Place of Birth):</td>
              <td className="p-2.5 text-slate-900">
                {child.hospitalName || child.placeOfBirth || 'झाबुआ, मध्य प्रदेश'} ({child.placeType || 'Hospital/Home'})
              </td>
            </tr>
            <tr className="border-b border-slate-300 bg-slate-50">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">माता का नाम (Name of Mother):</td>
              <td className="p-2.5 text-slate-900 font-semibold">{mother.fullName || 'N/A'}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">पिता का नाम (Name of Father):</td>
              <td className="p-2.5 text-slate-900 font-semibold">{father.fullName || 'N/A'}</td>
            </tr>
            <tr className="border-b border-slate-300 bg-slate-50">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">जन्म के समय माता-पिता का पता (Address of Parents at Time of Birth):</td>
              <td className="p-2.5 text-slate-900">{presentAddressText || 'झाबुआ, मध्य प्रदेश'}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">माता-पिता का स्थायी पता (Permanent Address of Parents):</td>
              <td className="p-2.5 text-slate-900">{permanentAddressText || presentAddressText || 'झाबुआ, मध्य प्रदेश'}</td>
            </tr>
            <tr className="border-b border-slate-300 bg-slate-50">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">आवेदक / सूचनाकर्ता (Informant):</td>
              <td className="p-2.5 text-slate-900">{applicant.fullName || 'N/A'} ({applicant.relationWithChild || 'Parent/Informant'})</td>
            </tr>
          </tbody>
        </table>

        {/* Verification Seals Footer */}
        <div className="flex items-end justify-between pt-6 border-t border-blue-900/30">
          <div className="text-center">
            <div className="w-24 h-24 border-2 border-slate-800 p-1 mx-auto mb-1 bg-white flex flex-col items-center justify-center text-[10px] text-slate-600 font-mono">
              <div className="grid grid-cols-4 gap-1 w-full h-full bg-slate-900 p-1 rounded">
                <div className="bg-white"></div>
                <div className="bg-slate-900"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 block">QR सत्यापित आधिकारिक (QR VERIFIED OFFICIAL)</span>
          </div>

          <div className="text-center pr-4">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-blue-900/40 mx-auto mb-2 flex items-center justify-center text-[10px] text-blue-900 font-bold tracking-tighter">
              सील नगर पालिका (Seal: Nagar Palika)
            </div>
            <div className="font-bold text-xs text-slate-900">रजिस्ट्रार (जन्म एवं मृत्यु) (Registrar (Birth & Death))</div>
            <div className="text-xs text-slate-700 font-semibold">नगर पालिका परिषद झाबुआ</div>
            <div className="text-[10px] text-slate-500 mt-1">जारी करने की तिथि: (Date of Issue:) {formattedDate(new Date())}</div>
          </div>
        </div>

      </div>
    </div>
  );
}

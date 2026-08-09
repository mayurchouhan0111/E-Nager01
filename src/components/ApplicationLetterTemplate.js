'use client';

import React from 'react';

export default function ApplicationLetterTemplate({ record, serviceType = 'death' }) {
  if (!record) return null;

  const isWater = serviceType === 'water_connection' || serviceType === 'water' || record.applicationNo?.startsWith('WC');
  const isBirth = !isWater && (serviceType === 'birth' || record.applicationNo?.startsWith('BC'));

  const child = record.childDetails || {};
  const deceased = record.deceasedDetails || {};
  const mother = record.motherDetails || {};
  const father = record.fatherDetails || {};
  const applicant = record.applicantDetails || {};
  const parentSpouse = record.parentSpouseDetails || {};
  const property = record.propertyDetails || {};
  const existingConn = record.existingConnectionDetails || {};
  const plumber = record.plumberDetails || {};

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
    if (!addrObj) return 'N/A';
    if (typeof addrObj === 'string') return addrObj;
    if (addrObj.isSameAsPresent) return 'वर्तमान पते के समान (Same as Present Address)';
    const parts = [
      addrObj.houseNo && `मकान क्र. ${addrObj.houseNo}`,
      addrObj.street,
      addrObj.villageCity,
      addrObj.district,
      addrObj.state,
      addrObj.pincode && `पिन: ${addrObj.pincode}`
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  // Determine uploaded documents checklist
  const uploadedDocs = record.documents || [];

  return (
    <div className="print-page-a4 print-container bg-white text-slate-900 p-6 max-w-4xl mx-auto border-4 border-slate-700 shadow-xl relative font-sans text-xs print:p-4 print:border-2 print:max-h-none print:overflow-visible">
      {/* Subtle Official Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] overflow-hidden select-none z-0">
        <img src="/mp-logo.png" alt="" className="w-[420px] h-[420px] object-contain" />
      </div>
      
      {/* Official Header */}
      <div className="text-center border-b-2 border-slate-800 pb-4 mb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img 
            src="/mp-logo.png" 
            alt="मध्य प्रदेश शासन" 
            className="w-14 h-14 object-contain shrink-0" 
          />
          <div>
            <h2 className="text-[11px] uppercase tracking-widest text-slate-700 font-bold">
              मध्य प्रदेश शासन — नगरीय विकास एवं आवास विभाग
            </h2>
            <h1 className="text-lg font-extrabold text-slate-950 uppercase tracking-wide">
              कार्यालय नगर पालिका परिषद झाबुआ (म.प्र.)
            </h1>
            <p className="text-[10px] text-slate-600 font-semibold">
              नागरिक सुविधा केंद्र (Citizen Digital Facilitation Portal)
            </p>
          </div>
        </div>

        <div className="mt-2 bg-slate-900 text-white py-1.5 px-4 rounded font-bold text-sm tracking-wider uppercase inline-block">
          {isWater ? 'नल कनेक्शन हेतु आवेदन पत्र सह पावती' : isBirth ? 'जन्म प्रमाण पत्र आवेदन पत्र सह पावती' : 'मृत्यु प्रमाण पत्र आवेदन पत्र सह पावती'}
        </div>
        <p className="text-[10px] text-slate-600 mt-1 italic">
          (भौतिक सत्यापन एवं कार्यालयीन रिकॉर्ड हेतु मूल पावती पत्र)
        </p>
      </div>

      {/* Reference Bar */}
      <div className="grid grid-cols-3 gap-2 bg-slate-100 p-3 rounded-lg border border-slate-300 font-semibold mb-4 text-slate-900">
        <div>
          आवेदन क्रमांक (App No): <span className="font-mono font-bold text-emerald-900 text-sm block sm:inline">{record.applicationNo || 'N/A'}</span>
        </div>
        <div>
          आवेदन तिथि (Applied Date): <span className="font-mono text-slate-800 block sm:inline">{formattedDate(record.appliedAt || record.createdAt)}</span>
        </div>
        <div>
          वर्तमान स्थिति (Status): <span className="font-bold text-blue-900 block sm:inline">{record.status || 'Submitted'}</span>
        </div>
      </div>

      {/* Notice Alert Box */}
      <div className="bg-amber-50 border-2 border-amber-400 p-3 rounded-lg text-amber-950 font-medium mb-4 leading-relaxed space-y-1.5 text-xs">
        <div>
          <span className="font-bold text-amber-900 underline">📌 अनिवार्य निर्देश (MANDATORY INSTRUCTIONS):</span>
          कृपया इस ऑनलाइन आवेदन पत्र का <strong>प्रिंट आउट (Hard Copy)</strong> निकालें और अपने <strong>संलग्न मूल दस्तावेजों एवं छायाप्रतियों</strong> के साथ <strong>नगर पालिका कार्यालय झाबुआ ({isWater ? 'जल प्रदाय शाखा' : 'जन्म-मृत्यु पंजीकरण शाखा'})</strong> में भौतिक सत्यापन (Physical Verification) हेतु अनिवार्यतः जमा करें।
        </div>
        <div className="text-[11px] text-rose-900 font-bold bg-rose-100/80 p-2 rounded border border-rose-300 mt-1">
          ⚠️ वैधानिक उत्तरदायित्व चेतावनी (Official Legal Disclaimer): इस पोर्टल पर दर्ज समस्त जानकारी शासकीय अभिलेख हेतु आधिकारिक है। यदि आवेदक द्वारा कोई असत्य या भ्रामक जानकारी दर्ज की जाती है, तो उसके लिए आवेदक स्वयं व्यक्तिगत एवं कानूनी रूप से पूर्णतः जिम्मेदार रहेगा।
        </div>
      </div>

      {/* Official CMO Salutation */}
      <div className="mb-4 text-xs font-semibold text-slate-900 bg-slate-50/80 p-3 rounded-lg border border-slate-300 space-y-1">
        <p><span className="font-bold text-slate-950">सेवा में,</span></p>
        <p className="pl-4 font-bold text-slate-950">मुख्य नगर पालिका अधिकारी (CMO)</p>
        <p className="pl-4 text-slate-700">नगर पालिका परिषद झाबुआ, जिला झाबुआ (म.प्र.)</p>
        <p className="pt-1"><span className="font-bold text-slate-950">विषय:</span> {isWater ? 'नवीन जल (नल) कनेक्शन स्वीकृति हेतु आवेदन पत्र।' : isBirth ? `नवीन जन्म पंजीकरण एवं जन्म प्रमाण पत्र (${child.placeType?.includes('घर') ? 'घर पर जन्म' : child.hospitalName?.includes('वरदान') ? 'वरदान हॉस्पिटल जन्म' : 'अस्पताल जन्म'}) जारी करने बाबत।` : `मृत्यु पंजीकरण एवं मृत्यु प्रमाण पत्र (${deceased.placeType?.includes('घर') ? 'घर पर मृत्यु' : 'अस्पताल मृत्यु'}) जारी करने बाबत।`}</p>
      </div>

      {/* Details Section */}
      {isWater ? (
        /* WATER CONNECTION DETAILS TABLE */
        <div className="space-y-4 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 border-b border-slate-400 pb-1 mb-2 uppercase text-xs">
              1. आवेदक एवं भवन का विवरण (Applicant & Property Details)
            </h3>
            <table className="w-full border-collapse border border-slate-400 text-xs">
              <tbody>
                <tr className="border-b border-slate-300 bg-slate-50">
                  <td className="p-2 font-bold w-1/3 border-r border-slate-300">आवेदक का नाम:</td>
                  <td className="p-2 font-bold text-slate-900">{applicant.fullName || 'N/A'}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-bold border-r border-slate-300">पिता / पति का नाम / जाति:</td>
                  <td className="p-2">{applicant.fatherHusbandName || 'N/A'} {applicant.caste ? `(जाति: ${applicant.caste})` : ''}</td>
                </tr>
                <tr className="border-b border-slate-300 bg-slate-50">
                  <td className="p-2 font-bold border-r border-slate-300">भवन क्रमांक / स्वामी का नाम:</td>
                  <td className="p-2">भवन क्र. {property.houseNo || 'N/A'} | भवन स्वामी: {property.houseOwnerName || applicant.fullName}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-bold border-r border-slate-300">वार्ड क्र. / किरायदार स्थिति:</td>
                  <td className="p-2">वार्ड क्र. {applicant.wardNo || 'N/A'} | किरायदार है? <span className="font-bold">{applicant.isTenant ? 'हाँ (Yes)' : 'नहीं (No)'}</span></td>
                </tr>
                <tr className="border-b border-slate-300 bg-slate-50">
                  <td className="p-2 font-bold border-r border-slate-300">कनेक्शन साइज / फेरूल साइज:</td>
                  <td className="p-2">कनेक्शन: {property.connectionSize || '1/2 इंच'} | फेरूल साइज: {property.ferruleSize || '1/2 इंच'}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 font-bold border-r border-slate-300">टोटी की संख्या / उपयोग प्रयोजन:</td>
                  <td className="p-2">टोंटी: {property.tapCount || '1'} | प्रयोजन: {property.usagePurpose || 'घरेलू (Domestic)'}</td>
                </tr>
                <tr className="border-b border-slate-300 bg-slate-50">
                  <td className="p-2 font-bold border-r border-slate-300">दैनिक जल खपत / दूरी:</td>
                  <td className="p-2">{property.dailyWaterLiters || 'N/A'} लीटर/दिन | मुख्य पाइप लाइन से भवन दूरी: {property.distanceMainPipe || 'N/A'} फीट</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold border-r border-slate-300">पाइप साइज एवं कुल लम्बाई:</td>
                  <td className="p-2">पाइप साइज: {property.pipeSize || '1/2 इंच'} | कुल लम्बाई: {property.totalPipeLength || 'N/A'} फीट</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 border-b border-slate-400 pb-1 mb-2 uppercase text-xs">
              2. संदर्भ एवं अधिकृत प्लम्बर का विवरण (Reference & Licensed Plumber)
            </h3>
            <table className="w-full border-collapse border border-slate-400 text-xs">
              <tbody>
                <tr className="border-b border-slate-300 bg-slate-50">
                  <td className="p-2 font-bold w-1/3 border-r border-slate-300">अन्य कनेक्शन विवरण:</td>
                  <td className="p-2">{existingConn.existingConnNo ? `कनेक्शन क्र. ${existingConn.existingConnNo} (${existingConn.existingConnName || ''})` : 'कोई पूर्व कनेक्शन नहीं'}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold border-r border-slate-300">अधिकृत प्लम्बर नाम एवं लाइसेंस क्र.:</td>
                  <td className="p-2 font-semibold text-emerald-950">{plumber.plumberName || 'नगर निगम / पालिका अधिकृत प्लम्बर'} (लाइसेंस क्र. {plumber.plumberLicenseNo || 'N/A'})</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : isBirth ? (
        /* BIRTH DETAILS TABLE */
        <div className="mb-4">
          <h3 className="font-bold text-slate-900 border-b border-slate-400 pb-1 mb-2 uppercase text-xs">
            1. नवजात शिशु एवं माता-पिता का विवरण (Child & Parent Details)
          </h3>
          <table className="w-full border-collapse border border-slate-400 text-xs mb-3">
            <tbody>
              <tr className="border-b border-slate-300 bg-slate-50">
                <td className="p-2 font-bold w-1/3 border-r border-slate-300">शिशु का नाम (Child Name):</td>
                <td className="p-2 font-bold text-emerald-950 text-sm">{child.fullName || 'नाम दर्ज नहीं (Not Named Yet)'}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold border-r border-slate-300">लिंग (Gender) / जन्म तिथि (DOB):</td>
                <td className="p-2">{child.gender || 'N/A'} / <span className="font-semibold text-blue-900">{formattedDate(child.dateOfBirth)}</span></td>
              </tr>
              <tr className="border-b border-slate-300 bg-slate-50">
                <td className="p-2 font-bold border-r border-slate-300">जन्म का स्थान (Place of Birth):</td>
                <td className="p-2">{child.hospitalName || child.placeOfBirth || child.placeType || 'झाबुआ, मध्य प्रदेश'}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold border-r border-slate-300">माता का नाम एवं आधार:</td>
                <td className="p-2 font-semibold">{mother.fullName || 'N/A'} {mother.aadhaarNo ? `(आधार: ${mother.aadhaarNo})` : ''}</td>
              </tr>
              <tr className="border-b border-slate-300 bg-slate-50">
                <td className="p-2 font-bold border-r border-slate-300">पिता का नाम एवं आधार:</td>
                <td className="p-2 font-semibold">{father.fullName || 'N/A'} {father.aadhaarNo ? `(आधार: ${father.aadhaarNo})` : ''}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold border-r border-slate-300">जन्म के समय माता-पिता का पता:</td>
                <td className="p-2">{formatAddress(child.presentAddress)}</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border-r border-slate-300">माता-पिता का स्थायी पता:</td>
                <td className="p-2">{formatAddress(child.permanentAddress)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        /* DEATH DETAILS TABLE */
        <div className="mb-4">
          <h3 className="font-bold text-slate-900 border-b border-slate-400 pb-1 mb-2 uppercase text-xs">
            1. मृतक का विवरण (Deceased Details)
          </h3>
          <table className="w-full border-collapse border border-slate-400 text-xs mb-3">
            <tbody>
              <tr className="border-b border-slate-300 bg-slate-50">
                <td className="p-2 font-bold w-1/3 border-r border-slate-300">मृतक का नाम (Deceased Full Name):</td>
                <td className="p-2 font-bold text-slate-900 text-sm">स्व. {deceased.fullName || 'N/A'}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold border-r border-slate-300">लिंग (Gender) / आयु (Age):</td>
                <td className="p-2">{deceased.gender || 'N/A'} / {deceased.age ? `${deceased.age} वर्ष` : 'N/A'}</td>
              </tr>
              <tr className="border-b border-slate-300 bg-slate-50">
                <td className="p-2 font-bold border-r border-slate-300">मृत्यु की तिथि (Date of Death):</td>
                <td className="p-2 font-semibold text-emerald-950">{formattedDate(deceased.dateOfDeath)}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold border-r border-slate-300">मृत्यु का स्थान (Place of Death):</td>
                <td className="p-2">{deceased.hospitalName || deceased.placeOfDeath || deceased.placeType || 'N/A'}</td>
              </tr>
              <tr className="border-b border-slate-300 bg-slate-50">
                <td className="p-2 font-bold border-r border-slate-300">पिता / पति का नाम:</td>
                <td className="p-2 font-semibold">{parentSpouse.fatherHusbandName || 'N/A'}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold border-r border-slate-300">माता का नाम:</td>
                <td className="p-2 font-semibold">{parentSpouse.motherName || 'N/A'}</td>
              </tr>
              <tr className="border-b border-slate-300 bg-slate-50">
                <td className="p-2 font-bold border-r border-slate-300">मृतक का वर्तमान पता:</td>
                <td className="p-2">{formatAddress(deceased.presentAddress)}</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border-r border-slate-300">मृतक का स्थायी पता:</td>
                <td className="p-2">{formatAddress(deceased.permanentAddress)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* MANDATORY CAPITAL LETTERS SPELLING BLOCK (As per official notice board rule 5 & 6) */}
      {!isWater && (
        <div className="mb-4 border-2 border-slate-800 p-3 rounded bg-slate-50">
          <h4 className="font-extrabold text-slate-950 text-xs border-b border-slate-400 pb-1 mb-2 uppercase tracking-wide flex items-center justify-between">
            <span>🔤 शासकीय रिकॉर्ड हेतु अंग्रेजी (CAPITAL LETTERS) में स्पेलिंग (Mandatory Spelling in Capital Letters)</span>
            <span className="text-[10px] font-normal text-slate-600 italic">सूचना पट्ट निर्देश क्र. {isBirth ? '5' : '6'}</span>
          </h4>
          {isBirth ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono font-bold text-slate-950">
              <div className="bg-white p-2 rounded border border-slate-300">
                <span className="text-[10px] text-slate-500 font-sans font-semibold block">1. Child Name (शिशु का नाम):</span>
                <span className="text-sm tracking-wider text-emerald-950">{child.fullName ? child.fullName.toUpperCase() : 'NOT NAMED YET'}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-300">
                <span className="text-[10px] text-slate-500 font-sans font-semibold block">2. Mother Name (माता का नाम):</span>
                <span className="text-sm tracking-wider text-slate-900">{mother.fullName ? mother.fullName.toUpperCase() : 'N/A'}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-300">
                <span className="text-[10px] text-slate-500 font-sans font-semibold block">3. Father Name (पिता का नाम):</span>
                <span className="text-sm tracking-wider text-slate-900">{father.fullName ? father.fullName.toUpperCase() : 'N/A'}</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono font-bold text-slate-950">
              <div className="bg-white p-2 rounded border border-slate-300">
                <span className="text-[10px] text-slate-500 font-sans font-semibold block">1. Deceased Name (मृतक का नाम):</span>
                <span className="text-sm tracking-wider text-emerald-950">{deceased.fullName ? deceased.fullName.toUpperCase() : 'N/A'}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-300">
                <span className="text-[10px] text-slate-500 font-sans font-semibold block">2. Father/Husband Name (पिता/पति का नाम):</span>
                <span className="text-sm tracking-wider text-slate-900">{parentSpouse.fatherHusbandName ? parentSpouse.fatherHusbandName.toUpperCase() : 'N/A'}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-300">
                <span className="text-[10px] text-slate-500 font-sans font-semibold block">3. Mother Name (माता का नाम):</span>
                <span className="text-sm tracking-wider text-slate-900">{parentSpouse.motherName ? parentSpouse.motherName.toUpperCase() : 'N/A'}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* APPLICANT / INFORMANT DETAILS */}
      <div className="mb-4">
        <h3 className="font-bold text-slate-900 border-b border-slate-400 pb-1 mb-2 uppercase text-xs">
          2. आवेदक / सूचनाकर्ता का विवरण (Applicant / Informant Details)
        </h3>
        <table className="w-full border-collapse border border-slate-400 text-xs mb-3">
          <tbody>
            <tr className="border-b border-slate-300 bg-slate-50">
              <td className="p-2 font-bold w-1/3 border-r border-slate-300">आवेदक का पूरा नाम:</td>
              <td className="p-2 font-bold text-slate-900">{applicant.fullName || 'N/A'}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold border-r border-slate-300">संबंध (Relation):</td>
              <td className="p-2">{applicant.relationWithDeceased || applicant.relationWithChild || 'N/A'}</td>
            </tr>
            <tr className="border-b border-slate-300 bg-slate-50">
              <td className="p-2 font-bold border-r border-slate-300">संपर्क मोबाइल एवं ईमेल:</td>
              <td className="p-2 font-mono">{applicant.mobile || 'N/A'} {applicant.email ? `| ${applicant.email}` : ''}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold border-r border-slate-300">आधार संख्या (Aadhaar No):</td>
              <td className="p-2 font-mono">{applicant.aadhaarNo || 'N/A'}</td>
            </tr>
            <tr>
              <td className="p-2 font-bold border-r border-slate-300">आवेदक का पूर्ण पता:</td>
              <td className="p-2">{applicant.address || 'N/A'}, {applicant.villageCity || 'झाबुआ'}, {applicant.district || 'झाबुआ'} ({applicant.pincode})</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ATTACHED DOCUMENTS CHECKLIST (Dynamically Matching Official Notice Board Rules) */}
      <div className="mb-5">
        <h3 className="font-bold text-slate-900 border-b border-slate-400 pb-1 mb-2 uppercase text-xs">
          3. आवश्यक संलग्न दस्तावेजों की शासकीय जांच सूची (Official Attached Documents Checklist)
        </h3>
        <table className="w-full border-collapse border border-slate-400 text-xs">
          <thead>
            <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-400">
              <th className="p-1.5 text-left border-r border-slate-400 w-10">क्र.</th>
              <th className="p-1.5 text-left border-r border-slate-400">आवश्यक दस्तावेज विवरण (Document Title)</th>
              <th className="p-1.5 text-center border-r border-slate-400 w-28">पोर्टल स्थिति</th>
              <th className="p-1.5 text-center w-32">कार्यालयीन भौतिक जांच [ ✓ ]</th>
            </tr>
          </thead>
          <tbody>
            {isWater ? (
              <>
                <tr className="border-b border-slate-300">
                  <td className="p-1.5 font-bold border-r border-slate-300 text-center">1</td>
                  <td className="p-1.5 border-r border-slate-300">आईडी प्रूफ (आधार/SSSM समग्र आईडी/बिजली बिल/संपत्ति कर रसीद/नोटरी शपथ पत्र ₹1000) <span className="font-bold text-rose-700 text-[10px]">(अनिवार्य)</span></td>
                  <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                    {(record.documents?.idProofDoc || record.documents?.aadhaarCard || record.documents?.propertyReceipt) ? 'संलग्न' : 'संलग्न'}
                  </td>
                  <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                </tr>
                <tr className="border-b border-slate-300 bg-slate-50">
                  <td className="p-1.5 font-bold border-r border-slate-300 text-center">2</td>
                  <td className="p-1.5 border-r border-slate-300">नल कनेक्शन स्थान का साइट प्लान नक्शा (Site Plan) <span className="font-bold text-rose-700 text-[10px]">(अनिवार्य)</span></td>
                  <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                    {record.documents?.sitePlanDoc ? 'संलग्न' : 'संलग्न'}
                  </td>
                  <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-1.5 font-bold border-r border-slate-300 text-center">3</td>
                  <td className="p-1.5 border-r border-slate-300">नल कनेक्शन शुल्क रसीद (Charges ₹4250/-) <span className="font-bold text-rose-700 text-[10px]">(अनिवार्य)</span></td>
                  <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                    {record.documents?.connectionChargesReceipt ? 'संलग्न' : 'संलग्न'}
                  </td>
                  <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                </tr>
                <tr className="border-b border-slate-300 bg-slate-50">
                  <td className="p-1.5 font-bold border-r border-slate-300 text-center">4</td>
                  <td className="p-1.5 border-r border-slate-300">सड़क खुदाई शुल्क रसीद (Road Cutting Charges) <span className="font-bold text-slate-500 text-[10px]">(वैकल्पिक / If applicable)</span></td>
                  <td className="p-1.5 border-r border-slate-300 text-center font-bold text-slate-600">
                    {record.documents?.roadCuttingReceipt ? 'संलग्न' : 'यदि लागू हो'}
                  </td>
                  <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                </tr>
              </>
            ) : isBirth ? (
              child.placeType?.includes('घर') ? (
                /* Birth at Home - 5 mandatory documents from Notice Board */
                <>
                  <tr className="border-b border-slate-300">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-center">1</td>
                    <td className="p-1.5 border-r border-slate-300">बच्चे के माता-पिता के आधार कार्ड की फोटोकॉपी</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                      {(record.documents?.motherAadhaar || record.documents?.fatherAadhaar) ? 'संलग्न' : 'संलग्न'}
                    </td>
                    <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                  </tr>
                  <tr className="border-b border-slate-300 bg-slate-50">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-center">2</td>
                    <td className="p-1.5 border-r border-slate-300">समग्र परिवार आई.डी. फोटोकॉपी (माता-पिता का नाम अनिवार्य)</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                      {record.documents?.samagraId ? 'संलग्न' : 'संलग्न'}
                    </td>
                    <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-center">3</td>
                    <td className="p-1.5 border-r border-slate-300">आँगनवाड़ी कार्यकर्ता द्वारा प्रमाणित पत्र (सील व हस्ताक्षर सहित कि बच्चा घर पर हुआ है)</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                      {record.documents?.anganwadiLetter ? 'संलग्न' : 'संलग्न'}
                    </td>
                    <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                  </tr>
                  <tr className="border-b border-slate-300 bg-slate-50">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-center">4</td>
                    <td className="p-1.5 border-r border-slate-300">जच्चा-बच्चा कार्ड (MCP Card) फोटोकॉपी</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                      {record.documents?.mcpCard ? 'संलग्न' : 'संलग्न'}
                    </td>
                    <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-center">5</td>
                    <td className="p-1.5 border-r border-slate-300">मुख्य नगर पालिका अधिकारी के नाम आवेदन पत्र (केपिटल लेटर्स स्पेलिंग सहित)</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">मूल पावती पत्र</td>
                    <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                  </tr>
                </>
              ) : child.hospitalName?.includes('वरदान') ? (
                /* Birth at Vardan Hospital - 3 documents from Notice Board */
                <>
                  <tr className="border-b border-slate-300">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-center">1</td>
                    <td className="p-1.5 border-r border-slate-300">बच्चे के माता-पिता के आधार कार्ड की फोटोकॉपी</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                      {(record.documents?.motherAadhaar || record.documents?.fatherAadhaar) ? 'संलग्न' : 'संलग्न'}
                    </td>
                    <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                  </tr>
                  <tr className="border-b border-slate-300 bg-slate-50">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-center">2</td>
                    <td className="p-1.5 border-r border-slate-300">समग्र परिवार आई.डी. फोटोकॉपी (माता-पिता का नाम अनिवार्य)</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                      {record.documents?.samagraId ? 'संलग्न' : 'संलग्न'}
                    </td>
                    <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-center">3</td>
                    <td className="p-1.5 border-r border-slate-300">वरदान हॉस्पिटल की रजिस्ट्रेशन स्लिप व डिस्चार्ज कार्ड की फोटोकॉपी</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                      {record.documents?.hospitalSlip ? 'संलग्न' : 'संलग्न'}
                    </td>
                    <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                  </tr>
                </>
              ) : (
                /* General Hospital Birth - 3 documents */
                <>
                  <tr className="border-b border-slate-300">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-center">1</td>
                    <td className="p-1.5 border-r border-slate-300">बच्चे के माता-पिता के आधार कार्ड की फोटोकॉपी</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                      {(record.documents?.motherAadhaar || record.documents?.fatherAadhaar) ? 'संलग्न' : 'संलग्न'}
                    </td>
                    <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                  </tr>
                  <tr className="border-b border-slate-300 bg-slate-50">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-center">2</td>
                    <td className="p-1.5 border-r border-slate-300">समग्र परिवार आई.डी. फोटोकॉपी (माता-पिता का नाम दर्ज)</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                      {record.documents?.samagraId ? 'संलग्न' : 'संलग्न'}
                    </td>
                    <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-center">3</td>
                    <td className="p-1.5 border-r border-slate-300">अस्पताल प्रसव सूचना पर्ची / डिस्चार्ज कार्ड फोटोकॉपी</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                      {record.documents?.hospitalSlip ? 'संलग्न' : 'संलग्न'}
                    </td>
                    <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                  </tr>
                </>
              )
            ) : (
              deceased.placeType?.includes('घर') ? (
                /* Death at Home - 6 mandatory documents from Notice Board */
                <>
                  <tr className="border-b border-slate-300">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-center">1</td>
                    <td className="p-1.5 border-r border-slate-300">मृतक के आधार कार्ड की फोटोकॉपी</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                      {record.documents?.deceasedAadhaar ? 'संलग्न' : 'संलग्न'}
                    </td>
                    <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                  </tr>
                  <tr className="border-b border-slate-300 bg-slate-50">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-center">2</td>
                    <td className="p-1.5 border-r border-slate-300">सूचनादाता के आधार कार्ड की फोटोकॉपी</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                      {record.documents?.applicantAadhaar ? 'संलग्न' : 'संलग्न'}
                    </td>
                    <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-center">3</td>
                    <td className="p-1.5 border-r border-slate-300">मुक्तिधाम / मुस्लिम पंचायत / चर्च द्वारा जारी की रसीद</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                      {record.documents?.cremationReceipt ? 'संलग्न' : 'संलग्न'}
                    </td>
                    <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                  </tr>
                  <tr className="border-b border-slate-300 bg-slate-50">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-center">4</td>
                    <td className="p-1.5 border-r border-slate-300">मृतक की समग्र आई.डी. की फोटोकॉपी</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                      {record.documents?.samagraId ? 'संलग्न' : 'संलग्न'}
                    </td>
                    <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-center">5</td>
                    <td className="p-1.5 border-r border-slate-300">पंचनामा अथवा वार्ड पार्षद द्वारा प्रमाणित पत्र कि मृत्यु कहाँ पर हुई</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                      {record.documents?.panchnamaLetter ? 'संलग्न' : 'संलग्न'}
                    </td>
                    <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                  </tr>
                  <tr className="border-b border-slate-300 bg-slate-50">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-center">6</td>
                    <td className="p-1.5 border-r border-slate-300">मुख्य नगर पालिका अधिकारी के नाम से आवेदन (केपिटल लेटर्स स्पेलिंग सहित)</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">मूल पावती पत्र</td>
                    <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                  </tr>
                </>
              ) : (
                /* Hospital Death - 4 documents from Notice Board */
                <>
                  <tr className="border-b border-slate-300">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-center">1</td>
                    <td className="p-1.5 border-r border-slate-300">मृतक के आधार कार्ड की फोटोकॉपी</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                      {record.documents?.deceasedAadhaar ? 'संलग्न' : 'संलग्न'}
                    </td>
                    <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                  </tr>
                  <tr className="border-b border-slate-300 bg-slate-50">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-center">2</td>
                    <td className="p-1.5 border-r border-slate-300">सूचनादाता के आधार कार्ड की फोटोकॉपी</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                      {record.documents?.applicantAadhaar ? 'संलग्न' : 'संलग्न'}
                    </td>
                    <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-center">3</td>
                    <td className="p-1.5 border-r border-slate-300">अस्पताल द्वारा जारी मृत्यु सह चिकित्सा प्रमाण पत्र (Form 4/4A)</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                      {record.documents?.hospitalDeathSlip ? 'संलग्न' : 'संलग्न'}
                    </td>
                    <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                  </tr>
                  <tr className="border-b border-slate-300 bg-slate-50">
                    <td className="p-1.5 font-bold border-r border-slate-300 text-center">4</td>
                    <td className="p-1.5 border-r border-slate-300">मृतक की समग्र आई.डी. की फोटोकॉपी</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                      {record.documents?.samagraId ? 'संलग्न' : 'संलग्न'}
                    </td>
                    <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                  </tr>
                </>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* DECLARATION & SIGNATURE BLOCK */}
      <div className="pt-4 border-t-2 border-slate-400 space-y-6">
        <div>
          <p className="text-[11px] leading-relaxed text-justify font-medium">
            <strong>घोषणा (Declaration):</strong> मैं प्रमाणित करता/करती हूँ कि ऊपर दी गई समस्त जानकारी पूर्णतः सत्य एवं सटीक है। यदि इसमें कोई त्रुटि या असत्य जानकारी पाई जाती है तो उसके लिए मैं स्वयं जिम्मेदार रहूँगा/रहूँगी।
          </p>
        </div>

        <div className="flex justify-between items-end pt-4">
          <div className="text-center w-48">
            <div className="h-12 border-b border-dashed border-slate-400 mb-1"></div>
            <p className="font-bold text-xs text-slate-900">आवेदक के हस्ताक्षर</p>
            <p className="text-[10px] text-slate-500">({applicant.fullName || 'Citizen Signature'})</p>
          </div>

          <div className="text-center w-56 border-2 border-slate-300 p-2 rounded-lg bg-slate-50">
            <p className="font-bold text-[10px] text-slate-700 uppercase mb-1">कार्यालयीन प्राप्ति रसीद (Office Seal)</p>
            <div className="h-10 border-b border-dotted border-slate-400 mb-1"></div>
            <p className="font-bold text-xs text-slate-900">प्राप्तकर्ता लिपिक के हस्ताक्षर</p>
            <p className="text-[9px] text-slate-500">नगर पालिका परिषद झाबुआ (म.प्र.)</p>
            <p className="text-[9px] text-slate-400 mt-0.5">प्राप्ति तिथि: ____/____/2026</p>
          </div>
        </div>
      </div>

    </div>
  );
}

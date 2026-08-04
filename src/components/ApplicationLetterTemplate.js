'use client';

import React from 'react';

export default function ApplicationLetterTemplate({ record, serviceType = 'death' }) {
  if (!record) return null;

  const isBirth = serviceType === 'birth' || record.applicationNo?.startsWith('BC');

  const child = record.childDetails || {};
  const deceased = record.deceasedDetails || {};
  const mother = record.motherDetails || {};
  const father = record.fatherDetails || {};
  const applicant = record.applicantDetails || {};
  const parentSpouse = record.parentSpouseDetails || {};

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
    <div className="bg-white text-slate-900 p-8 max-w-4xl mx-auto border-4 border-slate-700 shadow-xl relative font-sans text-xs print:p-4 print:border-2">
      
      {/* Official Header */}
      <div className="text-center border-b-2 border-slate-800 pb-4 mb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-14 h-14 bg-emerald-900/10 rounded-full border-2 border-emerald-800 flex items-center justify-center font-bold text-emerald-900 text-xl shrink-0">
            झाबुआ
          </div>
          <div>
            <h2 className="text-[11px] uppercase tracking-widest text-slate-700 font-bold">
              मध्य प्रदेश शासन - लोक स्वास्थ्य एवं परिवार कल्याण विभाग
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
          {isBirth ? 'जन्म प्रमाण पत्र आवेदन पत्र सह पावती' : 'मृत्यु प्रमाण पत्र आवेदन पत्र सह पावती'}
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
      <div className="bg-amber-50 border-2 border-amber-400 p-3 rounded-lg text-amber-950 font-medium mb-5 leading-relaxed">
        <span className="font-bold text-amber-900 underline block mb-1">📌 महत्वपूर्ण निर्देश (IMPORTANT INSTRUCTIONS):</span>
        कृपया इस ऑनलाइन आवेदन पत्र का <strong>प्रिंट आउट (Hard Copy)</strong> निकालें और अपने <strong>संलग्न मूल दस्तावेजों एवं छायाप्रतियों</strong> के साथ <strong>नगर पालिका कार्यालय झाबुआ (जन्म-मृत्यु पंजीकरण शाखा)</strong> में भौतिक सत्यापन (Cross Verification) हेतु जमा करें।
      </div>

      {/* Details Section */}
      {isBirth ? (
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

      {/* ATTACHED DOCUMENTS CHECKLIST */}
      <div className="mb-5">
        <h3 className="font-bold text-slate-900 border-b border-slate-400 pb-1 mb-2 uppercase text-xs">
          3. संलग्न दस्तावेजों की सूची (Attached Supporting Documents Checklist)
        </h3>
        <table className="w-full border-collapse border border-slate-400 text-xs">
          <thead>
            <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-400">
              <th className="p-1.5 text-left border-r border-slate-400 w-12">क्र.</th>
              <th className="p-1.5 text-left border-r border-slate-400">दस्तावेज का नाम (Document Name)</th>
              <th className="p-1.5 text-center border-r border-slate-400 w-28">ऑनलाइन स्थिति</th>
              <th className="p-1.5 text-center w-32">कार्यालयीन भौतिक जांच [ ✓ ]</th>
            </tr>
          </thead>
          <tbody>
            {isBirth ? (
              <>
                <tr className="border-b border-slate-300">
                  <td className="p-1.5 font-bold border-r border-slate-300 text-center">1</td>
                  <td className="p-1.5 border-r border-slate-300">अस्पताल जन्म डिस्चार्ज कार्ड / पर्ची (Hospital Birth Slip)</td>
                  <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                    {record.documents?.hospitalSlip?.fileName ? 'संलग्न' : 'संलग्न'}
                  </td>
                  <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                </tr>
                <tr className="border-b border-slate-300 bg-slate-50">
                  <td className="p-1.5 font-bold border-r border-slate-300 text-center">2</td>
                  <td className="p-1.5 border-r border-slate-300">माता का आधार कार्ड फोटो (Mother Aadhaar Photo)</td>
                  <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                    {record.documents?.motherAadhaar?.fileName ? 'संलग्न' : 'संलग्न'}
                  </td>
                  <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-1.5 font-bold border-r border-slate-300 text-center">3</td>
                  <td className="p-1.5 border-r border-slate-300">पिता का आधार कार्ड फोटो (Father Aadhaar Photo)</td>
                  <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                    {record.documents?.fatherAadhaar?.fileName ? 'संलग्न' : 'संलग्न'}
                  </td>
                  <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                </tr>
                <tr className="border-b border-slate-300 bg-slate-50">
                  <td className="p-1.5 font-bold border-r border-slate-300 text-center">4</td>
                  <td className="p-1.5 border-r border-slate-300">निवास प्रमाण (Address Proof)</td>
                  <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                    {record.documents?.addressProof?.fileName ? 'संलग्न' : 'संलग्न'}
                  </td>
                  <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                </tr>
              </>
            ) : (
              <>
                <tr className="border-b border-slate-300">
                  <td className="p-1.5 font-bold border-r border-slate-300 text-center">1</td>
                  <td className="p-1.5 border-r border-slate-300">अस्पताल मृत्यु प्रमाण पत्र / दाह संस्कार रसीद (Hospital/Cremation Slip)</td>
                  <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                    {record.documents?.deathSlip?.fileName ? 'संलग्न' : 'संलग्न'}
                  </td>
                  <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                </tr>
                <tr className="border-b border-slate-300 bg-slate-50">
                  <td className="p-1.5 font-bold border-r border-slate-300 text-center">2</td>
                  <td className="p-1.5 border-r border-slate-300">आवेदक आधार कार्ड (Applicant Aadhaar Photo)</td>
                  <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                    {record.documents?.applicantAadhaar?.fileName ? 'संलग्न' : 'संलग्न'}
                  </td>
                  <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-1.5 font-bold border-r border-slate-300 text-center">3</td>
                  <td className="p-1.5 border-r border-slate-300">निवास पता प्रमाण (Address Proof Photo)</td>
                  <td className="p-1.5 border-r border-slate-300 text-center font-bold text-emerald-800">
                    {record.documents?.addressProof?.fileName ? 'संलग्न' : 'संलग्न'}
                  </td>
                  <td className="p-1.5 text-center font-mono text-slate-400">[  ] सत्यापित</td>
                </tr>
              </>
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

import QRCodeGenerator from './QRCodeGenerator';

export default function DeathCertificateTemplate({ record }) {
  if (!record) return null;

  const deceased = record.deceasedDetails || {};
  const applicant = record.applicantDetails || {};
  const parentSpouse = record.parentSpouseDetails || {};
  const statistical = record.statisticalDetails || {};

  const formattedDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const presentAddressText = formatAddress(deceased.presentAddress);
  const permanentAddressText = formatAddress(deceased.permanentAddress);
  const applicantAddressText = [
    applicant.address,
    applicant.villageCity,
    applicant.district,
    applicant.state,
    applicant.pincode && `पिन: ${applicant.pincode}`
  ].filter(Boolean).join(', ');

  return (
    <div className="print-page-a4 print-container bg-white text-slate-900 p-6 max-w-4xl mx-auto border-8 border-double border-amber-900/40 shadow-2xl relative font-serif print:p-4 print:border-4 print:max-h-none print:overflow-visible">
      {/* Subtle Official Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] overflow-hidden select-none z-0">
        <img src="/mp-logo.png" alt="" className="w-[420px] h-[420px] object-contain" />
      </div>
      <div className="border border-amber-800/30 p-6 relative">
        
        <div className="text-center border-b-2 border-amber-900/30 pb-4 mb-6">
          <img 
            src="/mp-logo.png" 
            alt="मध्य प्रदेश शासन" 
            className="w-20 h-20 mx-auto mb-2 object-contain" 
          />
          <h2 className="text-sm uppercase tracking-widest text-slate-600 font-semibold mb-1">
            मध्य प्रदेश शासन - लोक स्वास्थ्य एवं परिवार कल्याण विभाग (Govt. of MP - Dept. of Public Health & Family Welfare)
          </h2>
          <h1 className="text-2xl font-bold text-amber-950 uppercase tracking-wider">
            कार्यालय नगर पालिका परिषद झाबुआ (म.प्र.) (Office of Nagar Palika Parishad Jhabua, MP)
          </h1>
          <h3 className="text-xl font-extrabold text-blue-950 underline decoration-amber-700 decoration-2 underline-offset-4 mt-2">
            मृत्यु प्रमाण पत्र (DEATH CERTIFICATE)
          </h3>
          <p className="text-xs text-slate-600 mt-1 italic">
            (जन्म और मृत्यु पंजीकरण अधिनियम, 1969 की धारा 12/17 तथा मध्य प्रदेश जन्म-मृत्यु पंजीकरण नियम, 1999 के अधीन जारी)
          </p>
        </div>

        <div className="flex justify-between items-center bg-amber-500/10 p-3 rounded border border-amber-700/20 text-xs font-semibold text-amber-950 mb-6">
          <div>
            पंजीकरण क्रमांक (Reg. No): <span className="font-bold text-blue-900 font-mono text-sm">{record.certificateNo || `DC-CERT-${record.id?.slice(-6)}`}</span>
          </div>
          <div>
            आवेदन क्रमांक (App No): <span className="font-mono text-slate-800">{record.applicationNo}</span>
          </div>
          <div>
            पंजीकरण तिथि (Reg Date): <span className="font-mono text-slate-800">{formattedDate(record.approvedAt || record.updatedAt)}</span>
          </div>
        </div>

        <p className="text-sm leading-relaxed mb-6 text-justify">
          प्रमाणित किया जाता है कि निम्नलिखित जानकारी मृत्यु के मूल अभिलेख से ली गई है, जो कि नगर पालिका परिषद झाबुआ, तहसील झाबुआ, जिला झाबुआ, राज्य मध्य प्रदेश के रजिस्टर में दर्ज है:
        </p>

        <table className="w-full text-xs border-collapse border border-slate-400 mb-6">
          <tbody>
            <tr className="border-b border-slate-300 bg-slate-50">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300 w-1/3">मृतक का पूरा नाम (Full Name of Deceased):</td>
              <td className="p-2.5 font-bold text-slate-900 text-sm">स्व. {deceased.fullName || 'N/A'}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">लिंग (Gender) / आयु (Age):</td>
              <td className="p-2.5 text-slate-900">{deceased.gender || 'N/A'} / {deceased.age ? `${deceased.age} वर्ष (yrs)` : 'N/A'}</td>
            </tr>
            <tr className="border-b border-slate-300 bg-slate-50">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">मृत्यु की तिथि (Date of Death):</td>
              <td className="p-2.5 font-semibold text-blue-950 text-sm">{formattedDate(deceased.dateOfDeath)}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">मृत्यु का स्थान (Place of Death):</td>
              <td className="p-2.5 text-slate-900">
                {deceased.hospitalName || deceased.placeOfDeath || 'N/A'} ({deceased.placeType || 'Hospital/Home'})
              </td>
            </tr>
            <tr className="border-b border-slate-300 bg-slate-50">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">मृतक का वर्तमान पता (Present Address at Death):</td>
              <td className="p-2.5 text-slate-900">{presentAddressText || deceased.placeOfDeath || 'झाबुआ, मध्य प्रदेश'}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">मृतक का स्थायी पता (Permanent Address):</td>
              <td className="p-2.5 text-slate-900">{permanentAddressText || presentAddressText || 'झाबुआ, मध्य प्रदेश'}</td>
            </tr>
            <tr className="border-b border-slate-300 bg-slate-50">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">पिता / पति का नाम (Father / Husband Name):</td>
              <td className="p-2.5 text-slate-900">{parentSpouse.fatherHusbandName || 'N/A'}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">माता का नाम (Mother's Name):</td>
              <td className="p-2.5 text-slate-900">{parentSpouse.motherName || 'N/A'}</td>
            </tr>
            <tr className="border-b border-slate-300 bg-slate-50">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">चिकित्सीय प्रमाणन (Medical Certification):</td>
              <td className="p-2.5 text-slate-900">
                {statistical.isMedicallyCertified || 'हाँ (Yes)'} {deceased.causeOfDeath ? `| कारण (Cause): ${deceased.causeOfDeath}` : ''}
              </td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">आवेदक / सूचनाकर्ता (Applicant / Informant):</td>
              <td className="p-2.5 text-slate-900">{applicant.fullName || 'N/A'} ({applicant.relationWithDeceased || 'Rel'})</td>
            </tr>
            <tr>
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">सूचनाकर्ता का पूर्ण पता (Informant Address):</td>
              <td className="p-2.5 text-slate-900">{applicantAddressText || 'N/A'}</td>
            </tr>
          </tbody>
        </table>

        <div className="flex items-end justify-between pt-6 border-t border-amber-900/30">
          
          <div className="text-center">
            <div className="w-24 h-24 border-2 border-slate-800 p-1 mx-auto mb-1 bg-white flex items-center justify-center">
              <QRCodeGenerator 
                value={`https://jhabua-nagarpalika-aapke-dwar.netlify.app/?appNo=${record.applicationNo || record.id}`}
                size={84}
              />
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

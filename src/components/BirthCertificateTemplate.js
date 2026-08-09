import QRCodeGenerator from './QRCodeGenerator';

export default function BirthCertificateTemplate({ record }) {
  if (!record) return null;

  const child = record.childDetails || {};
  const mother = record.motherDetails || {};
  const father = record.fatherDetails || {};
  const applicant = record.applicantDetails || {};

  const formatDateStr = (dStr) => {
    if (!dStr) return 'N/A';
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

  const formatAddress = (addrObj) => {
    if (!addrObj) return 'N/A';
    if (addrObj.isSameAsPresent) return 'वर्तमान पते के समान (Same as Present Address)';
    const parts = [
      addrObj.houseNo && `मकान क्र. ${addrObj.houseNo}`,
      addrObj.street,
      addrObj.villageCity || addrObj.city,
      addrObj.district || 'झाबुआ',
      addrObj.state || 'मध्य प्रदेश',
      addrObj.pincode && `पिन: ${addrObj.pincode}`
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'झाबुआ, मध्य प्रदेश';
  };

  const renderAadhaarBoxes = (aadhaarStr) => {
    const raw = (aadhaarStr || '').replace(/\D/g, '');
    const digits = raw ? raw.padEnd(12, 'X').slice(0, 12).split('') : Array(12).fill('X');
    return (
      <div className="inline-flex items-center gap-0.5 font-mono text-[10px] sm:text-xs">
        {digits.map((d, i) => (
          <span
            key={i}
            className="w-3.5 sm:w-4 h-4 sm:h-5 border border-slate-700 flex items-center justify-center bg-slate-50 text-slate-900 font-bold"
          >
            {d}
          </span>
        ))}
      </div>
    );
  };

  const presentAddressText = formatAddress(child.presentAddress || applicant);
  const permanentAddressText = formatAddress(child.permanentAddress || child.presentAddress || applicant);
  const regNo = record.certificateNo || `BC-${new Date().getFullYear()}-${record.applicationNo?.slice(-6) || record.id?.slice(-6)}`;
  const regDate = formatDateStr(record.approvedAt || record.createdAt || Date.now());
  const issueDate = formatDateStr(record.approvedAt || Date.now());

  return (
    <div className="print-page-a4 print-container bg-white text-slate-900 p-6 sm:p-8 max-w-4xl mx-auto border-2 border-slate-900 shadow-2xl relative font-serif text-xs leading-normal print:p-4 print:max-h-none print:shadow-none">
      {/* Outer Border */}
      <div className="border border-slate-800 p-4 sm:p-6 relative space-y-4">
        
        {/* TOP HEADER SECTION */}
        <div className="flex justify-between items-start border-b border-slate-300 pb-3">
          {/* Left: State Govt emblem box */}
          <div className="w-24 text-center border border-slate-400 p-1 rounded bg-slate-50 shrink-0">
            <img src="/mp-logo.png" alt="State Govt Emblem" className="w-12 h-12 mx-auto object-contain mb-0.5" />
            <span className="text-[8px] font-bold text-slate-600 uppercase block">State Govt. Emblem</span>
          </div>

          {/* Center Title */}
          <div className="text-center flex-1 px-2 space-y-0.5">
            <h2 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-800">
              मध्य प्रदेश सरकार / GOVERNMENT OF MADHYA PRADESH
            </h2>
            <h3 className="text-[10px] font-bold text-slate-600 uppercase">
              नगरीय विकास एवं आवास विभाग / DEPARTMENT OF URBAN DEVELOPMENT & HOUSING
            </h3>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-950 uppercase tracking-wide">
              कार्यालय नगर पालिका परिषद झाबुआ (म.प्र.) / Office of Nagar Palika Parishad Jhabua (M.P.)
            </h1>
          </div>

          {/* Right: Form-5 & CRS Logo */}
          <div className="w-24 text-right shrink-0">
            <span className="text-[10px] font-bold text-slate-800 block">प्रपत्र - 5</span>
            <span className="text-[9px] font-bold text-slate-600 block mb-1">Form-5</span>
            <div className="w-12 h-12 ml-auto border border-slate-900 bg-slate-900 text-white rounded flex items-center justify-center font-bold text-[9px] text-center leading-tight">
              CRS ORGI
            </div>
          </div>
        </div>

        {/* MAIN CERTIFICATE TITLE */}
        <div className="text-center space-y-1">
          <h2 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-wider underline decoration-2 underline-offset-4">
            जन्म प्रमाण-पत्र / BIRTH CERTIFICATE
          </h2>
          <p className="text-[9px] sm:text-[10px] text-slate-600 italic max-w-2xl mx-auto leading-tight">
            (जन्म और मृत्यु रजिस्ट्रीकरण अधिनियम, 1969 (2023 में संशोधित) की धारा 12 / 17 तथा मध्य प्रदेश जन्म और मृत्यु रजिस्ट्रीकरण नियम के नियम 8 / 13 के अंतर्गत जारी किया गया)
            <br />
            (Issued under Section 12 / 17 of the Registration of Births and Deaths Act, 1969 (amended in 2023) and Rule 8 / 13 of the Madhya Pradesh Registration of Births and Deaths Rules)
          </p>
        </div>

        {/* CERTIFICATION TEXT */}
        <div className="text-[10px] sm:text-[11px] text-slate-900 leading-relaxed text-justify bg-slate-50/50 p-2.5 rounded border border-slate-200">
          यह प्रमाणित किया जाता है कि निम्नलिखित सूचना जन्म के मूल लेख से ली गई है जो कि (स्थानीय क्षेत्र) <strong>नगर पालिका परिषद झाबुआ</strong>, उप-जिला <strong>झाबुआ</strong>, जिला <strong>झाबुआ</strong>, राज्य <strong>मध्य प्रदेश</strong> के रजिस्टर में उल्लिखित है।
          <br />
          <span className="text-slate-600 italic">
            (This is to certify that the following information has been taken from the original record of birth which is the register for (local area/local body) Nagar Palika Parishad Jhabua of Sub-district Jhabua of District Jhabua of State/Union territory Madhya Pradesh)
          </span>
        </div>

        {/* BILINGUAL FORM TABLE */}
        <table className="w-full text-[10px] sm:text-xs border-collapse border border-slate-400">
          <tbody>
            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold text-slate-800 border-r border-slate-300 w-1/2">
                नाम / Name:
              </td>
              <td className="p-2 font-black text-slate-950 text-xs sm:text-sm uppercase">
                {child.fullName || 'नाम दर्ज नहीं (Not Named)'}
              </td>
            </tr>

            <tr className="border-b border-slate-300 bg-slate-50/60">
              <td className="p-2 font-bold text-slate-800 border-r border-slate-300">
                लिंग / Sex:
              </td>
              <td className="p-2 font-bold text-slate-900">
                {child.gender || 'N/A'}
              </td>
            </tr>

            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold text-slate-800 border-r border-slate-300">
                जन्म तिथि / Date of Birth:
              </td>
              <td className="p-2 font-bold text-slate-900">
                {formatDateStr(child.dateOfBirth)}
              </td>
            </tr>

            <tr className="border-b border-slate-300 bg-slate-50/60">
              <td className="p-2 font-bold text-slate-800 border-r border-slate-300">
                जन्म स्थान / Place of Birth:
              </td>
              <td className="p-2 font-medium text-slate-900">
                {child.placeType === 'Hospital' ? `${child.hospitalName || 'जिला अस्पताल झाबुआ'}, झाबुआ` : child.placeOfBirth || 'झाबुआ (म.प्र.)'}
              </td>
            </tr>

            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold text-slate-800 border-r border-slate-300">
                माता का नाम / Name of Mother:
              </td>
              <td className="p-2 font-bold text-slate-900 uppercase">
                {mother.fullName || 'N/A'}
              </td>
            </tr>

            <tr className="border-b border-slate-300 bg-slate-50/60">
              <td className="p-2 font-bold text-slate-800 border-r border-slate-300">
                माता का आधार नं. / Aadhaar No. of Mother:
              </td>
              <td className="p-2">
                {renderAadhaarBoxes(mother.aadhaarNo)}
              </td>
            </tr>

            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold text-slate-800 border-r border-slate-300">
                पिता का नाम / Name of Father:
              </td>
              <td className="p-2 font-bold text-slate-900 uppercase">
                {father.fullName || 'N/A'}
              </td>
            </tr>

            <tr className="border-b border-slate-300 bg-slate-50/60">
              <td className="p-2 font-bold text-slate-800 border-r border-slate-300">
                पिता का आधार नं. / Aadhaar No. of Father:
              </td>
              <td className="p-2">
                {renderAadhaarBoxes(father.aadhaarNo)}
              </td>
            </tr>

            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold text-slate-800 border-r border-slate-300">
                बच्चे के जन्म के समय माता पिता का पता /
                <br />
                <span className="font-normal text-slate-600">Address of parents at the time of birth of the child:</span>
              </td>
              <td className="p-2 font-medium text-slate-900 leading-tight">
                {presentAddressText}
              </td>
            </tr>

            <tr className="border-b border-slate-300 bg-slate-50/60">
              <td className="p-2 font-bold text-slate-800 border-r border-slate-300">
                माता पिता का स्थायी पता /
                <br />
                <span className="font-normal text-slate-600">Permanent address of parents:</span>
              </td>
              <td className="p-2 font-medium text-slate-900 leading-tight">
                {permanentAddressText}
              </td>
            </tr>

            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold text-slate-800 border-r border-slate-300">
                पंजीकरण संख्या / Registration No:
              </td>
              <td className="p-2 font-bold font-mono text-slate-950">
                {regNo}
              </td>
            </tr>

            <tr className="border-b border-slate-300 bg-slate-50/60">
              <td className="p-2 font-bold text-slate-800 border-r border-slate-300">
                पंजीकरण दिनांक / Date of Registration:
              </td>
              <td className="p-2 font-bold text-slate-900">
                {regDate}
              </td>
            </tr>

            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold text-slate-800 border-r border-slate-300">
                टिप्पणी / Remarks (if any):
              </td>
              <td className="p-2 text-slate-800 italic">
                {record.lastOfficerRemark || 'सत्यापित एवं स्वीकृत (Verified & Approved)'}
              </td>
            </tr>

            <tr>
              <td className="p-2 font-bold text-slate-800 border-r border-slate-300">
                जारी करने की तिथि / Date of Issue:
              </td>
              <td className="p-2 font-bold text-slate-900">
                {issueDate}
              </td>
            </tr>
          </tbody>
        </table>

        {/* FOOTER SIGNATURE & SEAL SECTION */}
        <div className="pt-4 flex justify-between items-end border-t border-slate-300">
          {/* QR Code Verification */}
          <div className="text-center space-y-1">
            <div className="p-1 bg-white border border-slate-300 rounded inline-block">
              <QRCodeGenerator 
                value={`https://jhabua-nagarpalika-aapke-dwar.netlify.app/verify?type=birth&regNo=${encodeURIComponent(regNo)}&name=${encodeURIComponent(child.fullName || '')}`}
                size={80}
              />
            </div>
            <span className="block text-[8px] font-mono text-slate-500">स्कैन कर डिजिटल सत्यापन करें</span>
          </div>

          {/* Issuing Authority Signature & Round Seal */}
          <div className="text-right space-y-1 text-[10px] sm:text-xs">
            <div className="inline-block border border-dashed border-emerald-700/60 bg-emerald-50/40 p-2 rounded text-center mb-1">
              <span className="text-[9px] font-extrabold text-emerald-900 block">डिजिटल हस्ताक्षरित एवं मोहरबंद</span>
              <span className="text-[8px] text-emerald-700 block">मुख्य नगर पालिका अधिकारी, झाबुआ</span>
            </div>
            <p className="font-bold text-slate-900">प्राधिकारी के हस्ताक्षर / Signature of the issuing authority</p>
            <p className="text-[10px] text-slate-600">
              प्राधिकारी का पता / Address of the issuing authority:
              <br />
              <strong>मुख्य नगर पालिका अधिकारी, नगर पालिका परिषद झाबुआ (म.प्र.)</strong>
            </p>
            <p className="font-bold text-slate-900 text-[10px]">मोहर / Seal</p>
          </div>
        </div>

        {/* BOTTOM MOTTO SLOGAN */}
        <div className="text-center pt-2 border-t border-slate-200">
          <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-700 tracking-wider">
            प्रत्येक जन्म एवं मृत्यु का पंजीकरण सुनिश्चित करें | Ensure registration of every birth and death
          </p>
        </div>

      </div>
    </div>
  );
}

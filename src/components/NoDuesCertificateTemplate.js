import React from 'react';
import QRCodeGenerator from './QRCodeGenerator';

export default function NoDuesCertificateTemplate({ record }) {
  if (!record) return null;

  const applicant = record.applicantDetails || {};
  const property = record.propertyDetails || {};
  const tax = record.taxDetails || {};

  const formatDateStr = (dStr) => {
    if (!dStr) return new Date().toLocaleDateString('en-GB');
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

  const certificateNo = record.certificateNo || `PT-NOC-0179-${record.applicationNo?.slice(-5) || '00383'}`;
  const issueDate = formatDateStr(record.approvedAt || record.createdAt || Date.now());
  const paymentDate = formatDateStr(tax.paymentDate || record.createdAt || Date.now());

  const applicantName = (applicant.fullName || 'APPLICANT NAME').toUpperCase();
  const fatherName = (applicant.fatherHusbandName || 'BABU LAL').toUpperCase();
  const propertyId = property.propertyId || property.propertyNo || '1004257188';
  
  const addressText = property.address || `11, CHANDRASHEKHAR AZAD MARG/TTOGB-Ward-${property.wardNo || '6'}, Ward-${property.wardNo || '6'}, Zone-${property.zoneNo || '1'}, Jhabua, ${property.pincode || '457661'}`;
  
  const plotArea = property.plotArea || '900.0';
  const builtupArea = property.builtupArea || '900.0';
  const openArea = property.openArea || (parseFloat(plotArea) - parseFloat(builtupArea) > 0 ? (parseFloat(plotArea) - parseFloat(builtupArea)).toFixed(1) : '0.0');

  const financialYear = tax.financialYear || '2026-27';
  const triRefNo = tax.triRefNo || 'PC-0179-03-6-1-00117';
  const amountPaid = tax.amountPaid ? `${parseFloat(tax.amountPaid).toFixed(1)}` : '7098.0';

  const officerName = record.lastOfficerName || 'Milan Patel';

  return (
    <div className="print-page-a4 print-container bg-white text-slate-900 p-8 sm:p-12 max-w-4xl mx-auto border-2 border-slate-900 shadow-2xl relative font-sans text-sm leading-relaxed print:p-6 print:max-h-none print:shadow-none">
      {/* Outer Border */}
      <div className="border border-slate-800 p-6 sm:p-8 relative space-y-6">

        {/* TOP CENTER LOGO & TITLE */}
        <div className="text-center space-y-2 border-b border-slate-200 pb-4">
          <img 
            src="/mp-logo.png" 
            alt="Jhabua Nagar Palika" 
            className="w-20 h-20 mx-auto object-contain drop-shadow-sm mb-1" 
          />
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
            Jhabua Nagar Palika
          </h1>
        </div>

        {/* REFERENCE ROW */}
        <div className="flex justify-between items-center text-xs sm:text-sm font-bold border-b border-slate-300 pb-3">
          <div>
            <span>क्रमांक: </span>
            <span className="font-mono text-slate-950 font-extrabold">{certificateNo}</span>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-950 underline decoration-2 underline-offset-4">
              नो ड्यूज प्रमाण पत्र
            </h2>
          </div>
          <div>
            <span>दिनांक: </span>
            <span className="font-mono text-slate-950 font-extrabold">{issueDate}</span>
          </div>
        </div>

        {/* MAIN OFFICIAL CERTIFICATE BODY PARAGRAPH */}
        <div className="text-slate-900 text-xs sm:text-sm leading-loose space-y-4 text-justify">
          <p>
            यह प्रमाणित किया जाता है कि <strong>MR. {applicantName} , S/O {fatherName}</strong> , S/O . का नाम ई-सेवा पोर्टल पर पता <strong>{addressText}</strong> प्रॉपर्टी आईडी क्रमांक <strong>{propertyId}</strong> कुल प्लाट क्षेत्रफल <strong>{plotArea}</strong> वर्ग फुट, बिल्टअप एरिया क्षेत्रफल <strong>{builtupArea}</strong> वर्ग फुट, ओपन एरिया क्षेत्रफल <strong>{openArea}</strong> वर्ग फुट पर दर्ज होकर वर्ष <strong>{financialYear}</strong> तक बकाया व वर्तमान कर टी०आर०आई०/रिफरेंस <strong>{triRefNo}</strong> दिनांक <strong>{paymentDate}</strong> से <strong>{amountPaid}</strong> जमा है व ई-सेवा पोर्टल पर दर्ज उक्त सम्पत्ति पर कोई भी कर एवं अन्य कर बकाया नही है ।
          </p>

          <p className="font-medium">
            आवेदक की मांग एवं SAF अनुसार यह नो ड्यूज प्रमाण पत्र जारी किया जाता है ।
          </p>
          <p className="font-medium">
            Applicant Email: {applicant.email || 'N/A'}
          </p>

          <p className="font-medium italic text-slate-700">
            उक्त प्रमाण पत्र स्वामित्व संबंधी अधिकार को सिद्ध नही करता ।
          </p>
        </div>

        {/* QR CODE & OFFICER DIGITAL SIGNATURE BLOCK */}
        <div className="pt-8 flex justify-between items-end border-t border-slate-300">
          
          {/* Left: Dynamic QR Verification */}
          <div className="text-center space-y-1">
            <div className="p-1.5 bg-white border border-slate-300 rounded inline-block">
              <QRCodeGenerator 
                value={`https://jhabua-nagarpalika-aapke-dwar.netlify.app/verify?type=no_dues&certNo=${encodeURIComponent(certificateNo)}&propertyId=${encodeURIComponent(propertyId)}`}
                size={85}
              />
            </div>
            <span className="block text-[9px] font-mono text-slate-500 font-bold">स्कैन कर डिजिटल सत्यापन करें</span>
          </div>

          {/* Right: E-Signature Block matching exact screenshot layout */}
          <div className="text-right space-y-1">
            <div className="inline-block text-left p-2 border-l-2 border-rose-500 bg-slate-50/80 rounded">
              <div className="text-base sm:text-lg font-bold text-slate-900 font-serif leading-none">
                {officerName}
              </div>
              <div className="text-[10px] text-slate-600 font-mono mt-1 leading-tight">
                Digitally signed<br />
                by {officerName}<br />
                Date: {new Date().getFullYear()}.07.28<br />
                18:18:45 +05'30'
              </div>
              <span className="text-[11px] font-bold text-slate-700 block mt-1">E-sign</span>
            </div>

            <div className="text-xs font-bold text-slate-900 pt-1 leading-tight">
              ज़ोनल ऑफिसर/ सी. एम. ओ./ उपायुक्त राजस्व/ सहायक राजस्व अधिकारी /अपर आयुक्त
              <br />
              <span className="font-extrabold text-slate-950">Jhabua Nagar Palika</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

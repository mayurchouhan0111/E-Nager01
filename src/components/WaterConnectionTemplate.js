import QRCodeGenerator from './QRCodeGenerator';

export default function WaterConnectionTemplate({ record }) {
  if (!record) return null;

  const applicant = record.applicantDetails || {};
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

  return (
    <div className="bg-white text-slate-900 p-8 max-w-4xl mx-auto border-8 border-double border-teal-900/40 shadow-2xl relative font-serif">
      <div className="border border-teal-800/30 p-6 relative">
        
        {/* Official Header */}
        <div className="text-center border-b-2 border-teal-900/30 pb-4 mb-6">
          <img 
            src="/mp-logo.png" 
            alt="मध्य प्रदेश शासन" 
            className="w-20 h-20 mx-auto mb-2 object-contain" 
          />
          <h2 className="text-sm uppercase tracking-widest text-slate-600 font-semibold mb-1">
            मध्य प्रदेश शासन — नगरीय विकास एवं आवास विभाग (Govt. of MP — Urban Development & Housing)
          </h2>
          <h1 className="text-2xl font-bold text-teal-950 uppercase tracking-wider">
            कार्यालय नगर पालिका परिषद झाबुआ (म.प्र.) (Office of Nagar Palika Parishad Jhabua, MP)
          </h1>
          <h3 className="text-xl font-extrabold text-teal-900 underline decoration-teal-700 decoration-2 underline-offset-4 mt-2">
            नल कनेक्शन स्वीकृत आदेश (WATER CONNECTION SANCTION PERMIT)
          </h3>
          <p className="text-xs text-slate-600 mt-1 italic">
            (मध्य प्रदेश नगरपालिका निगम / जल प्रदाय नियम एवं उपनियम के अंतर्गत स्वीकृत)
          </p>
        </div>

        {/* Permit & Registration Details */}
        <div className="flex justify-between items-center bg-teal-500/10 p-3 rounded border border-teal-700/20 text-xs font-semibold text-teal-950 mb-6">
          <div>
            स्वीकृति क्रमांक (Permit No): <span className="font-bold text-teal-900 font-mono text-sm">{record.permitNo || `WC-PERMIT-${record.id?.slice(-6)}`}</span>
          </div>
          <div>
            आवेदन क्रमांक (App No): <span className="font-mono text-slate-800">{record.applicationNo}</span>
          </div>
          <div>
            स्वीकृति तिथि (Sanction Date): <span className="font-mono text-slate-800">{formattedDate(record.approvedAt || record.updatedAt)}</span>
          </div>
        </div>

        <p className="text-sm leading-relaxed mb-6 text-justify">
          सर्वसाधारण एवं संबंधित आवेदक को सूचित किया जाता है कि नगर पालिका परिषद झाबुआ के जल प्रदाय विभाग द्वारा नीचे अंकित विवरण अनुसार नए नल कनेक्शन स्वीकृति का अनुमोदन प्रदान किया गया है:
        </p>

        {/* Data Table */}
        <table className="w-full text-xs border-collapse border border-slate-400 mb-6">
          <tbody>
            <tr className="border-b border-slate-300 bg-slate-50">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300 w-1/3">उपभोक्ता / आवेदक का नाम (Consumer Name):</td>
              <td className="p-2.5 font-bold text-teal-950 text-sm">{applicant.fullName || 'N/A'}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">पिता / पति का नाम:</td>
              <td className="p-2.5 font-semibold text-slate-900">{applicant.fatherHusbandName || 'N/A'}</td>
            </tr>
            <tr className="border-b border-slate-300 bg-slate-50">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">भवन क्रमांक एवं वार्ड (Building & Ward No):</td>
              <td className="p-2.5 font-bold text-slate-900">भवन क्र. {property.houseNo || 'N/A'}, वार्ड क्र. {applicant.wardNo || 'N/A'}, झाबुआ</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">स्वीकृत कनेक्शन साइज (Connection Size):</td>
              <td className="p-2.5 font-bold text-teal-900 text-sm">{property.connectionSize || '1/2 इंच'} (फेरूल साइज: {property.ferruleSize || '1/2 इंच'})</td>
            </tr>
            <tr className="border-b border-slate-300 bg-slate-50">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">उपयोग का प्रयोजन (Usage Purpose):</td>
              <td className="p-2.5 text-slate-900 font-semibold">{property.usagePurpose || 'घरेलू (Domestic)'}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">स्वीकृत टोंटी की संख्या (No. of Taps):</td>
              <td className="p-2.5 text-slate-900 font-bold">{property.tapCount || '1'} टोंटी</td>
            </tr>
            <tr className="border-b border-slate-300 bg-slate-50">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">मुख्य पाइप लाइन से दूरी एवं पाइप नाप:</td>
              <td className="p-2.5 text-slate-900">दूरी: {property.distanceMainPipe || 'N/A'} फीट | पाइप साइज: {property.pipeSize || '1/2 इंच'} (कुल लम्बाई: {property.totalPipeLength || 'N/A'} फीट)</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">अधिकृत लाइसेंसधारी प्लम्बर:</td>
              <td className="p-2.5 text-slate-900 font-bold">{plumber.plumberName || 'नगर पालिका अधिकृत प्लम्बर'} (लाइसेंस क्र. {plumber.plumberLicenseNo || 'N/A'})</td>
            </tr>
            <tr className="bg-slate-50">
              <td className="p-2.5 font-bold text-slate-700 border-r border-slate-300">आवेदक का संपर्क व पता:</td>
              <td className="p-2.5 text-slate-900 font-mono">फोन: {applicant.mobile || 'N/A'} | पता: {applicant.address || 'झाबुआ (म.प्र.)'}</td>
            </tr>
          </tbody>
        </table>

        {/* Conditions */}
        <div className="bg-slate-50 p-3.5 rounded border border-slate-300 text-[11px] leading-relaxed mb-6">
          <p className="font-bold text-slate-800 mb-1">📌 स्वीकृति की मुख्य शर्तें (Permit Conditions):</p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-700">
            <li>नल कनेक्शन का कार्य केवल नगर पालिका परिषद द्वारा अधिकृत लाइसेंसधारी प्लम्बर से ही सम्पन्न कराया जाए।</li>
            <li>जल प्रदाय नियमों का उल्लंघन करने या अनधिकृत मोटर लगाने पर कनेक्शन काट दिया जा सकेगा।</li>
            <li>जल कर का समय पर भुगतान करना अनिवार्य होगा।</li>
          </ul>
        </div>

        {/* Verification Seals Footer */}
        <div className="flex items-end justify-between pt-6 border-t border-teal-900/30">
          <div className="text-center">
            <div className="w-24 h-24 border-2 border-slate-800 p-1 mx-auto mb-1 bg-white flex items-center justify-center">
              <QRCodeGenerator 
                value={`https://jhabua-nagarpalika-aapke-dwar.netlify.app/?appNo=${record.applicationNo || record.id}`}
                size={84}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500 block">QR VERIFIED OFFICIAL PERMIT</span>
          </div>

          <div className="text-center pr-4">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-teal-900/40 mx-auto mb-2 flex items-center justify-center text-[10px] text-teal-900 font-bold tracking-tighter">
              सील नगर पालिका (Water Dept Seal)
            </div>
            <div className="font-bold text-xs text-slate-900">मुख्य नगर पालिका अधिकारी / जल कार्य प्रभारी</div>
            <div className="text-xs text-slate-700 font-semibold">नगर पालिका परिषद झाबुआ (म.प्र.)</div>
            <div className="text-[10px] text-slate-500 mt-1">जारी तिथि: {formattedDate(new Date())}</div>
          </div>
        </div>

      </div>
    </div>
  );
}

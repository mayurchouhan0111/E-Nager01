'use client'

import { useState } from 'react'
import Link from 'next/link'
import ServiceHeader from '@/components/ServiceHeader'
import toast from 'react-hot-toast'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { Shield, Mail, Phone, MapPin, Send, HelpCircle, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react'

export default function GrievancePage() {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    applicationNo: '',
    grievanceType: 'Data Protection & Privacy',
    description: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedId, setSubmittedId] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!formData.fullName || !formData.mobile || !formData.description) {
      toast.error('कृपया नाम, मोबाइल नंबर एवं शिकायत का विवरण दर्ज करें')
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading('शिकायत दर्ज की जा रही है...')

    try {
      const ticketNo = 'GRV-' + Date.now().toString().slice(-6)
      const docRef = await addDoc(collection(db, 'grievances'), {
        ticketNo,
        ...formData,
        status: 'Open',
        createdAt: serverTimestamp(),
      })

      setSubmittedId(ticketNo)
      toast.success(`शिकायत सफलतापूर्वक दर्ज! टिकिट क्र.: ${ticketNo}`, { id: toastId })
    } catch (err) {
      console.error('Grievance submit error:', err)
      toast.error('शिकायत दर्ज करने में त्रुटि: ' + err.message, { id: toastId })
    }
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased font-sans">
      <ServiceHeader />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/15">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            DPDP Act 2023 धारा 8(10) एवं सूचना प्रौद्योगिकी नियम
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            शिकायत निवारण एवं नोडल अधिकारी (Grievance & DPO Redressal)
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm max-w-3xl leading-relaxed">
            नगर पालिका नागरिक सेवाओं, डेटा प्राइवेसी, या प्रमाण पत्र विलंब से संबंधित शिकायतों के ऑनलाइन दर्ज करने एवं डेटा संरक्षण अधिकारी (DPO) से संपर्क हेतु आधिकारिक पोर्टल।
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Nodal Officer Contact Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl">
              🏢
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                प्राधिकृत डेटा प्राइवेसी एवं शिकायत निवारण अधिकारी
              </h2>
              <p className="text-xs text-emerald-700 font-bold">
                Data Protection Officer & Grievance Officer - Nagar Palika Jhabua
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">नोडल प्रशासक अधिकारी</p>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm">मुख्य नगर पालिका अधिकारी (CMO)</p>
              <p className="text-xs text-slate-500 mb-1">नगर पालिका परिषद झाबुआ</p>
              <a href="tel:9713175838" className="inline-flex items-center gap-1 font-mono font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-300 text-xs">
                📞 9713175838
              </a>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">जल कर / नल कनेक्शन प्रभारी</p>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm">श्री अय्यूब खान</p>
              <p className="text-xs text-slate-500 mb-1">Water Tax Official</p>
              <a href="tel:8224083390" className="inline-flex items-center gap-1 font-mono font-extrabold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-xl border border-teal-300 text-xs">
                📞 8224083390
              </a>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">जन्म एवं मृत्यु पंजीयन प्रभारी</p>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm">श्री अरविंद बुंदेला</p>
              <p className="text-xs text-slate-500 mb-1">Birth & Death Official</p>
              <a href="tel:9993177917" className="inline-flex items-center gap-1 font-mono font-extrabold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-xl border border-blue-300 text-xs">
                📞 9993177917
              </a>
            </div>
          </div>
        </div>

        {/* Online Grievance Form */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              ऑनलाइन शिकायत / डेटा प्राइवेसी अनुरोध दर्ज करें
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              डेटा संशोधन, प्राइवेसी शिकायत या प्रमाण पत्र विलंब से संबंधित समस्या नीचे दर्ज करें
            </p>
          </div>

          {submittedId ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-lg font-extrabold text-emerald-950">आपकी शिकायत दर्ज कर ली गई है!</h4>
              <p className="text-xs text-emerald-800 font-semibold">
                शिकायत/अनुरोध टिकिट क्र.: <span className="font-mono bg-white px-2 py-1 rounded border border-emerald-300">{submittedId}</span>
              </p>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                नोडल अधिकारी द्वारा 7 कार्य दिवसों के भीतर आपकी शिकायत की समीक्षा कर निस्तारण किया जाएगा।
              </p>
              <button
                onClick={() => { setSubmittedId(null); setFormData({ fullName: '', mobile: '', email: '', applicationNo: '', grievanceType: 'Data Protection & Privacy', description: '' }) }}
                className="btn btn-secondary btn-sm font-bold text-xs"
              >
                दूसरी शिकायत दर्ज करें
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    नागरिक का पूरा नाम (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-600"
                    placeholder="आपका नाम दर्ज करें"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    मोबाइल नंबर (Mobile No.) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.mobile}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-600"
                    placeholder="10 अंकों का मोबाइल नंबर"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    ई-मेल आईडी (Email ID)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-600"
                    placeholder="example@domain.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    संबंधित आवेदन क्र. (Application No. if any)
                  </label>
                  <input
                    type="text"
                    value={formData.applicationNo}
                    onChange={e => setFormData({ ...formData, applicationNo: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-600"
                    placeholder="उदा. JHB-DEATH-2024-XXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  शिकायत की श्रेणी (Grievance Category) *
                </label>
                <select
                  value={formData.grievanceType}
                  onChange={e => setFormData({ ...formData, grievanceType: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-600"
                >
                  <option value="Data Protection & Privacy">डेटा प्राइवेसी एवं गोपनीयता (DPDP Act)</option>
                  <option value="Certificate Delay">प्रमाण पत्र निर्गमन में विलंब</option>
                  <option value="Data Correction Request">डेटा / नाम संशोधन अनुरोध</option>
                  <option value="Technical Issue">पोर्टल तकनीकी समस्या</option>
                  <option value="Other">अन्य शिकायत</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  शिकायत विवरण (Grievance Details) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-600"
                  placeholder="कृपया अपनी समस्या का विस्तृत विवरण दर्ज करें..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn btn-primary py-3 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'शिकायत जमा हो रही है...' : 'शिकायत सबमिट करें (Submit Grievance)'}
              </button>
            </form>
          )}
        </div>

        {/* Back Links */}
        <div className="flex items-center justify-between pt-4">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-700 hover:text-emerald-800">
            <ArrowLeft className="w-4 h-4" /> मुख्य पृष्ठ पर वापस जाएं (Back to Home)
          </Link>
          <Link href="/privacy-policy" className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-slate-900">
            प्राइवेसी नीति देखें (Privacy Policy) →
          </Link>
        </div>

      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 text-xs">
          © {new Date().getFullYear()} नगर पालिका परिषद झाबुआ (म.प्र.) | Grievance Redressal Cell
        </div>
      </footer>
    </div>
  )
}

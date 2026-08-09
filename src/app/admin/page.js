'use client'
import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy, serverTimestamp, addDoc, limit } from 'firebase/firestore'
import toast from 'react-hot-toast'
import {
  getDeathCertificates,
  updateDeathCertificateStatus,
} from '@/services/deathCertificateService'
import {
  getBirthCertificates,
  updateBirthCertificateStatus,
} from '@/services/birthCertificateService'
import {
  getWaterConnections,
  updateWaterConnectionStatus
} from '@/services/waterConnectionService'
import DeathCertificateTemplate from '@/components/DeathCertificateTemplate'
import BirthCertificateTemplate from '@/components/BirthCertificateTemplate'
import WaterConnectionTemplate from '@/components/WaterConnectionTemplate'
import ApplicationLetterTemplate from '@/components/ApplicationLetterTemplate'
import ApplicationTimeline from '@/components/ApplicationTimeline'
import {
  ShieldAlert, Search, Trash2, Download, Edit, Printer, Eye, Activity, FileText, CheckCircle2,
  AlertCircle, Calendar, UserCheck, History, Info, Lock, LogOut, RefreshCw, X, Settings2, Baby, Eye as EyeIcon, Droplet
} from 'lucide-react'

const ADMIN_ACCOUNTS = {
  admin: {
    password: 'jhabua@2024',
    role: 'birth_death_admin',
    name: 'जन्म-मृत्यु रजिस्ट्रार अधिकारी (Birth & Death Registrar)',
    defaultTab: 'death-certificates',
    allowedTabs: ['death-certificates', 'birth-certificates']
  },
  water_admin: {
    password: 'water@jhabua2024',
    role: 'water_admin',
    name: 'जल प्रदाय विभाग अधिकारी (Water Supply Officer)',
    defaultTab: 'water-connections',
    allowedTabs: ['water-connections']
  },
  super_admin: {
    password: 'jhabua@super2024',
    role: 'super_admin',
    name: 'मुख्य नगर पालिका अधिकारी (Chief Municipal Officer - CMO)',
    defaultTab: 'death-certificates',
    allowedTabs: ['death-certificates', 'birth-certificates', 'water-connections', 'audit']
  }
}

function formatTimestamp(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentAdminUser, setCurrentAdminUser] = useState('')
  const [currentAdminRole, setCurrentAdminRole] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('dc_admin_authenticated')
      const storedUser = sessionStorage.getItem('dc_admin_username')
      const storedRole = sessionStorage.getItem('dc_admin_role')
      if (stored === 'true' && storedUser && ADMIN_ACCOUNTS[storedUser]) {
        setIsAdmin(true)
        setCurrentAdminUser(storedUser)
        setCurrentAdminRole(storedRole || ADMIN_ACCOUNTS[storedUser].role)
        setActiveTab(ADMIN_ACCOUNTS[storedUser].defaultTab)
      }
    }
  }, [])

  // Death Certificate state
  const [deathRecords, setDeathRecords] = useState([])
  const [deathLoading, setDeathLoading] = useState(false)
  const [deathSearch, setDeathSearch] = useState('')
  const [selectedDeathDetail, setSelectedDeathDetail] = useState(null)
  const [deathCertPreview, setDeathCertPreview] = useState(null)

  // Birth Certificate state
  const [birthRecords, setBirthRecords] = useState([])
  const [birthLoading, setBirthLoading] = useState(false)
  const [birthSearch, setBirthSearch] = useState('')
  const [selectedBirthDetail, setSelectedBirthDetail] = useState(null)
  const [birthCertPreview, setBirthCertPreview] = useState(null)

  // Water Connection state
  const [waterRecords, setWaterRecords] = useState([])
  const [waterLoading, setWaterLoading] = useState(false)
  const [waterSearch, setWaterSearch] = useState('')
  const [selectedWaterDetail, setSelectedWaterDetail] = useState(null)
  const [waterCertPreview, setWaterCertPreview] = useState(null)

  // Application Letter Modal State
  const [letterModal, setLetterModal] = useState({ isOpen: false, record: null, serviceType: 'death' })

  // Photo View Modal
  const [photoPreview, setPhotoPreview] = useState(null)

  // Tab navigation
  const [activeTab, setActiveTab] = useState('death-certificates') // 'death-certificates' | 'birth-certificates' | 'water-connections' | 'audit'

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditSearch, setAuditSearch] = useState('')

  // Remark Modal State
  const [remarkModal, setRemarkModal] = useState({
    isOpen: false,
    record: null,
    serviceType: 'death',
    targetStatus: '',
    remarkText: '',
    officerName: 'Nagar Palika Officer'
  })

  const loadDeathRecords = useCallback(async () => {
    setDeathLoading(true)
    try {
      const list = await getDeathCertificates()
      setDeathRecords(list)
    } catch (e) {
      toast.error('Failed to load death certificates: ' + e.message)
    }
    setDeathLoading(false)
  }, [])

  const loadBirthRecords = useCallback(async () => {
    setBirthLoading(true)
    try {
      const list = await getBirthCertificates()
      setBirthRecords(list)
    } catch (e) {
      toast.error('Failed to load birth certificates: ' + e.message)
    }
    setBirthLoading(false)
  }, [])

  const loadWaterRecords = useCallback(async () => {
    setWaterLoading(true)
    try {
      const list = await getWaterConnections()
      setWaterRecords(list)
    } catch (e) {
      toast.error('Failed to load water connections: ' + e.message)
    }
    setWaterLoading(false)
  }, [])

  const loadAuditLogs = useCallback(async () => {
    setAuditLoading(true)
    try {
      const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(100))
      const snap = await getDocs(q)
      setAuditLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) {
      console.error('Failed to load audit logs:', e)
    }
    setAuditLoading(false)
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadDeathRecords()
      loadBirthRecords()
      loadWaterRecords()
      loadAuditLogs()
    }
  }, [isAdmin, loadDeathRecords, loadBirthRecords, loadWaterRecords, loadAuditLogs])

  function handleLogin(e) {
    e.preventDefault()
    const cleanUser = username.trim().toLowerCase()
    const account = ADMIN_ACCOUNTS[cleanUser]

    if (account && password === account.password) {
      setIsAdmin(true)
      setCurrentAdminUser(cleanUser)
      setCurrentAdminRole(account.role)
      setActiveTab(account.defaultTab)

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('dc_admin_authenticated', 'true')
        sessionStorage.setItem('dc_admin_username', cleanUser)
        sessionStorage.setItem('dc_admin_role', account.role)
      }
      setLoginError('')
      toast.success(`लॉगिन सफल: ${account.name}`)
    } else {
      setLoginError('अमान्य उपयोगकर्ता नाम (Username) या पासवर्ड (Password)')
    }
  }

  function handleLogout() {
    setIsAdmin(false)
    setCurrentAdminUser('')
    setCurrentAdminRole('')
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('dc_admin_authenticated')
      sessionStorage.removeItem('dc_admin_username')
      sessionStorage.removeItem('dc_admin_role')
    }
  }

  async function handleConfirmStatusUpdate(e) {
    e.preventDefault()
    if (!remarkModal.remarkText || !remarkModal.remarkText.trim()) {
      toast.error('अधिकारी की टिप्पणी अनिवार्य है (Mandatory officer remark required)')
      return
    }

    const toastId = toast.loading(`स्थिति अपडेट हो रही है: ${remarkModal.targetStatus}... (Updating status...)`)
    let res;
    const officerName = ADMIN_ACCOUNTS[currentAdminUser]?.name || remarkModal.officerName;

    if (remarkModal.serviceType === 'birth') {
      res = await updateBirthCertificateStatus({
        id: remarkModal.record.id,
        newStatus: remarkModal.targetStatus,
        remarks: remarkModal.remarkText,
        officerName
      })
    } else if (remarkModal.serviceType === 'water_connection' || remarkModal.serviceType === 'water') {
      res = await updateWaterConnectionStatus({
        id: remarkModal.record.id,
        newStatus: remarkModal.targetStatus,
        remarks: remarkModal.remarkText,
        officerName
      })
    } else {
      res = await updateDeathCertificateStatus({
        id: remarkModal.record.id,
        newStatus: remarkModal.targetStatus,
        remarks: remarkModal.remarkText,
        officerName
      })
    }

    if (res.success) {
      toast.success(`स्थिति अपडेट हो गई: ${remarkModal.targetStatus}! (Status updated!)`, { id: toastId })
      setRemarkModal({ isOpen: false, record: null, serviceType: 'death', targetStatus: '', remarkText: '', officerName: 'Nagar Palika Officer' })
      loadDeathRecords()
      loadBirthRecords()
      loadWaterRecords()
    } else {
      toast.error(`अपडेट विफल: ${res.error} (Update failed)`, { id: toastId })
    }
  }

  const getStatusChip = (status) => {
    switch (status) {
      case 'Approved':
      case 'Certificate Generated':
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Correction Requested':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Under Review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Submitted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }

  const filteredDeathRecords = deathRecords.filter(r => {
    if (!deathSearch) return true
    const search = deathSearch.toLowerCase()
    return (
      r.applicationNo?.toLowerCase().includes(search) ||
      r.deceasedDetails?.fullName?.toLowerCase().includes(search) ||
      r.applicantDetails?.fullName?.toLowerCase().includes(search) ||
      r.status?.toLowerCase().includes(search)
    )
  })

  const filteredBirthRecords = birthRecords.filter(r => {
    if (!birthSearch) return true
    const search = birthSearch.toLowerCase()
    return (
      r.applicationNo?.toLowerCase().includes(search) ||
      r.childDetails?.fullName?.toLowerCase().includes(search) ||
      r.motherDetails?.fullName?.toLowerCase().includes(search) ||
      r.fatherDetails?.fullName?.toLowerCase().includes(search) ||
      r.applicantDetails?.fullName?.toLowerCase().includes(search) ||
      r.status?.toLowerCase().includes(search)
    )
  })

  const filteredWaterRecords = waterRecords.filter(r => {
    if (!waterSearch) return true
    const search = waterSearch.toLowerCase()
    return (
      r.applicationNo?.toLowerCase().includes(search) ||
      r.applicantDetails?.fullName?.toLowerCase().includes(search) ||
      r.propertyDetails?.houseNo?.toLowerCase().includes(search) ||
      r.applicantDetails?.wardNo?.toLowerCase().includes(search) ||
      r.status?.toLowerCase().includes(search)
    )
  })

  const currentAccount = ADMIN_ACCOUNTS[currentAdminUser]
  const allowedTabs = currentAccount?.allowedTabs || ['death-certificates', 'birth-certificates', 'water-connections', 'audit']

  const allTabDefs = [
    { key: 'death-certificates', label: 'मृत्यु प्रमाण पत्र आवेदन', labelShort: 'मृत्यु', icon: FileText },
    { key: 'birth-certificates', label: 'जन्म प्रमाण पत्र आवेदन', labelShort: 'जन्म', icon: Baby },
    { key: 'water-connections', label: 'जल कनेक्शन आवेदन', labelShort: 'जल', icon: Droplet },
    { key: 'audit', label: 'ऑडिट लॉग', labelShort: 'ऑडिट', icon: History },
  ]

  const visibleTabs = allTabDefs.filter(t => allowedTabs.includes(t.key))

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <a href="/" className="w-9 h-9 flex items-center justify-center hover:opacity-90 transition shrink-0" title="Home">
              <img src="/mp-logo.png" alt="मध्य प्रदेश शासन" className="w-9 h-9 object-contain drop-shadow-sm" />
            </a>
            <div className="min-w-0">
              <h1 className="font-extrabold text-slate-900 text-sm tracking-tight truncate">
                <span className="hidden sm:inline">ई-नगर अधिकारी प्रशासन पैनल (Nagar Palika Officer Portal)</span>
                <span className="sm:hidden">ई-नगर पैनल</span>
              </h1>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <a href="/" className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition flex items-center gap-1.5">
              <span>📜</span> पोर्टल होम
            </a>
            <a href="/death-certificate" className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition flex items-center gap-1.5">
              <span>⚰️</span> मृत्यु
            </a>
            <a href="/birth-certificate" className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition flex items-center gap-1.5">
              <span>👶</span> जन्म
            </a>
            <a href="/water-connection" className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition flex items-center gap-1.5">
              <span>💧</span> जल
            </a>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                {currentAccount?.name || currentAdminUser}
              </span>
              <button 
                onClick={handleLogout} 
                className="btn btn-secondary btn-sm flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">लॉगआउट</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Panel Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full flex flex-col space-y-6">

        {/* Login Portal Screen */}
        {!isAdmin && (
          <div className="max-w-md mx-auto my-12 w-full animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
              <div className="text-center space-y-3">
                <img src="/mp-logo.png" alt="मध्य प्रदेश शासन" className="w-16 h-16 object-contain drop-shadow-md mx-auto" />
                <h2 className="text-xl font-extrabold text-slate-900">नगरपालिका अधिकारी लॉगिन (Officer Login)</h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">नगर पालिका परिषद झाबुआ अधिकारी प्रशासन पोर्टल (e-Nagar Palika Parishad Jhabua Officer Administration Portal)</p>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center animate-shake">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">उपयोगकर्ता नाम (Username)</label>
                  <input
                    value={username} 
                    onChange={e => setUsername(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-emerald-600"
                    placeholder="User ID / Username"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">पासवर्ड (Password)</label>
                  <input
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-emerald-600"
                    placeholder="••••••••"
                  />
                </div>
                
                <button type="submit" className="w-full btn btn-primary py-3 text-xs uppercase tracking-wider font-bold mt-2">
                  प्रमाण सत्यापित करें एवं लॉगिन करें (Verify Credentials)
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Admin Dashboard */}
        {isAdmin && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Dynamic Role-Filtered Tab Navigation Menu */}
            <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1 shadow-sm overflow-x-auto">
              {visibleTabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button 
                    key={tab.key} 
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === tab.key 
                        ? 'bg-emerald-700 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.labelShort}</span>
                  </button>
                )
              })}
            </div>

            {/* ── DEATH CERTIFICATES TAB ──────────────────────────────────── */}
            {activeTab === 'death-certificates' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">मृत्यु प्रमाण पत्र आवेदन प्रबंधन</h2>
                    <p className="text-xs text-slate-500 mt-0.5">प्राप्त आवेदनों का भौतिक सत्यापन, स्थिति परिवर्तन व प्रमाण पत्र जारी करना</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="मृतक नाम, आवेदक नाम, आवेदन क्र. से खोजें..."
                        value={deathSearch}
                        onChange={(e) => setDeathSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <button onClick={loadDeathRecords} className="btn btn-secondary btn-sm shrink-0">
                      <RefreshCw className={`w-3.5 h-3.5 ${deathLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                  {[
                    { label: 'कुल मृत्यु', count: deathRecords.length, color: 'slate' },
                    { label: 'जमा', count: deathRecords.filter(r => r.status === 'Submitted').length, color: 'blue' },
                    { label: 'समीक्षा', count: deathRecords.filter(r => r.status === 'Under Review').length, color: 'amber' },
                    { label: 'स्वीकृत', count: deathRecords.filter(r => r.status === 'Approved' || r.status === 'Certificate Generated').length, color: 'emerald' },
                    { label: 'अस्वीकृत', count: deathRecords.filter(r => r.status === 'Rejected').length, color: 'red' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center shadow-sm">
                      <div className={`text-xl sm:text-2xl font-extrabold text-${stat.color}-700`}>{stat.count}</div>
                      <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 sm:mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Records List */}
                {deathLoading ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <RefreshCw className="animate-spin w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-xs">मृत्यु आवेदन लोड हो रहे हैं...</p>
                  </div>
                ) : filteredDeathRecords.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
                    <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm font-semibold">कोई आवेदन नहीं मिला</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredDeathRecords.map((record) => (
                      <div key={record.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-slate-300 transition-all shadow-sm space-y-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                                {record.applicationNo || 'DRAFT'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold border uppercase tracking-wider ${getStatusChip(record.status)}`}>
                                {record.status}
                              </span>
                            </div>
                            <h3 className="text-slate-900 font-extrabold text-sm sm:text-base">
                              स्व. {record.deceasedDetails?.fullName || 'N/A'}
                            </h3>
                            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">
                              आवेदक: {record.applicantDetails?.fullName} ({record.applicantDetails?.relationWithDeceased}) | फोन: {record.applicantDetails?.mobile} | मृत्यु तिथि: {record.deceasedDetails?.dateOfDeath}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                            {/* Letter Modal */}
                            <button
                              onClick={() => setLetterModal({ isOpen: true, record, serviceType: 'death' })}
                              className="btn btn-secondary btn-sm flex items-center gap-1 font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-[11px]"
                            >
                              <Printer className="w-3.5 h-3.5 text-emerald-700" /> પાવતી पत्र (Hard Copy)
                            </button>

                            {record.status === 'Submitted' && (
                              <button
                                onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'death', targetStatus: 'Under Review', remarkText: '', officerName: 'Nagar Palika Officer' })}
                                className="btn btn-secondary btn-sm bg-blue-50 border-blue-200 text-blue-700 font-bold text-[11px]"
                              >
                                👁️ समीक्षा करें
                              </button>
                            )}

                            {record.status === 'Under Review' && (
                              <>
                                <button
                                  onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'death', targetStatus: 'Approved', remarkText: '', officerName: 'Nagar Palika Officer' })}
                                  className="btn btn-primary btn-sm bg-gradient-to-r from-emerald-600 to-emerald-700 font-bold text-[11px]"
                                >
                                  ✅ स्वीकृत करें
                                </button>
                                <button
                                  onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'death', targetStatus: 'Correction Requested', remarkText: '', officerName: 'Nagar Palika Officer' })}
                                  className="btn btn-secondary btn-sm bg-amber-50 border-amber-200 text-amber-700 font-bold text-[11px]"
                                >
                                  ✏️ सुधार मांगे
                                </button>
                                <button
                                  onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'death', targetStatus: 'Rejected', remarkText: '', officerName: 'Nagar Palika Officer' })}
                                  className="btn btn-danger btn-sm font-bold text-[11px]"
                                >
                                  ❌ निरस्त करें
                                </button>
                              </>
                            )}

                            {(record.status === 'Approved' || record.status === 'Certificate Generated' || record.status === 'Completed') && (
                              <button
                                onClick={() => setDeathCertPreview(record)}
                                className="btn btn-primary btn-sm bg-gradient-to-r from-emerald-600 to-emerald-700 font-bold text-[11px]"
                              >
                                📜 प्रमाण पत्र
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedDeathDetail(record)}
                              className="btn btn-secondary btn-sm flex items-center gap-1 font-bold text-slate-700 text-[11px]"
                            >
                              <History className="w-3.5 h-3.5 text-slate-500" /> विवरण
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── BIRTH CERTIFICATES TAB ──────────────────────────────────── */}
            {activeTab === 'birth-certificates' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">जन्म प्रमाण पत्र आवेदन प्रबंधन</h2>
                    <p className="text-xs text-slate-500 mt-0.5">प्राप्त जन्म आवेदनों का भौतिक सत्यापन, स्थिति परिवर्तन व प्रमाण पत्र जारी करना</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="शिशु नाम, माता-पिता नाम, आवेदन क्र. से खोजें..."
                        value={birthSearch}
                        onChange={(e) => setBirthSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <button onClick={loadBirthRecords} className="btn btn-secondary btn-sm shrink-0">
                      <RefreshCw className={`w-3.5 h-3.5 ${birthLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                  {[
                    { label: 'कुल जन्म', count: birthRecords.length, color: 'slate' },
                    { label: 'जमा', count: birthRecords.filter(r => r.status === 'Submitted').length, color: 'blue' },
                    { label: 'समीक्षा', count: birthRecords.filter(r => r.status === 'Under Review').length, color: 'amber' },
                    { label: 'स्वीकृत', count: birthRecords.filter(r => r.status === 'Approved' || r.status === 'Certificate Generated').length, color: 'emerald' },
                    { label: 'अस्वीकृत', count: birthRecords.filter(r => r.status === 'Rejected').length, color: 'red' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center shadow-sm">
                      <div className={`text-xl sm:text-2xl font-extrabold text-${stat.color}-700`}>{stat.count}</div>
                      <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 sm:mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Records List */}
                {birthLoading ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <RefreshCw className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-xs">जन्म आवेदन लोड हो रहे हैं...</p>
                  </div>
                ) : filteredBirthRecords.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
                    <Baby className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm font-semibold">कोई आवेदन नहीं मिला</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBirthRecords.map((record) => (
                      <div key={record.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-slate-300 transition-all shadow-sm space-y-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[11px] font-mono font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                                {record.applicationNo || 'DRAFT'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold border uppercase tracking-wider ${getStatusChip(record.status)}`}>
                                {record.status}
                              </span>
                            </div>
                            <h3 className="text-slate-900 font-extrabold text-sm sm:text-base">
                              👶 शिशु: {record.childDetails?.fullName || 'अनाम'} (जन्म तिथि: {record.childDetails?.dateOfBirth})
                            </h3>
                            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">
                              माता: {record.motherDetails?.fullName} | पिता: {record.fatherDetails?.fullName} | आवेदक: {record.applicantDetails?.fullName} ({record.applicantDetails?.mobile})
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                            {/* Letter Modal */}
                            <button
                              onClick={() => setLetterModal({ isOpen: true, record, serviceType: 'birth' })}
                              className="btn btn-secondary btn-sm flex items-center gap-1 font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border-blue-200 text-[11px]"
                            >
                              <Printer className="w-3.5 h-3.5 text-blue-700" /> पावती पत्र (Hard Copy)
                            </button>

                            {record.status === 'Submitted' && (
                              <button
                                onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'birth', targetStatus: 'Under Review', remarkText: '', officerName: 'Nagar Palika Officer' })}
                                className="btn btn-secondary btn-sm bg-blue-50 border-blue-200 text-blue-700 font-bold text-[11px]"
                              >
                                👁️ समीक्षा करें
                              </button>
                            )}

                            {record.status === 'Under Review' && (
                              <>
                                <button
                                  onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'birth', targetStatus: 'Approved', remarkText: '', officerName: 'Nagar Palika Officer' })}
                                  className="btn btn-primary btn-sm bg-gradient-to-r from-emerald-600 to-emerald-700 font-bold text-[11px]"
                                >
                                  ✅ स्वीकृत करें
                                </button>
                                <button
                                  onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'birth', targetStatus: 'Correction Requested', remarkText: '', officerName: 'Nagar Palika Officer' })}
                                  className="btn btn-secondary btn-sm bg-amber-50 border-amber-200 text-amber-700 font-bold text-[11px]"
                                >
                                  ✏️ सुधार मांगे
                                </button>
                                <button
                                  onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'birth', targetStatus: 'Rejected', remarkText: '', officerName: 'Nagar Palika Officer' })}
                                  className="btn btn-danger btn-sm font-bold text-[11px]"
                                >
                                  ❌ निरस्त करें
                                </button>
                              </>
                            )}

                            {(record.status === 'Approved' || record.status === 'Certificate Generated' || record.status === 'Completed') && (
                              <button
                                onClick={() => setBirthCertPreview(record)}
                                className="btn btn-primary btn-sm bg-gradient-to-r from-blue-600 to-blue-700 font-bold text-[11px]"
                              >
                                📜 प्रमाण पत्र
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedBirthDetail(record)}
                              className="btn btn-secondary btn-sm flex items-center gap-1 font-bold text-slate-700 text-[11px]"
                            >
                              <History className="w-3.5 h-3.5 text-slate-500" /> विवरण
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── WATER CONNECTIONS TAB ──────────────────────────────────── */}
            {activeTab === 'water-connections' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">जल (नल) कनेक्शन आवेदन प्रबंधन</h2>
                    <p className="text-xs text-slate-500 mt-0.5">जल प्रदाय विभाग - प्राप्त नल कनेक्शन आवेदनों की समीक्षा, स्थिति परिवर्तन व स्वीकृति आदेश जारी करना</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="आवेदक नाम, भवन क्र., वार्ड क्र., आवेदन क्र. से खोजें..."
                        value={waterSearch}
                        onChange={(e) => setWaterSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-teal-600"
                      />
                    </div>
                    <button onClick={loadWaterRecords} className="btn btn-secondary btn-sm shrink-0">
                      <RefreshCw className={`w-3.5 h-3.5 ${waterLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                  {[
                    { label: 'कुल कनेक्शन', count: waterRecords.length, color: 'slate' },
                    { label: 'जमा', count: waterRecords.filter(r => r.status === 'Submitted').length, color: 'blue' },
                    { label: 'समीक्षा', count: waterRecords.filter(r => r.status === 'Under Review').length, color: 'amber' },
                    { label: 'स्वीकृत', count: waterRecords.filter(r => r.status === 'Approved' || r.status === 'Sanctioned' || r.status === 'Completed').length, color: 'emerald' },
                    { label: 'अस्वीकृत', count: waterRecords.filter(r => r.status === 'Rejected').length, color: 'red' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center shadow-sm">
                      <div className={`text-xl sm:text-2xl font-extrabold text-${stat.color}-700`}>{stat.count}</div>
                      <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 sm:mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Records List */}
                {waterLoading ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <RefreshCw className="animate-spin w-8 h-8 text-teal-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-xs">जल कनेक्शन आवेदन लोड हो रहे हैं...</p>
                  </div>
                ) : filteredWaterRecords.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
                    <Droplet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm font-semibold">कोई जल कनेक्शन आवेदन नहीं मिला</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredWaterRecords.map((record) => (
                      <div key={record.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-slate-300 transition-all shadow-sm space-y-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded border border-teal-200">
                                {record.applicationNo || 'DRAFT'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold border uppercase tracking-wider ${getStatusChip(record.status)}`}>
                                {record.status}
                              </span>
                            </div>
                            <h3 className="text-slate-900 font-extrabold text-sm sm:text-base">
                              💧 आवेदक: {record.applicantDetails?.fullName || 'N/A'} (भवन क्र. {record.propertyDetails?.houseNo || 'N/A'}, वार्ड क्र. {record.applicantDetails?.wardNo || 'N/A'})
                            </h3>
                            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">
                              पिता/पति: {record.applicantDetails?.fatherHusbandName} | फोन: {record.applicantDetails?.mobile} | साइज: {record.propertyDetails?.connectionSize} | प्रयोजन: {record.propertyDetails?.usagePurpose}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                            {/* Letter Modal */}
                            <button
                              onClick={() => setLetterModal({ isOpen: true, record, serviceType: 'water_connection' })}
                              className="btn btn-secondary btn-sm flex items-center gap-1 font-bold text-teal-900 bg-teal-50 hover:bg-teal-100 border-teal-200 text-[11px]"
                            >
                              <Printer className="w-3.5 h-3.5 text-teal-700" /> पावती पत्र (Hard Copy)
                            </button>

                            {record.status === 'Submitted' && (
                              <button
                                onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'water_connection', targetStatus: 'Under Review', remarkText: '', officerName: ADMIN_ACCOUNTS[currentAdminUser]?.name || 'Water Supply Officer' })}
                                className="btn btn-secondary btn-sm bg-blue-50 border-blue-200 text-blue-700 font-bold text-[11px]"
                              >
                                👁️ समीक्षा करें
                              </button>
                            )}

                            {record.status === 'Under Review' && (
                              <>
                                <button
                                  onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'water_connection', targetStatus: 'Approved', remarkText: '', officerName: ADMIN_ACCOUNTS[currentAdminUser]?.name || 'Water Supply Officer' })}
                                  className="btn btn-primary btn-sm bg-gradient-to-r from-teal-600 to-emerald-700 font-bold text-[11px]"
                                >
                                  ✅ स्वीकृत करें
                                </button>
                                <button
                                  onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'water_connection', targetStatus: 'Correction Requested', remarkText: '', officerName: ADMIN_ACCOUNTS[currentAdminUser]?.name || 'Water Supply Officer' })}
                                  className="btn btn-secondary btn-sm bg-amber-50 border-amber-200 text-amber-700 font-bold text-[11px]"
                                >
                                  ✏️ सुधार मांगे
                                </button>
                                <button
                                  onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'water_connection', targetStatus: 'Rejected', remarkText: '', officerName: ADMIN_ACCOUNTS[currentAdminUser]?.name || 'Water Supply Officer' })}
                                  className="btn btn-danger btn-sm font-bold text-[11px]"
                                >
                                  ❌ निरस्त करें
                                </button>
                              </>
                            )}

                            {(record.status === 'Approved' || record.status === 'Sanctioned' || record.status === 'Completed') && (
                              <button
                                onClick={() => setWaterCertPreview(record)}
                                className="btn btn-primary btn-sm bg-gradient-to-r from-teal-600 to-teal-700 font-bold text-[11px]"
                              >
                                📜 स्वीकृति पत्र
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── AUDIT LOGS TAB ──────────────────────────────────────────── */}
            {activeTab === 'audit' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap bg-white p-3 sm:p-4 border border-slate-200 rounded-2xl shadow-sm">
                  <div className="relative flex-1 min-w-0">
                    <input 
                      value={auditSearch} 
                      onChange={e => setAuditSearch(e.target.value)}
                      placeholder="ऑडिट लॉग खोजें..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <button onClick={loadAuditLogs} className="btn btn-secondary btn-sm flex items-center gap-1 shrink-0">
                    <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin' : ''}`} /> रिफ्रेश
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  {auditLoading ? (
                    <div className="p-12 text-center text-slate-500">
                      <RefreshCw className="animate-spin w-6 h-6 text-emerald-600 mx-auto mb-2" />
                      ऑडिट लॉग लोड हो रहे हैं...
                    </div>
                  ) : auditLogs.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs">
                      कोई ऑडिट लॉग नहीं मिला
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                            <th className="p-4">समय (Timestamp)</th>
                            <th className="p-4">अधिकारी (Officer)</th>
                            <th className="p-4">कार्यवाही (Action)</th>
                            <th className="p-4">सेवा प्रकार (Service)</th>
                            <th className="p-4">आवेदन क्रमांक (App No)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {auditLogs
                            .filter(log => !auditSearch || 
                              log.user?.toLowerCase().includes(auditSearch.toLowerCase()) ||
                              log.action?.toLowerCase().includes(auditSearch.toLowerCase()) ||
                              log.applicationNo?.toLowerCase().includes(auditSearch.toLowerCase())
                            )
                            .map((log) => (
                              <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-4 font-mono text-slate-600">{formatTimestamp(log.timestamp)}</td>
                                <td className="p-4 font-bold text-slate-900">{log.user || 'N/A'}</td>
                                <td className="p-4">
                                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                    log.action?.includes('APPROVED') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    log.action?.includes('REJECTED') ? 'bg-red-50 text-red-700 border-red-200' :
                                    log.action?.includes('CORRECTION') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-blue-50 text-blue-700 border-blue-200'
                                  }`}>
                                    {log.action || 'N/A'}
                                  </span>
                                </td>
                                <td className="p-4 text-slate-600 font-semibold">{log.serviceType || 'N/A'}</td>
                                <td className="p-4 font-mono text-slate-800 font-bold">{log.applicationNo || '—'}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status Update Remark Modal */}
        {remarkModal.isOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-slate-900 font-extrabold text-base">
                  स्थिति अपडेट: <span className="text-emerald-700">{remarkModal.targetStatus}</span>
                </h3>
                <button onClick={() => setRemarkModal({ isOpen: false, record: null, serviceType: 'death', targetStatus: '', remarkText: '', officerName: 'Nagar Palika Officer' })} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
                <span className="font-bold block mb-1">⚠️ आवेदन: {remarkModal.record?.applicationNo}</span>
                <p>नाम: {remarkModal.record?.deceasedDetails?.fullName || remarkModal.record?.childDetails?.fullName || 'N/A'}</p>
              </div>

              <form onSubmit={handleConfirmStatusUpdate} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    अधिकारी टिप्पणी (Officer Remark) *
                  </label>
                  <textarea
                    value={remarkModal.remarkText}
                    onChange={(e) => setRemarkModal(prev => ({ ...prev, remarkText: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs min-h-[80px] focus:outline-none focus:border-emerald-600"
                    placeholder="यहाँ अपनी टिप्पणी दर्ज करें..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setRemarkModal({ isOpen: false, record: null, serviceType: 'death', targetStatus: '', remarkText: '', officerName: 'Nagar Palika Officer' })} className="btn btn-secondary">
                    रद्द करें
                  </button>
                  <button type="submit" className="btn btn-primary">
                    पुष्टि करें और स्थिति बदलें
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Application Letter Modal */}
        {letterModal.isOpen && letterModal.record && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 my-8 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-slate-900 font-extrabold text-base flex items-center gap-2">
                  📄 भौतिक पावती पत्र (Official Physical Submission Letter)
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="btn btn-primary btn-sm flex items-center gap-1 font-bold text-xs"
                  >
                    <Printer className="w-3.5 h-3.5" /> प्रिंट / PDF डाउनलोड
                  </button>
                  <button onClick={() => setLetterModal({ isOpen: false, record: null, serviceType: 'death' })} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <ApplicationLetterTemplate record={letterModal.record} serviceType={letterModal.serviceType} />
            </div>
          </div>
        )}

        {/* Death Certificate Preview Modal */}
        {deathCertPreview && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 my-8 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-slate-900 font-extrabold text-base flex items-center gap-2">
                  📜 आधिकारिक मृत्यु प्रमाण पत्र पूर्वावलोकन (Death Certificate Preview)
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="btn btn-primary btn-sm flex items-center gap-1 font-bold text-xs"
                  >
                    <Printer className="w-3.5 h-3.5" /> प्रिंट / PDF डाउनलोड
                  </button>
                  <button onClick={() => setDeathCertPreview(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <DeathCertificateTemplate record={deathCertPreview} />
            </div>
          </div>
        )}

        {/* Birth Certificate Preview Modal */}
        {birthCertPreview && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 my-8 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-slate-900 font-extrabold text-base flex items-center gap-2">
                  📜 आधिकारिक जन्म प्रमाण पत्र पूर्वावलोकन (Birth Certificate Preview)
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="btn btn-primary btn-sm flex items-center gap-1 font-bold text-xs"
                  >
                    <Printer className="w-3.5 h-3.5" /> प्रिंट / PDF डाउनलोड
                  </button>
                  <button onClick={() => setBirthCertPreview(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <BirthCertificateTemplate record={birthCertPreview} />
            </div>
          </div>
        )}

        {/* Water Connection Sanction Permit Modal */}
        {waterCertPreview && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 my-8 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-slate-900 font-extrabold text-base flex items-center gap-2">
                  📜 जल कनेक्शन स्वीकृत आदेश (Water Connection Sanction Permit)
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="btn btn-primary btn-sm flex items-center gap-1 font-bold text-xs bg-teal-700"
                  >
                    <Printer className="w-3.5 h-3.5" /> प्रिंट / PDF डाउनलोड
                  </button>
                  <button onClick={() => setWaterCertPreview(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <WaterConnectionTemplate record={waterCertPreview} />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

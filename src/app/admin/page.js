'use client'
import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy, serverTimestamp, addDoc, limit } from 'firebase/firestore'
import toast from 'react-hot-toast'
import {
  getDeathCertificates,
  updateDeathCertificateStatus
} from '@/services/deathCertificateService'
import {
  getBirthCertificates,
  updateBirthCertificateStatus
} from '@/services/birthCertificateService'
import {
  getWaterConnections,
  updateWaterConnectionStatus
} from '@/services/waterConnectionService'
import {
  getNoDuesCertificates,
  updateNoDuesCertificateStatus
} from '@/services/noDuesService'
import { markNotificationAsRead } from '@/services/notificationService'
import { cleanHindiText } from '@/utils/textSanitizer'
import DeathCertificateTemplate from '@/components/DeathCertificateTemplate'
import BirthCertificateTemplate from '@/components/BirthCertificateTemplate'
import WaterConnectionTemplate from '@/components/WaterConnectionTemplate'
import NoDuesCertificateTemplate from '@/components/NoDuesCertificateTemplate'
import NoDuesLetterTemplate from '@/components/NoDuesLetterTemplate'
import ApplicationLetterTemplate from '@/components/ApplicationLetterTemplate'
import ApplicationTimeline from '@/components/ApplicationTimeline'
import { DEFAULT_ADMIN_ACCOUNTS, fetchAdminAccounts, updateAdminAccountCredential, ADMIN_USERNAME_ALIASES } from '@/services/adminAuthService'
import { subscribeToMaintenance, toggleMaintenanceMode } from '@/services/maintenanceService'
import {
  ShieldAlert, Search, Trash2, Download, Edit, Printer, Eye, Activity, FileText, CheckCircle2,
  AlertCircle, Calendar, UserCheck, History, Info, Lock, LogOut, RefreshCw, X, Settings2, Baby, Eye as EyeIcon, Droplet, Key, Save, Building2, Bell, Mail
} from 'lucide-react'

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

  const [adminAccounts, setAdminAccounts] = useState(DEFAULT_ADMIN_ACCOUNTS)
  const [credEditState, setCredEditState] = useState({
    admin: { password: '', name: '', email: '' },
    water_admin: { password: '', name: '', email: '' },
    nodues_admin: { password: '', name: '', email: '' },
    super_admin: { password: '', name: '', email: '' }
  })

  const loadCloudAccounts = useCallback(async () => {
    const accs = await fetchAdminAccounts()
    setAdminAccounts(accs)
    setCredEditState({
      admin: { password: accs.admin?.password || '', name: accs.admin?.name || '', email: accs.admin?.email || '' },
      water_admin: { password: accs.water_admin?.password || '', name: accs.water_admin?.name || '', email: accs.water_admin?.email || '' },
      nodues_admin: { password: accs.nodues_admin?.password || '', name: accs.nodues_admin?.name || '', email: accs.nodues_admin?.email || '' },
      super_admin: { password: accs.super_admin?.password || '', name: accs.super_admin?.name || '', email: accs.super_admin?.email || '' }
    })
  }, [])

  const [maintState, setMaintState] = useState({ isMaintenanceMode: false })

  useEffect(() => {
    const unsub = subscribeToMaintenance((status) => {
      setMaintState(status)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    loadCloudAccounts()
  }, [loadCloudAccounts])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('dc_admin_authenticated')
      const storedUser = sessionStorage.getItem('dc_admin_username')
      const storedRole = sessionStorage.getItem('dc_admin_role')
      if (stored === 'true' && storedUser) {
        setIsAdmin(true)
        setCurrentAdminUser(storedUser)
        setCurrentAdminRole(storedRole || 'super_admin')
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

  // No Dues Certificate state
  const [noDuesRecords, setNoDuesRecords] = useState([])
  const [noDuesLoading, setNoDuesLoading] = useState(false)
  const [noDuesSearch, setNoDuesSearch] = useState('')
  const [selectedNoDuesDetail, setSelectedNoDuesDetail] = useState(null)
  const [noDuesCertPreview, setNoDuesCertPreview] = useState(null)

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditSearch, setAuditSearch] = useState('')

  // Application Letter Modal State
  const [letterModal, setLetterModal] = useState({ isOpen: false, record: null, serviceType: 'death' })

  // Photo View Modal
  const [photoPreview, setPhotoPreview] = useState(null)

  // Tab navigation
  const [activeTab, setActiveTab] = useState('death-certificates') // 'death-certificates' | 'birth-certificates' | 'water-connections' | 'no-dues-certificates' | 'audit'

  // Officer Real-Time Notifications State
  const [officerNotifications, setOfficerNotifications] = useState([])
  const [showOfficerNotifs, setShowOfficerNotifs] = useState(false)

  const loadOfficerNotifications = useCallback(async () => {
    try {
      const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(50))
      const snap = await getDocs(q)
      const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setOfficerNotifications(notifs)
    } catch (e) {
      console.warn('Failed to load officer notifications:', e)
    }
  }, [])

  const handleNotificationClick = async (notif) => {
    setOfficerNotifications(prev =>
      prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
    );
    markNotificationAsRead(notif.id).catch(e => console.warn('Mark read error:', e));

    if (notif.serviceType) {
      if (notif.serviceType.includes('no_dues') || notif.serviceType.includes('no-dues')) {
        setActiveTab('no-dues-certificates');
      } else if (notif.serviceType.includes('birth')) {
        setActiveTab('birth-certificates');
      } else if (notif.serviceType.includes('death')) {
        setActiveTab('death-certificates');
      } else if (notif.serviceType.includes('water')) {
        setActiveTab('water-connections');
      }
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    setOfficerNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    officerNotifications.forEach(n => {
      if (!n.isRead) markNotificationAsRead(n.id).catch(() => {});
    });
  };

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
      const list = await getDeathCertificates(null, true)
      setDeathRecords(list)
    } catch (e) {
      toast.error('Failed to load death certificates: ' + e.message)
    }
    setDeathLoading(false)
  }, [])

  const loadBirthRecords = useCallback(async () => {
    setBirthLoading(true)
    try {
      const list = await getBirthCertificates(null, true)
      setBirthRecords(list)
    } catch (e) {
      toast.error('Failed to load birth certificates: ' + e.message)
    }
    setBirthLoading(false)
  }, [])

  const loadWaterRecords = useCallback(async () => {
    setWaterLoading(true)
    try {
      const list = await getWaterConnections(null, true)
      setWaterRecords(list)
    } catch (e) {
      toast.error('Failed to load water connections: ' + e.message)
    }
    setWaterLoading(false)
  }, [])

  const loadNoDuesRecords = useCallback(async () => {
    setNoDuesLoading(true)
    try {
      const list = await getNoDuesCertificates(true)
      setNoDuesRecords(list)
    } catch (e) {
      toast.error('Failed to load no dues NOC: ' + e.message)
    }
    setNoDuesLoading(false)
  }, [])

  const loadAuditLogs = useCallback(async () => {
    setAuditLoading(true)
    try {
      let logs = []
      try {
        const q1 = query(collection(db, 'auditLogs'), limit(100))
        const snap1 = await getDocs(q1)
        logs = snap1.docs.map(d => ({ id: d.id, ...d.data() }))
      } catch (e) {}

      try {
        const q2 = query(collection(db, 'audit_logs'), limit(100))
        const snap2 = await getDocs(q2)
        const logs2 = snap2.docs.map(d => ({ id: d.id, ...d.data() }))
        logs = [...logs, ...logs2]
      } catch (e) {}

      const map = new Map()
      logs.forEach(item => map.set(item.id, item))
      const combined = Array.from(map.values())
      combined.sort((a, b) => {
        const tA = new Date(a.timestamp || a.createdAt || Date.now()).getTime()
        const tB = new Date(b.timestamp || b.createdAt || Date.now()).getTime()
        return tB - tA
      })
      setAuditLogs(combined)
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
      loadNoDuesRecords()
      loadAuditLogs()
      loadOfficerNotifications()
    }
  }, [isAdmin, loadDeathRecords, loadBirthRecords, loadWaterRecords, loadNoDuesRecords, loadAuditLogs, loadOfficerNotifications])

  async function handleLogin(e) {
    e.preventDefault()
    let cleanUser = username.trim().toLowerCase()
    if (ADMIN_USERNAME_ALIASES && ADMIN_USERNAME_ALIASES[cleanUser]) {
      cleanUser = ADMIN_USERNAME_ALIASES[cleanUser]
    }
    const latestAccounts = await fetchAdminAccounts()
    setAdminAccounts(latestAccounts)
    const account = latestAccounts[cleanUser]

    if (account && password === account.password) {
      setIsAdmin(true)
      setCurrentAdminUser(cleanUser)
      setCurrentAdminRole(account.role)
      setActiveTab(account.defaultTab || 'death-certificates')

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

  async function handleUpdateCredentials(targetUsername) {
    const editData = credEditState[targetUsername]
    if (!editData || (!editData.password && !editData.name && !editData.email)) {
      toast.error('कृपया पासवर्ड, नाम या ईमेल दर्ज करें (Please enter details to update)')
      return
    }

    const toastId = toast.loading(`'${targetUsername}' के क्रेडेंशियल अद्यतन हो रहे हैं...`)
    const result = await updateAdminAccountCredential({
      targetUsername,
      newPassword: editData.password,
      newName: editData.name,
      newEmail: editData.email,
      updatedBy: currentAdminUser
    })

    if (result.success) {
      toast.success(`✅ '${targetUsername}' का क्रेडेंशियल फायरस्टोर में अद्यतन हो गया!`, { id: toastId })
      setAdminAccounts(result.updatedAccounts)
      loadAuditLogs()
    } else {
      toast.error(`अपडेट विफल: ${result.error}`, { id: toastId })
    }
  }

  async function handleToggleMaintenance() {
    const targetState = !maintState.isMaintenanceMode
    const actionName = targetState ? 'सुरक्षा अद्यतन / रखरखाव मोड' : 'सामान्य पोर्टल स्थिति'
    const toastId = toast.loading(`${actionName} परिवर्तित किया जा रहा है...`)

    const res = await toggleMaintenanceMode({
      isEnabled: targetState,
      message: targetState 
        ? 'सुरक्षा एवं तकनीकी रखरखाव हेतु पोर्टल अस्थायी रूप से स्थगित है। शीघ्र सेवाएं पुनः शुरू की जाएंगी।'
        : 'पोर्टल सामान्य स्थिति में कार्यरत है।',
      reason: 'नियमित तकनीकी एवं सुरक्षा अद्यतन',
      updatedBy: currentAdminUser
    })

    if (res.success) {
      toast.success(`✅ पोर्टल अब ${targetState ? 'रखरखाव / रूटीन चेक मोड में है (Maintenance ON)' : 'सामान्य स्थिति में बहाल हो गया (System Online)'}`, { id: toastId })
      loadAuditLogs()
    } else {
      toast.error(`विफलता: ${res.error}`, { id: toastId })
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
    const officerName = adminAccounts[currentAdminUser]?.name || remarkModal.officerName;

    if (remarkModal.serviceType === 'birth') {
      res = await updateBirthCertificateStatus({
        id: remarkModal.record.id,
        newStatus: remarkModal.targetStatus,
        remarks: remarkModal.remarkText,
        officerName,
        officialUploadedCertificate: remarkModal.officialCertFile || null
      })
    } else if (remarkModal.serviceType === 'water_connection' || remarkModal.serviceType === 'water') {
      res = await updateWaterConnectionStatus({
        id: remarkModal.record.id,
        newStatus: remarkModal.targetStatus,
        remarks: remarkModal.remarkText,
        officerName,
        officialUploadedCertificate: remarkModal.officialCertFile || null
      })
    } else if (remarkModal.serviceType === 'no_dues') {
      res = await updateNoDuesCertificateStatus({
        id: remarkModal.record.id,
        newStatus: remarkModal.targetStatus,
        remarks: remarkModal.remarkText,
        officerName,
        officialUploadedCertificate: remarkModal.officialCertFile || null
      })
    } else {
      res = await updateDeathCertificateStatus({
        id: remarkModal.record.id,
        newStatus: remarkModal.targetStatus,
        remarks: remarkModal.remarkText,
        officerName,
        officialUploadedCertificate: remarkModal.officialCertFile || null
      })
    }

    if (res.success) {
      toast.success(`स्थिति/दस्तावेज अपडेट हो गए: ${remarkModal.targetStatus}!`, { id: toastId })
      
      const nowIso = new Date().toISOString()
      const updatedTimelineItem = {
        id: `t-${Date.now()}`,
        action: remarkModal.officialCertFile ? `Official Signed Document Uploaded/Updated (${remarkModal.targetStatus})` : `Status Changed to ${remarkModal.targetStatus}`,
        status: remarkModal.targetStatus,
        performedBy: officerName,
        role: 'Officer',
        remarks: remarkModal.remarkText.trim(),
        officialUploadedCertificate: remarkModal.officialCertFile || null,
        timestamp: nowIso
      }

      // Audit Trail Logging in Firestore audit_logs collection
      try {
        addDoc(collection(db, 'audit_logs'), {
          action: remarkModal.officialCertFile ? 'OFFICIAL_CERTIFICATE_UPLOADED_OR_UPDATED' : `STATUS_CHANGE_TO_${remarkModal.targetStatus.toUpperCase().replace(/\s+/g, '_')}`,
          status: remarkModal.targetStatus,
          serviceType: remarkModal.serviceType,
          applicationId: remarkModal.record.id,
          applicationNo: remarkModal.record.applicationNo || 'N/A',
          performedBy: officerName,
          officerName: officerName,
          remarks: remarkModal.remarkText.trim(),
          officialCertFileName: remarkModal.officialCertFile?.fileName || null,
          timestamp: nowIso,
          createdAt: serverTimestamp()
        }).catch(err => console.warn('[Admin Audit Log Error]:', err));
      } catch (auditErr) {}

      const updateLocalDetail = (prev) => {
        if (!prev || prev.id !== remarkModal.record.id) return prev
        return {
          ...prev,
          status: remarkModal.targetStatus,
          lastOfficerRemark: remarkModal.remarkText.trim(),
          lastOfficerName: officerName,
          officialUploadedCertificate: remarkModal.officialCertFile || prev.officialUploadedCertificate || null,
          timeline: [...(prev.timeline || []), updatedTimelineItem]
        }
      }

      setSelectedDeathDetail(prev => updateLocalDetail(prev))
      setSelectedBirthDetail(prev => updateLocalDetail(prev))
      setSelectedWaterDetail(prev => updateLocalDetail(prev))
      setSelectedNoDuesDetail(prev => updateLocalDetail(prev))

      // Direct React State Update for instant top stats counter & list card updates
      const updateRecordState = (list) => list.map(r => (r.id === remarkModal.record.id || (r.applicationNo && r.applicationNo === remarkModal.record.applicationNo)) ? { 
        ...r, 
        status: remarkModal.targetStatus,
        lastOfficerRemark: remarkModal.remarkText.trim(),
        lastOfficerName: officerName,
        officialUploadedCertificate: remarkModal.officialCertFile || r.officialUploadedCertificate || null,
        timeline: [...(r.timeline || []), updatedTimelineItem]
      } : r)

      setDeathRecords(prev => updateRecordState(prev))
      setBirthRecords(prev => updateRecordState(prev))
      setWaterRecords(prev => updateRecordState(prev))
      setNoDuesRecords(prev => updateRecordState(prev))

      // Send Targeted Notification to Citizen Email & UID
      const rec = remarkModal.record;
      if (rec) {
        sendNotification({
          serviceType: remarkModal.serviceType,
          applicationId: rec.id,
          applicationNo: rec.applicationNo,
          userEmail: rec.userEmail || rec.applicantDetails?.email || '',
          userUid: rec.userUid || '',
          event: 'STATUS_UPDATE',
          status: remarkModal.targetStatus,
          message: `आपके आवेदन (${rec.applicationNo || 'N/A'}) की स्थिति अपडेट कर '${remarkModal.targetStatus}' कर दी गई है।`,
          officerRemark: remarkModal.remarkText.trim(),
          officerName
        }).catch(err => console.warn('[Admin] Send notification error:', err));
      }

      setRemarkModal({ isOpen: false, record: null, serviceType: 'death', targetStatus: '', remarkText: '', officerName: 'Nagar Palika Officer', officialCertFile: null })
      loadDeathRecords()
      loadBirthRecords()
      loadWaterRecords()
      loadNoDuesRecords()
    } else {
      toast.error(`अपडेट विफल: ${res.error} (Update failed)`, { id: toastId })
    }
  }



  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Approved':
      case 'Certificate Generated':
      case 'Completed':
      case 'Sanctioned':
        return 'bg-emerald-600 text-white font-extrabold shadow-2xs border border-emerald-700';
      case 'Rejected':
        return 'bg-rose-600 text-white font-extrabold shadow-2xs border border-rose-700';
      case 'Correction Requested':
        return 'bg-amber-500 text-slate-950 font-extrabold shadow-2xs border border-amber-600';
      case 'Under Review':
        return 'bg-purple-600 text-white font-extrabold shadow-2xs border border-purple-700';
      case 'Submitted':
        return 'bg-sky-600 text-white font-extrabold shadow-2xs border border-sky-700';
      default:
        return 'bg-slate-700 text-white font-extrabold shadow-2xs border border-slate-800';
    }
  }

  const filteredDeathRecords = deathRecords
    .filter(r => {
      if (!deathSearch) return true
      const search = deathSearch.toLowerCase()
      return (
        r.applicationNo?.toLowerCase().includes(search) ||
        r.deceasedDetails?.fullName?.toLowerCase().includes(search) ||
        r.applicantDetails?.fullName?.toLowerCase().includes(search) ||
        r.status?.toLowerCase().includes(search)
      )
    })
    .sort((a, b) => new Date(b.appliedAt || b.createdAt || 0) - new Date(a.appliedAt || a.createdAt || 0))

  const filteredBirthRecords = birthRecords
    .filter(r => {
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
    .sort((a, b) => new Date(b.appliedAt || b.createdAt || 0) - new Date(a.appliedAt || a.createdAt || 0))

  const filteredWaterRecords = waterRecords
    .filter(r => {
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
    .sort((a, b) => new Date(b.appliedAt || b.createdAt || 0) - new Date(a.appliedAt || a.createdAt || 0))

  const filteredNoDuesRecords = noDuesRecords
    .filter(r => {
      if (!noDuesSearch) return true
      const search = noDuesSearch.toLowerCase()
      return (
        r.applicationNo?.toLowerCase().includes(search) ||
        r.applicantDetails?.fullName?.toLowerCase().includes(search) ||
        r.propertyDetails?.propertyId?.toLowerCase().includes(search) ||
        r.applicantDetails?.wardNo?.toLowerCase().includes(search) ||
        r.status?.toLowerCase().includes(search)
      )
    })
    .sort((a, b) => new Date(b.appliedAt || b.createdAt || 0) - new Date(a.appliedAt || a.createdAt || 0))

  const currentAccount = adminAccounts[currentAdminUser]
  const isSuperAdmin = currentAdminRole === 'super_admin' || currentAdminUser === 'super_admin'
  const allowedTabs = isSuperAdmin 
    ? ['death-certificates', 'birth-certificates', 'water-connections', 'no-dues-certificates', 'audit', 'security-settings']
    : (currentAccount?.allowedTabs || ['death-certificates', 'birth-certificates', 'water-connections', 'no-dues-certificates', 'audit', 'security-settings'])

  const allTabDefs = [
    { key: 'death-certificates', label: 'मृत्यु प्रमाण पत्र आवेदन', labelShort: 'मृत्यु', icon: FileText },
    { key: 'birth-certificates', label: 'जन्म प्रमाण पत्र आवेदन', labelShort: 'जन्म', icon: Baby },
    { key: 'water-connections', label: 'जल कनेक्शन आवेदन', labelShort: 'जल', icon: Droplet },
    { key: 'no-dues-certificates', label: 'नो ड्यूज NOC प्रभाग', labelShort: 'नो ड्यूज NOC', icon: Building2 },
    { key: 'audit', label: 'ऑडिट लॉग', labelShort: 'ऑडिट', icon: History },
    { key: 'security-settings', label: 'सुरक्षा एवं क्रेडेंशियल', labelShort: 'सुरक्षा', icon: Key },
  ]

  const visibleTabs = allTabDefs.filter(t => allowedTabs.includes(t.key))

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 no-print print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <a href="/" className="w-9 h-9 flex items-center justify-center hover:opacity-90 transition shrink-0" title="Home">
              <img src="/mp-logo.png" alt="मध्य प्रदेश शासन" className="w-9 h-9 object-contain drop-shadow-sm" />
            </a>
            <div className="min-w-0">
              <h1 className="font-extrabold text-slate-900 text-sm tracking-tight truncate">
                <span className="hidden sm:inline">ई-सेवा अधिकारी प्रशासन पैनल (Nagar Palika Officer Portal)</span>
                <span className="sm:hidden">ई-सेवा पैनल</span>
              </h1>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-sm">
            <a href="/" className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white transition flex items-center gap-1.5 whitespace-nowrap">
              <span>📜</span> होम
            </a>
            <a href="/death-certificate" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white transition flex items-center gap-1.5 whitespace-nowrap">
              <span>⚰️</span> मृत्यु
            </a>
            <a href="/birth-certificate" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white transition flex items-center gap-1.5 whitespace-nowrap">
              <span>👶</span> जन्म
            </a>
            <a href="/water-connection" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white transition flex items-center gap-1.5 whitespace-nowrap">
              <span>💧</span> जल
            </a>
            <a href="/no-dues-certificate" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white transition flex items-center gap-1.5 whitespace-nowrap">
              <span>🏢</span> नो ड्यूज
            </a>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 shrink-0">
              {/* Officer Notification Bell Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowOfficerNotifs(!showOfficerNotifs)}
                  className="relative p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 transition shadow-sm flex items-center gap-1.5"
                  title="नये फॉर्म सबमिशन नोटिफिकेशन"
                >
                  <Bell className="w-4 h-4 text-amber-700 animate-pulse" />
                  <span className="text-[11px] font-bold hidden sm:inline">नोटिफिकेशन</span>
                  {officerNotifications.filter(n => !n.isRead).length > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                      {officerNotifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>

                {showOfficerNotifs && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-scale-in">
                    <div className="px-4 py-3 bg-amber-50/80 border-b border-amber-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-amber-700" />
                        <h3 className="text-xs font-extrabold text-slate-900">नये आवेदक फॉर्म नोटिफिकेशन</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {officerNotifications.some(n => !n.isRead) && (
                          <button 
                            onClick={handleMarkAllNotificationsRead}
                            className="text-[10px] text-amber-800 font-extrabold hover:underline bg-amber-100 px-2 py-0.5 rounded border border-amber-200"
                          >
                            सब पढ़े चिह्नित करें
                          </button>
                        )}
                        <button onClick={() => setShowOfficerNotifs(false)} className="p-1 text-slate-400 hover:text-slate-700">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {officerNotifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500 font-medium">कोई नया फॉर्म सबमिशन नोटिफिकेशन नहीं है</div>
                      ) : (
                        officerNotifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3.5 hover:bg-amber-50/40 transition-colors cursor-pointer space-y-1 relative ${!n.isRead ? 'bg-amber-50/30 font-semibold' : 'opacity-75'}`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-mono flex items-center gap-1.5">
                                {!n.isRead && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                                {n.applicationNo || 'Form'}
                              </span>
                              <span className="text-slate-400 font-mono text-[10px]">
                                {formatTimestamp(n.timestamp || n.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-800 leading-snug">
                              {cleanHindiText(n.message)}
                            </p>
                            {n.applicantName && (
                              <div className="text-[10px] text-slate-500 font-medium flex items-center gap-2 pt-0.5 flex-wrap">
                                <span>👤 आवेदक: <strong>{cleanHindiText(n.applicantName)}</strong></span>
                                <span>📞 फोन: <strong>{n.applicantMobile}</strong></span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>


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
                <p className="text-xs text-slate-500 max-w-xs mx-auto">नगर पालिका परिषद झाबुआ अधिकारी प्रशासन पोर्टल (e-Seva Parishad Jhabua Officer Administration Portal)</p>
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
                    {filteredDeathRecords.map((record, index) => (
                      <div key={record.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-slate-300 transition-all shadow-sm space-y-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[11px] font-mono font-extrabold text-slate-900 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded shadow-2xs">
                                #{index + 1}
                              </span>
                              <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                📅 {formatDate(record.appliedAt || record.createdAt)}
                              </span>
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
                              <Printer className="w-3.5 h-3.5 text-emerald-700" /> पावती पत्र
                            </button>

                            {(record.status === 'Approved' || record.status === 'Certificate Generated' || record.status === 'Completed') && (
                              <button
                                onClick={() => setDeathCertPreview(record)}
                                className="btn btn-primary btn-sm bg-gradient-to-r from-emerald-600 to-emerald-700 font-bold text-[11px]"
                              >
                                📜 प्रमाण पत्र
                              </button>
                            )}

                            {record.officialUploadedCertificate && (
                              <a
                                href={record.officialUploadedCertificate.fileData}
                                download={record.officialUploadedCertificate.fileName || 'Official_Signed_Death_Certificate.pdf'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary btn-sm bg-gradient-to-r from-emerald-800 to-teal-800 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                                title="अधिकारी द्वारा अपलोड हस्ताक्षरित मूल दस्तावेज देखें/डाउनलोड करें"
                              >
                                <Download className="w-3.5 h-3.5" /> 📜 अपलोड हस्ताक्षरित आदेश
                              </a>
                            )}

                            {(record.status === 'Approved' || record.status === 'Certificate Generated' || record.status === 'Completed' || record.status === 'Sanctioned') && (
                              <button
                                onClick={() => setRemarkModal({
                                  isOpen: true,
                                  record,
                                  serviceType: 'death',
                                  targetStatus: record.status,
                                  remarkText: 'अधिकारी हस्ताक्षरित दस्तावेज अपडेट किया गया',
                                  officerName: adminAccounts[currentAdminUser]?.name || 'Registrar Officer',
                                  officialCertFile: record.officialUploadedCertificate || null
                                })}
                                className="btn btn-secondary btn-sm flex items-center gap-1 font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border-amber-200 text-[11px]"
                                title="अधिकारी हस्ताक्षरित दस्तावेज री-अपलोड करें या बदलें"
                              >
                                <Edit className="w-3.5 h-3.5 text-amber-700" /> 🔄 दस्तावेज अपडेट करें
                              </button>
                            )}

                            {record.status === 'Submitted' && (
                              <button
                                onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'death', targetStatus: 'Under Review', remarkText: 'समीक्षा हेतु चुना गया', officerName: adminAccounts[currentAdminUser]?.name || 'Registrar Officer' })}
                                className="btn btn-secondary btn-sm bg-blue-50 border-blue-200 text-blue-700 font-bold text-[11px]"
                              >
                                👁️ समीक्षा करें
                              </button>
                            )}

                            {record.status !== 'Approved' && record.status !== 'Certificate Generated' && record.status !== 'Completed' && (
                              <button
                                onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'death', targetStatus: 'Approved', remarkText: 'सभी दस्तावेज सत्यापित। स्वीकृत।', officerName: adminAccounts[currentAdminUser]?.name || 'Registrar Officer' })}
                                className="btn btn-primary btn-sm bg-gradient-to-r from-emerald-600 to-emerald-700 font-bold text-[11px]"
                              >
                                ✅ स्वीकृत करें
                              </button>
                            )}

                            {record.status !== 'Rejected' && (
                              <button
                                onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'death', targetStatus: 'Rejected', remarkText: 'दस्तावेज अपूर्ण', officerName: adminAccounts[currentAdminUser]?.name || 'Registrar Officer' })}
                                className="btn btn-danger btn-sm font-bold text-[11px]"
                              >
                                ❌ निरस्त
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
                    {filteredBirthRecords.map((record, index) => (
                      <div key={record.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-slate-300 transition-all shadow-sm space-y-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[11px] font-mono font-extrabold text-slate-900 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded shadow-2xs">
                                #{index + 1}
                              </span>
                              <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                📅 {formatDate(record.appliedAt || record.createdAt)}
                              </span>
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
                              <Printer className="w-3.5 h-3.5 text-blue-700" /> पावती पत्र
                            </button>

                            {(record.status === 'Approved' || record.status === 'Certificate Generated' || record.status === 'Completed') && (
                              <button
                                onClick={() => setBirthCertPreview(record)}
                                className="btn btn-primary btn-sm bg-gradient-to-r from-blue-600 to-blue-700 font-bold text-[11px]"
                              >
                                📜 प्रमाण पत्र
                              </button>
                            )}

                            {record.officialUploadedCertificate && (
                              <a
                                href={record.officialUploadedCertificate.fileData}
                                download={record.officialUploadedCertificate.fileName || 'Official_Signed_Birth_Certificate.pdf'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary btn-sm bg-gradient-to-r from-blue-800 to-indigo-800 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                                title="अधिकारी द्वारा अपलोड हस्ताक्षरित मूल दस्तावेज देखें/डाउनलोड करें"
                              >
                                <Download className="w-3.5 h-3.5" /> 📜 अपलोड हस्ताक्षरित आदेश
                              </a>
                            )}

                            {(record.status === 'Approved' || record.status === 'Certificate Generated' || record.status === 'Completed' || record.status === 'Sanctioned') && (
                              <button
                                onClick={() => setRemarkModal({
                                  isOpen: true,
                                  record,
                                  serviceType: 'birth',
                                  targetStatus: record.status,
                                  remarkText: 'अधिकारी हस्ताक्षरित दस्तावेज अपडेट किया गया',
                                  officerName: adminAccounts[currentAdminUser]?.name || 'Registrar Officer',
                                  officialCertFile: record.officialUploadedCertificate || null
                                })}
                                className="btn btn-secondary btn-sm flex items-center gap-1 font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border-amber-200 text-[11px]"
                                title="अधिकारी हस्ताक्षरित दस्तावेज री-अपलोड करें या बदलें"
                              >
                                <Edit className="w-3.5 h-3.5 text-amber-700" /> 🔄 दस्तावेज अपडेट करें
                              </button>
                            )}

                            {record.status === 'Submitted' && (
                              <button
                                onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'birth', targetStatus: 'Under Review', remarkText: 'समीक्षा हेतु चुना गया', officerName: adminAccounts[currentAdminUser]?.name || 'Registrar Officer' })}
                                className="btn btn-secondary btn-sm bg-blue-50 border-blue-200 text-blue-700 font-bold text-[11px]"
                              >
                                👁️ समीक्षा करें
                              </button>
                            )}

                            {record.status !== 'Approved' && record.status !== 'Certificate Generated' && record.status !== 'Completed' && (
                              <button
                                onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'birth', targetStatus: 'Approved', remarkText: 'सभी दस्तावेज सत्यापित। स्वीकृत।', officerName: adminAccounts[currentAdminUser]?.name || 'Registrar Officer' })}
                                className="btn btn-primary btn-sm bg-gradient-to-r from-blue-600 to-blue-700 font-bold text-[11px]"
                              >
                                ✅ स्वीकृत करें
                              </button>
                            )}

                            {record.status !== 'Rejected' && (
                              <button
                                onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'birth', targetStatus: 'Rejected', remarkText: 'दस्तावेज अपूर्ण', officerName: adminAccounts[currentAdminUser]?.name || 'Registrar Officer' })}
                                className="btn btn-danger btn-sm font-bold text-[11px]"
                              >
                                ❌ निरस्त
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
                    {filteredWaterRecords.map((record, index) => (
                      <div key={record.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-slate-300 transition-all shadow-sm space-y-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[11px] font-mono font-extrabold text-slate-900 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded shadow-2xs">
                                #{index + 1}
                              </span>
                              <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                📅 {formatDate(record.appliedAt || record.createdAt)}
                              </span>
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
                              <Printer className="w-3.5 h-3.5 text-teal-700" /> पावती पत्र
                            </button>

                            {record.status === 'Submitted' && (
                              <button
                                onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'water_connection', targetStatus: 'Under Review', remarkText: 'समीक्षा हेतु चुना गया', officerName: adminAccounts[currentAdminUser]?.name || 'Water Supply Officer' })}
                                className="btn btn-secondary btn-sm bg-blue-50 border-blue-200 text-blue-700 font-bold text-[11px]"
                              >
                                👁️ समीक्षा करें
                              </button>
                            )}

                            {record.status !== 'Approved' && record.status !== 'Sanctioned' && record.status !== 'Completed' && (
                              <button
                                onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'water_connection', targetStatus: 'Approved', remarkText: 'साइट प्लान एवं चार्जेज सत्यापित। जल कनेक्शन स्वीकृत।', officerName: adminAccounts[currentAdminUser]?.name || 'Water Supply Officer' })}
                                className="btn btn-primary btn-sm bg-gradient-to-r from-teal-600 to-emerald-700 font-bold text-[11px]"
                              >
                                ✅ स्वीकृत करें
                              </button>
                            )}

                            {record.status !== 'Rejected' && (
                              <button
                                onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'water_connection', targetStatus: 'Rejected', remarkText: 'दस्तावेज अपूर्ण', officerName: adminAccounts[currentAdminUser]?.name || 'Water Supply Officer' })}
                                className="btn btn-danger btn-sm font-bold text-[11px]"
                              >
                                ❌ निरस्त
                              </button>
                            )}

                            {(record.status === 'Approved' || record.status === 'Sanctioned' || record.status === 'Completed') && (
                              <button
                                onClick={() => setWaterCertPreview(record)}
                                className="btn btn-primary btn-sm bg-gradient-to-r from-teal-600 to-teal-700 font-bold text-[11px]"
                              >
                                📜 स्वीकृति पत्र
                              </button>
                            )}

                            {record.officialUploadedCertificate && (
                              <a
                                href={record.officialUploadedCertificate.fileData}
                                download={record.officialUploadedCertificate.fileName || 'Official_Signed_Water_Sanction_Permit.pdf'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary btn-sm bg-gradient-to-r from-teal-800 to-emerald-800 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                                title="अधिकारी द्वारा अपलोड हस्ताक्षरित मूल दस्तावेज देखें/डाउनलोड करें"
                              >
                                <Download className="w-3.5 h-3.5" /> 📜 अपलोड हस्ताक्षरित आदेश
                              </a>
                            )}

                            {(record.status === 'Approved' || record.status === 'Certificate Generated' || record.status === 'Completed' || record.status === 'Sanctioned') && (
                              <button
                                onClick={() => setRemarkModal({
                                  isOpen: true,
                                  record,
                                  serviceType: 'water_connection',
                                  targetStatus: record.status,
                                  remarkText: 'अधिकारी हस्ताक्षरित दस्तावेज अपडेट किया गया',
                                  officerName: adminAccounts[currentAdminUser]?.name || 'Water Supply Officer',
                                  officialCertFile: record.officialUploadedCertificate || null
                                })}
                                className="btn btn-secondary btn-sm flex items-center gap-1 font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border-amber-200 text-[11px]"
                                title="अधिकारी हस्ताक्षरित दस्तावेज री-अपलोड करें या बदलें"
                              >
                                <Edit className="w-3.5 h-3.5 text-amber-700" /> 🔄 दस्तावेज अपडेट करें
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedWaterDetail(record)}
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

            {/* ── NO DUES NOC TAB ──────────────────────────────────────────── */}
            {activeTab === 'no-dues-certificates' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">नो ड्यूज प्रमाण पत्र (Property Tax NOC) प्रभाग</h2>
                    <p className="text-xs text-slate-500 mt-0.5">प्राप्त NOC आवेदनों का सत्यापन, चुकता रसीद जांच व आधिकारिक हस्ताक्षरित प्रमाण पत्र जारी करना</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        value={noDuesSearch}
                        onChange={e => setNoDuesSearch(e.target.value)}
                        placeholder="आवेदन क्रमांक, नाम, या संपत्ति आईडी से खोजें..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>
                    <button onClick={loadNoDuesRecords} className="btn btn-secondary btn-sm shrink-0">
                      <RefreshCw className={`w-3.5 h-3.5 ${noDuesLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                  {[
                    { label: 'कुल NOC', count: noDuesRecords.length, color: 'slate' },
                    { label: 'जमा', count: noDuesRecords.filter(r => r.status === 'Submitted').length, color: 'blue' },
                    { label: 'समीक्षा', count: noDuesRecords.filter(r => r.status === 'Under Review').length, color: 'amber' },
                    { label: 'स्वीकृत', count: noDuesRecords.filter(r => r.status === 'Approved' || r.status === 'Certificate Generated' || r.status === 'Sanctioned' || r.status === 'Completed').length, color: 'emerald' },
                    { label: 'अस्वीकृत', count: noDuesRecords.filter(r => r.status === 'Rejected').length, color: 'red' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center shadow-sm">
                      <div className={`text-xl sm:text-2xl font-extrabold text-${stat.color}-700`}>{stat.count}</div>
                      <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 sm:mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {noDuesLoading ? (
                  <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
                    <RefreshCw className="animate-spin w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    नो ड्यूज रिकॉर्ड्स लोड हो रहे हैं...
                  </div>
                ) : filteredNoDuesRecords.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200 space-y-2">
                    <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-600">कोई नो ड्यूज आवेदन नहीं मिला</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNoDuesRecords.map((record, index) => (
                      <div key={record.id} className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-mono font-extrabold text-slate-900 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded shadow-2xs">
                                #{index + 1}
                              </span>
                              <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                📅 {formatDate(record.appliedAt || record.createdAt)}
                              </span>
                              <span className="font-mono text-xs font-extrabold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                {record.applicationNo}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusChip(record.status)}`}>
                                {record.status}
                              </span>
                            </div>
                            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                              {cleanHindiText(record.applicantDetails?.fullName)} {cleanHindiText(record.applicantDetails?.fatherHusbandName) ? `(पिता/पति: ${cleanHindiText(record.applicantDetails?.fatherHusbandName)})` : ''}
                            </h3>
                            <p className="text-xs text-slate-600 font-medium">
                              संपत्ति आईडी: <strong className="text-slate-900 font-mono">{record.propertyDetails?.propertyId}</strong> | टी.आर.आई. रिफरेंस: <strong className="text-slate-900 font-mono">{record.taxDetails?.triRefNo}</strong> | जमा कर: <strong>₹{record.taxDetails?.amountPaid}</strong>
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                            {/* Submission Letter Modal */}
                            <button
                              onClick={() => setLetterModal({ isOpen: true, record, serviceType: 'no_dues' })}
                              className="btn btn-secondary btn-sm flex items-center gap-1 font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-[11px]"
                            >
                              <Printer className="w-3.5 h-3.5 text-emerald-700" /> आवेदन पत्र
                            </button>

                            {/* View Uploaded Tax Receipt */}
                            {record.documents?.taxReceipt && (
                              <a
                                href={record.documents.taxReceipt.data}
                                download={record.documents.taxReceipt.name || 'Property_Tax_Receipt.pdf'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary btn-sm flex items-center gap-1 font-bold text-blue-900 bg-blue-50 border-blue-200 text-[11px]"
                              >
                                📄 कर रसीद देखें
                              </a>
                            )}

                            {record.status === 'Submitted' && (
                              <button
                                onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'no_dues', targetStatus: 'Under Review', remarkText: 'कर रसीद व SAF सत्यापन हेतु चुना गया', officerName: adminAccounts[currentAdminUser]?.name || 'Zonal Revenue Officer' })}
                                className="btn btn-secondary btn-sm bg-blue-50 border-blue-200 text-blue-700 font-bold text-[11px]"
                              >
                                👁️ समीक्षा करें
                              </button>
                            )}

                            {record.status !== 'Approved' && record.status !== 'Certificate Generated' && record.status !== 'Completed' && (
                              <button
                                onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'no_dues', targetStatus: 'Approved', remarkText: 'संपत्ति कर व SAF पूर्णतः सत्यापित। नो ड्यूज प्रमाण पत्र स्वीकृत।', officerName: adminAccounts[currentAdminUser]?.name || 'Zonal Revenue Officer' })}
                                className="btn btn-primary btn-sm bg-gradient-to-r from-emerald-700 to-teal-800 font-bold text-[11px]"
                              >
                                ✅ स्वीकृत करें व NOC जारी करें
                              </button>
                            )}

                            {record.status !== 'Rejected' && (
                              <button
                                onClick={() => setRemarkModal({ isOpen: true, record, serviceType: 'no_dues', targetStatus: 'Rejected', remarkText: 'वर्तमान कर रसीद या दस्तावेज अमान्य', officerName: adminAccounts[currentAdminUser]?.name || 'Zonal Revenue Officer' })}
                                className="btn btn-danger btn-sm font-bold text-[11px]"
                              >
                                ❌ निरस्त
                              </button>
                            )}

                            {(record.status === 'Approved' || record.status === 'Certificate Generated' || record.status === 'Completed') && (
                              <button
                                onClick={() => setNoDuesCertPreview(record)}
                                className="btn btn-primary btn-sm bg-emerald-800 font-bold text-[11px]"
                              >
                                📜 नो ड्यूज प्रमाण पत्र
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedNoDuesDetail(record)}
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

        {/* Security & Accounts Settings Tab (Super Admin Only) */}
        {activeTab === 'security-settings' && (
          <div className="space-y-6 animate-fade-in">

            {/* Master Maintenance & Routine Security Check Toggle */}
            <div className={`p-6 rounded-3xl border transition-all ${
              maintState.isMaintenanceMode 
                ? 'bg-rose-50 border-rose-300 text-rose-950 shadow-md' 
                : 'bg-emerald-50/60 border-emerald-200 text-emerald-950 shadow-sm'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-2xl ${maintState.isMaintenanceMode ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
                    <ShieldAlert className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base flex items-center gap-2">
                      {maintState.isMaintenanceMode ? '🔴 रूटीन सुरक्षा अद्यतन / रखरखाव मोड सक्रिय (Maintenance Lockdown ON)' : '🟢 प्रणाली सामान्य स्थिति में कार्यरत है (System Online)'}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      सुरक्षा जांच, सर्वर अद्यतन या तकनीकी बदलाव के समय मुख्य अधिकारी पोर्टल को **रखरखाव / रूटीन चेक मोड** में लॉक कर सकते हैं।
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleToggleMaintenance}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-md shrink-0 ${
                    maintState.isMaintenanceMode
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      : 'bg-rose-700 hover:bg-rose-800 text-white'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{maintState.isMaintenanceMode ? 'सुरक्षा अद्यतन समाप्त करें (Restore Website)' : 'रूटीन सुरक्षा अद्यतन मोड चालू करें (Enable Maintenance Lockdown)'}</span>
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Key className="w-5 h-5 text-purple-600" />
                    विभाग अनुसार अधिकृत लॉगिन क्रेडेंशियल प्रबंधन (Security Credentials Management)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    मुख्य नगर पालिका अधिकारी (CMO / Super Admin) सुरक्षा हेतु अधिकारियों के पासवर्ड एवं नाम अद्यतन कर सकते हैं।
                  </p>
                </div>
                <button
                  onClick={loadCloudAccounts}
                  className="btn btn-secondary btn-sm text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> क्लाउड सिंक (Sync Cloud)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Birth & Death Registrar */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 relative">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">1</div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">जन्म व मृत्यु रजिस्ट्रार</h4>
                      <p className="text-[10px] text-slate-500 font-mono font-bold">यूजर: admin</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">अधिकारी नाम (Display Name)</label>
                      <input
                        type="text"
                        value={credEditState.admin?.name || ''}
                        onChange={(e) => setCredEditState(prev => ({ ...prev, admin: { ...prev.admin, name: e.target.value } }))}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">विभागाध्यक्ष ईमेल (Official Email)</label>
                      <input
                        type="email"
                        value={credEditState.admin?.email || ''}
                        onChange={(e) => setCredEditState(prev => ({ ...prev, admin: { ...prev.admin, email: e.target.value } }))}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-600 bg-white"
                        placeholder="birthdeath.jhabua@mp.gov.in"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">सुरक्षा पासवर्ड (Password)</label>
                      <input
                        type="text"
                        value={credEditState.admin?.password || ''}
                        onChange={(e) => setCredEditState(prev => ({ ...prev, admin: { ...prev.admin, password: e.target.value } }))}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-emerald-600 bg-white"
                        placeholder="jhabua@2024"
                      />
                    </div>
                    <button
                      onClick={() => handleUpdateCredentials('admin')}
                      className="w-full btn btn-primary btn-sm text-xs font-bold flex items-center justify-center gap-1.5 mt-2"
                    >
                      <Save className="w-3.5 h-3.5" /> क्रेडेंशियल सहेजें
                    </button>
                  </div>
                </div>

                {/* 2. Water Supply Officer */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 relative">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-xs">2</div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">जल प्रदाय विभाग अधिकारी</h4>
                      <p className="text-[10px] text-slate-500 font-mono font-bold">यूजर: water_admin</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">अधिकारी नाम (Display Name)</label>
                      <input
                        type="text"
                        value={credEditState.water_admin?.name || ''}
                        onChange={(e) => setCredEditState(prev => ({ ...prev, water_admin: { ...prev.water_admin, name: e.target.value } }))}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">विभागाध्यक्ष ईमेल (Official Email)</label>
                      <input
                        type="email"
                        value={credEditState.water_admin?.email || ''}
                        onChange={(e) => setCredEditState(prev => ({ ...prev, water_admin: { ...prev.water_admin, email: e.target.value } }))}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-600 bg-white"
                        placeholder="water.jhabua@mp.gov.in"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">सुरक्षा पासवर्ड (Password)</label>
                      <input
                        type="text"
                        value={credEditState.water_admin?.password || ''}
                        onChange={(e) => setCredEditState(prev => ({ ...prev, water_admin: { ...prev.water_admin, password: e.target.value } }))}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-emerald-600 bg-white"
                        placeholder="water@jhabua2024"
                      />
                    </div>
                    <button
                      onClick={() => handleUpdateCredentials('water_admin')}
                      className="w-full btn btn-primary btn-sm text-xs font-bold flex items-center justify-center gap-1.5 mt-2"
                    >
                      <Save className="w-3.5 h-3.5" /> क्रेडेंशियल सहेजें
                    </button>
                  </div>
                </div>

                {/* 3. No Dues NOC Officer */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 relative">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">3</div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">संपत्ति कर व नो ड्यूज अधिकारी</h4>
                      <p className="text-[10px] text-slate-500 font-mono font-bold">यूजर: nodues_admin</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">अधिकारी नाम (Display Name)</label>
                      <input
                        type="text"
                        value={credEditState.nodues_admin?.name || ''}
                        onChange={(e) => setCredEditState(prev => ({ ...prev, nodues_admin: { ...prev.nodues_admin, name: e.target.value } }))}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">विभागाध्यक्ष ईमेल (Official Email)</label>
                      <input
                        type="email"
                        value={credEditState.nodues_admin?.email || ''}
                        onChange={(e) => setCredEditState(prev => ({ ...prev, nodues_admin: { ...prev.nodues_admin, email: e.target.value } }))}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-600 bg-white"
                        placeholder="revenue.jhabua@mp.gov.in"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">सुरक्षा पासवर्ड (Password)</label>
                      <input
                        type="text"
                        value={credEditState.nodues_admin?.password || ''}
                        onChange={(e) => setCredEditState(prev => ({ ...prev, nodues_admin: { ...prev.nodues_admin, password: e.target.value } }))}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-emerald-600 bg-white"
                        placeholder="nodues@jhabua2024"
                      />
                    </div>
                    <button
                      onClick={() => handleUpdateCredentials('nodues_admin')}
                      className="w-full btn btn-primary btn-sm text-xs font-bold flex items-center justify-center gap-1.5 mt-2"
                    >
                      <Save className="w-3.5 h-3.5" /> क्रेडेंशियल सहेजें
                    </button>
                  </div>
                </div>

                {/* 4. Chief Municipal Officer (Super Admin) */}
                <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-5 space-y-4 relative">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold text-xs">4</div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">मुख्य अधिकारी (Super Admin)</h4>
                      <p className="text-[10px] text-purple-700 font-mono font-bold">यूजर: super_admin</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">अधिकारी नाम (Display Name)</label>
                      <input
                        type="text"
                        value={credEditState.super_admin?.name || ''}
                        onChange={(e) => setCredEditState(prev => ({ ...prev, super_admin: { ...prev.super_admin, name: e.target.value } }))}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-600 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">विभागाध्यक्ष ईमेल (Official Email)</label>
                      <input
                        type="email"
                        value={credEditState.super_admin?.email || ''}
                        onChange={(e) => setCredEditState(prev => ({ ...prev, super_admin: { ...prev.super_admin, email: e.target.value } }))}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-purple-600 bg-white"
                        placeholder="cmo.jhabua@mp.gov.in"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">सुरक्षा पासवर्ड (Password)</label>
                      <input
                        type="text"
                        value={credEditState.super_admin?.password || ''}
                        onChange={(e) => setCredEditState(prev => ({ ...prev, super_admin: { ...prev.super_admin, password: e.target.value } }))}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-purple-600 bg-white"
                        placeholder="jhabua@super2024"
                      />
                    </div>
                    <button
                      onClick={() => handleUpdateCredentials('super_admin')}
                      className="w-full bg-purple-700 hover:bg-purple-800 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 mt-2 transition-all shadow-md"
                    >
                      <Save className="w-3.5 h-3.5" /> सुपर एडमिन सहेजें
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )}

        {/* Status Update Remark Modal */}
        {remarkModal.isOpen && (
          <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-[80] flex items-center justify-center p-4">
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
                <p>नाम: {remarkModal.record?.deceasedDetails?.fullName || remarkModal.record?.childDetails?.fullName || remarkModal.record?.applicantDetails?.fullName || 'N/A'}</p>
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

                {/* Upload Official Signed Certificate / Sanction Order */}
                {(remarkModal.targetStatus === 'Approved' || remarkModal.targetStatus === 'Certificate Generated' || remarkModal.targetStatus === 'Completed' || remarkModal.targetStatus === 'Sanctioned') && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <label className="block text-[11px] font-extrabold text-slate-900 mb-1">
                      📤 आधिकारिक हस्ताक्षरित प्रमाण पत्र / स्वीकृति आदेश संलग्न करें (Upload Official Signed Certificate PDF/Image)
                    </label>
                    <p className="text-[10px] text-slate-500">
                      नगर पालिका द्वारा तैयार भौतिक हस्ताक्षरित PDF या स्कैन कॉपी संलग्न करें। यह फ़ाइल नागरिक अपने पोर्टल से सीधे डाउनलोड कर सकेगा।
                    </p>

                    {/* Previously Uploaded Document Preview */}
                    {(remarkModal.officialCertFile || remarkModal.record?.officialUploadedCertificate) && (
                      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-emerald-950 flex items-center gap-1.5">
                            <span>📄</span> पूर्व में अपलोड अधिकारी हस्ताक्षरित दस्तावेज (Current Official Upload):
                          </span>
                          <a
                            href={(remarkModal.officialCertFile || remarkModal.record?.officialUploadedCertificate)?.fileData}
                            download={(remarkModal.officialCertFile || remarkModal.record?.officialUploadedCertificate)?.fileName || 'Official_Document.pdf'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-emerald-800 underline hover:text-emerald-950 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-emerald-300"
                          >
                            <Eye className="w-3 h-3 text-emerald-700" /> देखें / डाउनलोड
                          </a>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {((remarkModal.officialCertFile || remarkModal.record?.officialUploadedCertificate)?.fileType?.includes('image') || ((remarkModal.officialCertFile || remarkModal.record?.officialUploadedCertificate)?.fileData?.startsWith('data:image'))) ? (
                            <div className="w-16 h-16 rounded-xl bg-white border border-emerald-300 overflow-hidden shrink-0 shadow-2xs">
                              <img src={(remarkModal.officialCertFile || remarkModal.record?.officialUploadedCertificate)?.fileData} alt="Official Document" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                              📄 PDF
                            </div>
                          )}
                          <div className="min-w-0 text-xs">
                            <p className="font-extrabold text-slate-900 truncate">{(remarkModal.officialCertFile || remarkModal.record?.officialUploadedCertificate)?.fileName || 'Official_Signed_Document.pdf'}</p>
                            {(remarkModal.officialCertFile || remarkModal.record?.officialUploadedCertificate)?.uploadedBy && (
                              <p className="text-[10px] text-slate-500 font-medium mt-0.5">अपलोडकर्ता: {(remarkModal.officialCertFile || remarkModal.record?.officialUploadedCertificate)?.uploadedBy}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            setRemarkModal(prev => ({
                              ...prev,
                              officialCertFile: {
                                fileData: evt.target.result,
                                fileName: file.name,
                                fileType: file.type,
                                uploadedAt: new Date().toISOString(),
                                uploadedBy: adminAccounts[currentAdminUser]?.name || 'Municipal Officer'
                              }
                            }));
                            toast.success(`फ़ाइल '${file.name}' संलग्न की गई!`);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer border border-slate-300 rounded-xl p-1.5 bg-white"
                    />
                    {remarkModal.officialCertFile && (
                      <div className="flex items-center justify-between text-xs bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-emerald-900 font-bold mt-1">
                        <span>✅ संलग्न फ़ाइल: {remarkModal.officialCertFile.fileName}</span>
                        <button
                          type="button"
                          onClick={() => setRemarkModal(prev => ({ ...prev, officialCertFile: null }))}
                          className="text-rose-600 hover:underline text-[10px]"
                        >
                          हटाएं
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setRemarkModal({ isOpen: false, record: null, serviceType: 'death', targetStatus: '', remarkText: '', officerName: 'Nagar Palika Officer', officialCertFile: null })} className="btn btn-secondary">
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
          <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-[70] overflow-y-auto p-3 sm:p-6 flex items-start justify-center pt-4 sm:pt-8">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[84vh] sm:max-h-[86vh]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                <h3 className="text-slate-900 font-extrabold text-base flex items-center gap-2">
                  📄 ऑनलाइन आवेदन पत्र (Official Application Letter)
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="btn btn-primary btn-sm flex items-center gap-1 font-bold text-xs"
                  >
                    <Printer className="w-3.5 h-3.5" /> प्रिंट / PDF डाउनलोड
                  </button>
                  <button onClick={() => setLetterModal({ isOpen: false, record: null, serviceType: 'death' })} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 pr-1 pt-3">
                {letterModal.serviceType === 'no_dues' ? (
                  <NoDuesLetterTemplate record={letterModal.record} />
                ) : (
                  <ApplicationLetterTemplate record={letterModal.record} serviceType={letterModal.serviceType} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Death Certificate Preview Modal */}
        {deathCertPreview && (
          <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-[70] overflow-y-auto p-3 sm:p-6 flex items-start justify-center pt-4 sm:pt-8">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[84vh] sm:max-h-[86vh]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
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
                  <button onClick={() => setDeathCertPreview(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 pr-1 pt-3">
                <DeathCertificateTemplate record={deathCertPreview} />
              </div>
            </div>
          </div>
        )}

        {/* Birth Certificate Preview Modal */}
        {birthCertPreview && (
          <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-[70] overflow-y-auto p-3 sm:p-6 flex items-start justify-center pt-4 sm:pt-8">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[84vh] sm:max-h-[86vh]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
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
                  <button onClick={() => setBirthCertPreview(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 pr-1 pt-3">
                <BirthCertificateTemplate record={birthCertPreview} />
              </div>
            </div>
          </div>
        )}

        {/* Water Connection Sanction Permit Modal */}
        {waterCertPreview && (
          <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-[70] overflow-y-auto p-3 sm:p-6 flex items-start justify-center pt-4 sm:pt-8">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[84vh] sm:max-h-[86vh]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
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
                  <button onClick={() => setWaterCertPreview(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 pr-1 pt-3">
                <WaterConnectionTemplate record={waterCertPreview} />
              </div>
            </div>
          </div>
        )}

        {/* No Dues Certificate Preview Modal */}
        {noDuesCertPreview && (
          <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-[70] overflow-y-auto p-3 sm:p-6 flex items-start justify-center pt-4 sm:pt-8">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[84vh] sm:max-h-[86vh]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                <h3 className="text-slate-900 font-extrabold text-base flex items-center gap-2">
                  📜 नो ड्यूज प्रमाण पत्र पूर्वावलोकन (No Dues Certificate Preview)
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="btn btn-primary btn-sm flex items-center gap-1 font-bold text-xs bg-emerald-700"
                  >
                    <Printer className="w-3.5 h-3.5" /> प्रिंट / PDF डाउनलोड
                  </button>
                  <button onClick={() => setNoDuesCertPreview(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 pr-1 pt-3">
                <NoDuesCertificateTemplate record={noDuesCertPreview} />
              </div>
            </div>
          </div>
        )}

        {/* ── APPLICATION DETAILS MODAL (विवरण) ────────────────────────── */}
        {(selectedDeathDetail || selectedBirthDetail || selectedWaterDetail || selectedNoDuesDetail) && (
          <ApplicationDetailModal
            record={selectedDeathDetail || selectedBirthDetail || selectedWaterDetail || selectedNoDuesDetail}
            serviceType={selectedDeathDetail ? 'death' : selectedBirthDetail ? 'birth' : selectedWaterDetail ? 'water_connection' : 'no_dues'}
            onClose={() => {
              setSelectedDeathDetail(null)
              setSelectedBirthDetail(null)
              setSelectedWaterDetail(null)
              setSelectedNoDuesDetail(null)
            }}
            onOpenRemark={(rec, status, targetServiceType) => {
              const effectiveServiceType = targetServiceType || (selectedDeathDetail ? 'death' : selectedBirthDetail ? 'birth' : 'water_connection');
              setRemarkModal({
                isOpen: true,
                record: rec,
                serviceType: effectiveServiceType,
                targetStatus: status,
                remarkText: status === 'Approved' ? 'सभी दस्तावेज सत्यापित। स्वीकृत।' : status === 'Rejected' ? 'दस्तावेज अपूर्ण' : 'समीक्षा की जा रही है',
                officerName: adminAccounts[currentAdminUser]?.name || 'Nagar Palika Officer'
              })
            }}
            onOpenLetter={(rec, targetServiceType) => {
              const effectiveServiceType = targetServiceType || (selectedDeathDetail ? 'death' : selectedBirthDetail ? 'birth' : selectedWaterDetail ? 'water_connection' : 'no_dues');
              setLetterModal({
                isOpen: true,
                record: rec,
                serviceType: effectiveServiceType
              })
            }}
          />
        )}

      </div>
    </div>
  )
}

function ApplicationDetailModal({ record, serviceType, onClose, onOpenRemark, onOpenLetter }) {
  const [previewDoc, setPreviewDoc] = useState(null);

  if (!record) return null

  const isDeath = serviceType === 'death'
  const isBirth = serviceType === 'birth'
  const isWater = serviceType === 'water' || serviceType === 'water_connection'
  const isNoDues = serviceType === 'no_dues'
  const currentServiceKey = isDeath ? 'death' : isBirth ? 'birth' : isWater ? 'water_connection' : 'no_dues'

  const applicant = record.applicantDetails || {}
  const deceased = record.deceasedDetails || {}
  const child = record.childDetails || {}
  const mother = record.motherDetails || {}
  const father = record.fatherDetails || {}
  const property = record.propertyDetails || {}
  const tax = record.taxDetails || {}

  // Official document key title mapping
  const docTitleMap = {
    hospitalSlip: '1. प्रसूति / अस्पताल पर्ची (Hospital Birth Slip)',
    motherAadhaar: '2. माता का आधार कार्ड (Mother Aadhaar)',
    fatherAadhaar: '3. पिता का आधार कार्ड (Father Aadhaar)',
    samagraId: '4. समग्र आईडी (Samagra ID)',
    anganwadiLetter: '5. आंगनवाड़ी / एएनएम रिपोर्ट (Anganwadi / ANM Report)',
    mcpCard: '6. मातृ एवं शिशु सुरक्षा कार्ड (MCP Card)',
    addressProof: '7. निवास प्रमाण पत्र (Address Proof)',
    deceasedAadhaar: '1. मृतक का आधार कार्ड (Deceased Aadhaar)',
    applicantAadhaar: '2. आवेदक का आधार कार्ड (Informant Aadhaar)',
    cremationReceipt: '3. श्मशान / कब्रिस्तान रसीद (Cremation / Burial Receipt)',
    panchnamaLetter: '4. पंचनामा / पुलिस मर्ग रिपोर्ट (Panchnama / Police Report)',
    hospitalDeathSlip: '5. अस्पताल मृत्यु पर्ची (Hospital Death Slip)',
    idProofDoc: '1. आईडी प्रूफ एवं संपत्ति / शपथ पत्र (ID & Property / Affidavit)',
    sitePlanDoc: '2. साइट प्लान नक्शा (Site Plan Map)',
    connectionChargesReceipt: '3. नल कनेक्शन शुल्क रसीद (Connection Fee Receipt)',
    roadCuttingReceipt: '4. सड़क खुदाई शुल्क रसीद (Road Cutting Fee Receipt)'
  };

  const getNormalizedDocs = () => {
    let list = [];

    if (record.officialUploadedCertificate && record.officialUploadedCertificate.fileData) {
      list.push({
        key: 'officialUploadedCertificate',
        title: '📜 अधिकारी द्वारा अपलोड हस्ताक्षरित प्रमाण पत्र / आदेश (Official Signed Document)',
        fileName: record.officialUploadedCertificate.fileName || 'Official_Signed_Document.pdf',
        fileType: record.officialUploadedCertificate.fileType || (record.officialUploadedCertificate.fileData?.startsWith('data:image') ? 'image/jpeg' : 'application/pdf'),
        fileSize: record.officialUploadedCertificate.fileSize || '',
        fileData: record.officialUploadedCertificate.fileData,
        uploadedAt: record.officialUploadedCertificate.uploadedAt,
        officialFileName: record.officialUploadedCertificate.fileName
      });
    }

    const rawDocs = record.documents || record.uploadedDocs;
    if (rawDocs) {
      if (typeof rawDocs === 'object' && !Array.isArray(rawDocs)) {
        const objDocs = Object.entries(rawDocs)
          .filter(([_, val]) => val && typeof val === 'object' && (val.fileData || val.fileUrl || val.url))
          .map(([key, val]) => ({
            key,
            title: val.title || docTitleMap[key] || val.fileName || key,
            fileName: val.fileName || `${key}.jpg`,
            fileType: val.fileType || (val.fileData?.includes('image') ? 'image/jpeg' : 'application/pdf'),
            fileSize: val.fileSize || '',
            fileData: val.fileData || val.fileUrl || val.url,
            uploadedAt: val.uploadedAt
          }));
        list = [...list, ...objDocs];
      } else if (Array.isArray(rawDocs)) {
        const arrDocs = rawDocs
          .filter(val => val && typeof val === 'object' && (val.fileData || val.fileUrl || val.url))
          .map((val, idx) => ({
            key: val.key || `doc_${idx}`,
            title: val.title || docTitleMap[val.key] || val.fileName || val.name || `संलग्न दस्तावेज #${idx + 1}`,
            fileName: val.fileName || val.name || `Document_${idx + 1}`,
            fileType: val.fileType || val.type || 'image/jpeg',
            fileSize: val.fileSize || val.size || '',
            fileData: val.fileData || val.fileUrl || val.url,
            uploadedAt: val.uploadedAt
          }));
        list = [...list, ...arrDocs];
      }
    }

    return list;
  };

  const docEntries = getNormalizedDocs();

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-50 overflow-y-auto p-3 sm:p-6 flex items-start justify-center pt-4 sm:pt-8">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[84vh] sm:max-h-[86vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                {record.applicationNo || 'DRAFT'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                record.status === 'Approved' || record.status === 'Completed' || record.status === 'Sanctioned' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                record.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                record.status === 'Under Review' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {record.status}
              </span>
            </div>
            <h3 className="text-slate-900 font-extrabold text-base">
              {isDeath && `मृत्यु प्रमाण पत्र विवरण: स्व. ${deceased.fullName || 'N/A'}`}
              {isBirth && `जन्म प्रमाण पत्र विवरण: शिशु ${child.fullName || 'अनाम'}`}
              {isWater && `जल कनेक्शन विवरण: ${applicant.fullName || 'N/A'}`}
              {isNoDues && `नो ड्यूज NOC विवरण: ${applicant.fullName || 'N/A'}`}
            </h3>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 pr-1 pt-4 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1">
                {isDeath ? 'मृतक विवरण' : isBirth ? 'शिशु एवं जन्म विवरण' : isNoDues ? 'प्रॉपर्टी व कर भुगतान विवरण' : 'भवन एवं संपत्ति विवरण'}
              </h4>
              <div className="text-xs text-slate-800 space-y-1.5 font-medium">
                {isDeath && (
                  <>
                    <p><span className="text-slate-500">नाम:</span> स्व. {deceased.fullName}</p>
                    <p><span className="text-slate-500">आयु / लिंग:</span> {deceased.age || '—'} वर्ष | {deceased.gender}</p>
                    <p><span className="text-slate-500">मृत्यु तिथि:</span> {deceased.dateOfDeath}</p>
                    <p><span className="text-slate-500">मृत्यु स्थान:</span> {deceased.placeOfDeath}</p>
                    <p><span className="text-slate-500">पिता/पति नाम:</span> {deceased.fatherHusbandName || '—'}</p>
                  </>
                )}
                {isBirth && (
                  <>
                    <p><span className="text-slate-500">शिशु नाम:</span> {child.fullName || 'अनाम'}</p>
                    <p><span className="text-slate-500">लिंग / वजन:</span> {child.gender} | {child.birthWeight ? `${child.birthWeight} kg` : '—'}</p>
                    <p><span className="text-slate-500">जन्म तिथि:</span> {child.dateOfBirth}</p>
                    <p><span className="text-slate-500">जन्म स्थान:</span> {child.placeOfBirth || child.hospitalName || child.homeAddress || '—'}</p>
                    <p><span className="text-slate-500">माता नाम:</span> {mother.fullName}</p>
                    <p><span className="text-slate-500">पिता नाम:</span> {father.fullName}</p>
                  </>
                )}
                {isWater && (
                  <>
                    <p><span className="text-slate-500">मकान क्र.:</span> {property.houseNo || '—'}</p>
                    <p><span className="text-slate-500">वार्ड क्र.:</span> Ward #{applicant.wardNo || '—'}</p>
                    <p><span className="text-slate-500">कनेक्शन प्रकार:</span> {property.connectionSize || '1/2 इंच'} | {property.usagePurpose}</p>
                    <p><span className="text-slate-500">भवन स्वामी:</span> {property.houseOwnerName || applicant.fullName}</p>
                    <p><span className="text-slate-500">लाइसेंस प्लम्बर:</span> {record.plumberDetails?.plumberName || '—'}</p>
                  </>
                )}
                {isNoDues && (
                  <>
                    <p><span className="text-slate-500">प्रॉपर्टी आईडी:</span> {property.propertyId || '—'}</p>
                    <p><span className="text-slate-500">वार्ड / ज़ोन:</span> Ward #{property.wardNo || '6'}, Zone #{property.zoneNo || '1'}</p>
                    <p><span className="text-slate-500">TRI रिफरेंस:</span> {tax.triRefNo || '—'}</p>
                    <p><span className="text-slate-500">वित्तीय वर्ष:</span> {tax.financialYear || '2026-27'}</p>
                    <p><span className="text-slate-500">जमा कर राशि:</span> ₹{tax.amountPaid || '0'}</p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1">आवेदक / संपर्क विवरण</h4>
              <div className="text-xs text-slate-800 space-y-1.5 font-medium">
                <p><span className="text-slate-500">आवेदक नाम:</span> {applicant.fullName || '—'}</p>
                <p><span className="text-slate-500">संबंध:</span> {applicant.relationWithDeceased || applicant.relationWithChild || (applicant.isTenant ? 'किराएदार' : 'मकान मालिक')}</p>
                <p><span className="text-slate-500">मोबाइल:</span> <a href={`tel:${applicant.mobile}`} className="font-mono font-bold text-emerald-700 underline">{applicant.mobile || '—'}</a></p>
                <p><span className="text-slate-500">ईमेल:</span> {applicant.email || '—'}</p>
                <p><span className="text-slate-500">आधार:</span> {applicant.aadhaarNo || applicant.aadhaar || '—'}</p>
                <p><span className="text-slate-500">पता:</span> {applicant.address || applicant.villageCity || 'झाबुआ (म.प्र.)'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>📎 आवेदक द्वारा अपलोड संलग्न फोटो व दस्तावेज ({docEntries.length})</span>
              <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                अधिकारी सत्यापन केंद्र (Inspector Verification)
              </span>
            </h4>
            {docEntries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {docEntries.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-50 hover:bg-emerald-50/40 p-3 rounded-2xl border border-slate-200 transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {doc.fileType?.includes('image') || (doc.fileData && doc.fileData.startsWith('data:image')) ? (
                        <div 
                          onClick={() => setPreviewDoc(doc)}
                          className="w-12 h-12 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden cursor-pointer shrink-0 relative group"
                        >
                          <img src={doc.fileData} alt={doc.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 border border-blue-200 font-bold text-xs">
                          📄 PDF
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{doc.title}</p>
                        <p className="text-[10px] font-mono text-emerald-800 truncate mt-0.5" title={doc.fullVirtualPath || doc.folderPath}>
                          📁 {doc.officialFileName || doc.fileName} {doc.fileSize ? `(${doc.fileSize})` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="btn btn-secondary btn-sm text-[11px] font-bold text-emerald-800 bg-white hover:bg-emerald-100 px-2.5 py-1.5 flex items-center gap-1 border border-slate-200 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-700" /> देखें
                      </button>
                      <a
                        href={doc.fileData}
                        download={doc.fileName || 'document.jpg'}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
                        title="डाउनलोड करें"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-1">
                <p className="text-xs font-bold text-amber-900">⚠️ कोई इलेक्ट्रॉनिक दस्तावेज संलग्न नहीं है</p>
                <p className="text-[11px] text-amber-800">आवेदक ने केवल फॉर्म ऑनलाइन दर्ज किया है। भौतिक पावती पत्र (Hard Copy Application) प्राप्त कर कार्यालय में मूल दस्तावेजों का सत्यापन करें।</p>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              ⏱️ आवेदन टाइमलाइन इतिहास
            </h4>
            <ApplicationTimeline timeline={record.timeline || []} currentStatus={record.status} />
          </div>
        </div>

        {/* HIGH-RES DOCUMENT & PHOTO PREVIEW MODAL FOR OFFICERS */}
        {previewDoc && (
          <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-6 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">{previewDoc.title}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{previewDoc.fileName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={previewDoc.fileData}
                    download={previewDoc.fileName || 'document.jpg'}
                    className="btn btn-secondary btn-sm text-xs font-bold flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" /> डाउनलोड
                  </a>
                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 p-3 bg-slate-100 rounded-2xl my-3 flex items-center justify-center min-h-[300px]">
                {previewDoc.fileType?.includes('image') || (previewDoc.fileData && previewDoc.fileData.startsWith('data:image')) ? (
                  <img
                    src={previewDoc.fileData}
                    alt={previewDoc.title}
                    className="max-h-[65vh] w-auto object-contain rounded-xl shadow-md"
                  />
                ) : (
                  <iframe
                    src={previewDoc.fileData}
                    title={previewDoc.title}
                    className="w-full h-[65vh] rounded-xl border-0"
                  />
                )}
              </div>

              <div className="flex justify-end pt-1 shrink-0">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="btn btn-secondary text-xs font-bold"
                >
                  बंद करें (Close)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="border-t border-slate-100 pt-4 mt-2 shrink-0 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => { onOpenLetter(record, currentServiceKey); }}
            className="btn btn-secondary btn-sm font-bold text-xs flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5" /> पावती पत्र (Print Pawati)
          </button>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onOpenRemark(record, 'Under Review', currentServiceKey)}
              className="btn btn-secondary btn-sm bg-blue-50 border-blue-200 text-blue-700 font-bold text-xs"
            >
              👁️ समीक्षा में डालें
            </button>
            <button
              onClick={() => onOpenRemark(record, 'Approved', currentServiceKey)}
              className="btn btn-primary btn-sm bg-emerald-700 font-bold text-xs"
            >
              ✅ स्वीकृत करें
            </button>
            <button
              onClick={() => onOpenRemark(record, 'Correction Requested', currentServiceKey)}
              className="btn btn-secondary btn-sm bg-amber-50 border-amber-200 text-amber-700 font-bold text-xs"
            >
              ✏️ सुधार मांगे
            </button>
            <button
              onClick={() => onOpenRemark(record, 'Rejected', currentServiceKey)}
              className="btn btn-danger btn-sm font-bold text-xs"
            >
              ❌ निरस्त करें
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy, serverTimestamp, addDoc, limit } from 'firebase/firestore'
import toast from 'react-hot-toast'
import {
  getDeathCertificates,
  updateDeathCertificateStatus,
} from '@/services/deathCertificateService'
import DeathCertificateTemplate from '@/components/DeathCertificateTemplate'
import ApplicationTimeline from '@/components/ApplicationTimeline'
import {
  ShieldAlert, Search, Trash2, Download, Edit, Printer, Eye, Activity, FileText, CheckCircle2,
  AlertCircle, Calendar, UserCheck, History, Info, Lock, LogOut, RefreshCw, X, Settings2
} from 'lucide-react'

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'jhabua@2024'

function formatTimestamp(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('dc_admin_authenticated')
      if (stored === 'true') {
        setIsAdmin(true)
      }
    }
  }, [])

  // Death Certificate state
  const [deathRecords, setDeathRecords] = useState([])
  const [deathLoading, setDeathLoading] = useState(false)
  const [deathSearch, setDeathSearch] = useState('')
  const [selectedDeathDetail, setSelectedDeathDetail] = useState(null)
  const [deathCertPreview, setDeathCertPreview] = useState(null)

  // Tab navigation
  const [activeTab, setActiveTab] = useState('death-certificates')

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditSearch, setAuditSearch] = useState('')

  // Remark Modal State
  const [remarkModal, setRemarkModal] = useState({
    isOpen: false,
    record: null,
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

  async function logAudit(recordIds, entityType, action) {
    try {
      await addDoc(collection(db, 'auditLogs'), {
        adminName: username,
        recordIds,
        entityType,
        action,
        count: Array.isArray(recordIds) ? recordIds.length : 1,
        timestamp: serverTimestamp(),
      })
    } catch (e) { console.error('Audit log failed:', e) }
  }

  useEffect(() => {
    if (isAdmin) {
      loadDeathRecords()
      loadAuditLogs()
    }
  }, [isAdmin, loadDeathRecords, loadAuditLogs])

  function handleLogin(e) {
    e.preventDefault()
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdmin(true)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('dc_admin_authenticated', 'true')
      }
      setLoginError('')
    } else {
      setLoginError('गलत Username या Password')
    }
  }

  function handleLogout() {
    setIsAdmin(false)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('dc_admin_authenticated')
    }
  }

  async function handleConfirmStatusUpdate(e) {
    e.preventDefault()
    if (!remarkModal.remarkText || !remarkModal.remarkText.trim()) {
      toast.error('अधिकारी की टिप्पणी अनिवार्य है (Mandatory officer remark required)')
      return
    }

    const toastId = toast.loading(`Updating status to ${remarkModal.targetStatus}...`)
    const res = await updateDeathCertificateStatus({
      id: remarkModal.record.id,
      newStatus: remarkModal.targetStatus,
      remarks: remarkModal.remarkText,
      officerName: remarkModal.officerName
    })

    if (res.success) {
      toast.success(`Status updated to ${remarkModal.targetStatus}!`, { id: toastId })
      setRemarkModal({ isOpen: false, record: null, targetStatus: '', remarkText: '', officerName: 'Nagar Palika Officer' })
      loadDeathRecords()
    } else {
      toast.error(`Update failed: ${res.error}`, { id: toastId })
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

  const filteredRecords = deathRecords.filter(r => {
    if (!deathSearch) return true
    const search = deathSearch.toLowerCase()
    return (
      r.applicationNo?.toLowerCase().includes(search) ||
      r.deceasedDetails?.fullName?.toLowerCase().includes(search) ||
      r.applicantDetails?.fullName?.toLowerCase().includes(search) ||
      r.status?.toLowerCase().includes(search)
    )
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-800 flex items-center justify-center shadow-lg hover:opacity-90 transition" title="Home">
              <ShieldAlert className="w-5 h-5 text-white" />
            </a>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-900 text-sm tracking-tight">e-Nagar Officer Panel</h1>
                <span className="text-[10px] font-bold text-emerald-800 tracking-wider bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 uppercase">Console</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <a href="/" className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition flex items-center gap-1.5">
              <span>📜</span> मृतक प्रमाण पत्र (Death Cert)
            </a>
            <a href="/birth-certificate" className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition flex items-center gap-1.5 opacity-50 cursor-not-allowed">
              <span>👶</span> जन्म प्रमाण पत्र (Soon)
            </a>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                {username} (Administrator)
              </span>
              <button 
                onClick={handleLogout} 
                className="btn btn-secondary btn-sm flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Panel Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full flex flex-col space-y-6">

        {/* Login Portal Screen */}
        {!isAdmin && (
          <div className="max-w-md mx-auto my-16 w-full animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-800 flex items-center justify-center shadow-lg shadow-emerald-700/20 mx-auto text-white">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">Municipal Officer Login</h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">e-Nagar Palika Parishad Jhabua Officer Administration Portal</p>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center animate-shake mt-4">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 mt-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
                  <input
                    value={username} 
                    onChange={e => setUsername(e.target.value)}
                    className="input"
                    placeholder="admin"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                  <input
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    className="input"
                    placeholder="••••••••"
                  />
                </div>
                
                <button type="submit" className="w-full btn btn-primary py-3 text-xs uppercase tracking-wider font-bold mt-2">
                  Verify Credentials
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Admin Dashboard */}
        {isAdmin && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Tab Navigation Menu */}
            <div className="flex gap-1.5 bg-white border border-slate-200 rounded-2xl p-1.5 w-fit shadow-sm">
              {[
                { key: 'death-certificates', label: 'Death Certificates', icon: FileText },
                { key: 'audit', label: 'Audit Logs', icon: History },
              ].map(tab => {
                const Icon = tab.icon
                return (
                  <button 
                    key={tab.key} 
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === tab.key 
                        ? 'bg-emerald-700 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* ── DEATH CERTIFICATES TAB ──────────────────────────────────── */}
            {activeTab === 'death-certificates' && (
              <div className="space-y-6">
                {/* Search & Stats */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Death Certificate Applications</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Manage and review all death certificate applications</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by name, app no..."
                        value={deathSearch}
                        onChange={(e) => setDeathSearch(e.target.value)}
                        className="input pl-9 w-64"
                      />
                    </div>
                    <button onClick={loadDeathRecords} className="btn btn-secondary btn-sm">
                      <RefreshCw className={`w-3.5 h-3.5 ${deathLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: 'Total', count: deathRecords.length, color: 'slate' },
                    { label: 'Submitted', count: deathRecords.filter(r => r.status === 'Submitted').length, color: 'blue' },
                    { label: 'Under Review', count: deathRecords.filter(r => r.status === 'Under Review').length, color: 'amber' },
                    { label: 'Approved', count: deathRecords.filter(r => r.status === 'Approved' || r.status === 'Certificate Generated').length, color: 'emerald' },
                    { label: 'Rejected', count: deathRecords.filter(r => r.status === 'Rejected').length, color: 'red' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
                      <div className={`text-2xl font-extrabold text-${stat.color}-700`}>{stat.count}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Records List */}
                {deathLoading ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <RefreshCw className="animate-spin w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-xs">Loading applications...</p>
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
                    <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm font-semibold">No applications found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredRecords.map((record) => (
                      <div key={record.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all shadow-sm">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                                {record.applicationNo || 'DRAFT'}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusChip(record.status)}`}>
                                {record.status}
                              </span>
                            </div>
                            <h3 className="text-slate-900 font-extrabold text-base">
                              स्व. {record.deceasedDetails?.fullName || 'N/A'}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5 font-medium">
                              आवेदक: {record.applicantDetails?.fullName} ({record.applicantDetails?.relationWithDeceased}) | मृत्यु तिथि: {record.deceasedDetails?.dateOfDeath}
                            </p>
                            {record.lastOfficerRemark && (
                              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 mt-2 font-medium">
                                💬 Last Remark: {record.lastOfficerRemark}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {record.status === 'Submitted' && (
                              <>
                                <button
                                  onClick={() => setRemarkModal({ isOpen: true, record, targetStatus: 'Under Review', remarkText: '', officerName: 'Nagar Palika Officer' })}
                                  className="btn btn-secondary btn-sm bg-blue-50 border-blue-200 text-blue-700 font-bold"
                                >
                                  👁️ Start Review
                                </button>
                              </>
                            )}

                            {record.status === 'Under Review' && (
                              <>
                                <button
                                  onClick={() => setRemarkModal({ isOpen: true, record, targetStatus: 'Approved', remarkText: '', officerName: 'Nagar Palika Officer' })}
                                  className="btn btn-primary btn-sm bg-gradient-to-r from-emerald-600 to-emerald-700 font-bold"
                                >
                                  ✅ Approve
                                </button>
                                <button
                                  onClick={() => setRemarkModal({ isOpen: true, record, targetStatus: 'Correction Requested', remarkText: '', officerName: 'Nagar Palika Officer' })}
                                  className="btn btn-secondary btn-sm bg-amber-50 border-amber-200 text-amber-700 font-bold"
                                >
                                  ✏️ Correction
                                </button>
                                <button
                                  onClick={() => setRemarkModal({ isOpen: true, record, targetStatus: 'Rejected', remarkText: '', officerName: 'Nagar Palika Officer' })}
                                  className="btn btn-danger btn-sm font-bold"
                                >
                                  ❌ Reject
                                </button>
                              </>
                            )}

                            {record.status === 'Correction Requested' && (
                              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                                Waiting for citizen resubmission
                              </span>
                            )}

                            {(record.status === 'Approved' || record.status === 'Certificate Generated' || record.status === 'Completed') && (
                              <button
                                onClick={() => setDeathCertPreview(record)}
                                className="btn btn-primary btn-sm bg-gradient-to-r from-emerald-600 to-emerald-700 font-bold"
                              >
                                📜 View Certificate
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedDeathDetail(record)}
                              className="btn btn-secondary btn-sm flex items-center gap-1 font-bold text-slate-700"
                            >
                              <History className="w-3.5 h-3.5 text-slate-500" /> Details
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
                <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
                  <div className="flex gap-2 flex-1 max-w-md relative">
                    <input 
                      value={auditSearch} 
                      onChange={e => setAuditSearch(e.target.value)}
                      placeholder="Search audit logs..."
                      className="flex-1 pl-10 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <button onClick={loadAuditLogs} className="btn btn-secondary btn-sm flex items-center gap-1">
                    <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin' : ''}`} /> Refresh
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  {auditLoading ? (
                    <div className="p-12 text-center text-slate-500">
                      <RefreshCw className="animate-spin w-6 h-6 text-emerald-600 mx-auto mb-2" />
                      Loading audit logs...
                    </div>
                  ) : auditLogs.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs">
                      No audit logs found
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                            <th className="p-4">Timestamp</th>
                            <th className="p-4">Officer</th>
                            <th className="p-4">Action</th>
                            <th className="p-4">Entity Type</th>
                            <th className="p-4">Record IDs</th>
                            <th className="p-4">Count</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {auditLogs
                            .filter(log => !auditSearch || 
                              log.adminName?.toLowerCase().includes(auditSearch.toLowerCase()) ||
                              log.action?.toLowerCase().includes(auditSearch.toLowerCase()) ||
                              log.entityType?.toLowerCase().includes(auditSearch.toLowerCase())
                            )
                            .map((log) => (
                              <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-4 font-mono text-slate-600">{formatTimestamp(log.timestamp)}</td>
                                <td className="p-4 font-bold text-slate-900">{log.adminName || 'N/A'}</td>
                                <td className="p-4">
                                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                    log.action?.includes('APPROVED') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    log.action?.includes('REJECTED') ? 'bg-red-50 text-red-700 border-red-200' :
                                    log.action?.includes('DELETE') ? 'bg-red-50 text-red-700 border-red-200' :
                                    log.action?.includes('CORRECTION') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-blue-50 text-blue-700 border-blue-200'
                                  }`}>
                                    {log.action || 'N/A'}
                                  </span>
                                </td>
                                <td className="p-4 text-slate-600">{log.entityType || 'N/A'}</td>
                                <td className="p-4 font-mono text-slate-500 max-w-[200px] truncate">
                                  {Array.isArray(log.recordIds) ? log.recordIds.join(', ') : log.applicationNo || log.recordIds || '—'}
                                </td>
                                <td className="p-4 text-center font-bold text-slate-700">{log.count || 1}</td>
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
                  Update Status to: <span className="text-emerald-700">{remarkModal.targetStatus}</span>
                </h3>
                <button onClick={() => setRemarkModal({ isOpen: false, record: null, targetStatus: '', remarkText: '', officerName: 'Nagar Palika Officer' })} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
                <span className="font-bold block mb-1">⚠️ Application: {remarkModal.record?.applicationNo}</span>
                <p>Deceased: {remarkModal.record?.deceasedDetails?.fullName}</p>
              </div>

              <form onSubmit={handleConfirmStatusUpdate} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Officer Remark (अधिकारी टिप्पणी) *
                  </label>
                  <textarea
                    value={remarkModal.remarkText}
                    onChange={(e) => setRemarkModal(prev => ({ ...prev, remarkText: e.target.value }))}
                    className="input min-h-[80px]"
                    placeholder="Enter your remark here..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setRemarkModal({ isOpen: false, record: null, targetStatus: '', remarkText: '', officerName: 'Nagar Palika Officer' })} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Confirm & Update Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Timeline Detail Modal */}
        {selectedDeathDetail && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">{selectedDeathDetail.applicationNo}</span>
                  <h3 className="text-slate-900 font-extrabold text-lg mt-1">मृतक: स्व. {selectedDeathDetail.deceasedDetails?.fullName}</h3>
                </div>
                <button onClick={() => setSelectedDeathDetail(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedDeathDetail.lastOfficerRemark && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
                  <span className="font-bold block text-amber-800">💬 अधिकारी टिप्पणी (Officer Remark):</span>
                  <p className="font-semibold">{selectedDeathDetail.lastOfficerRemark}</p>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
                <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1.5 uppercase tracking-wider text-[11px]">Application Details</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div><span className="text-slate-500 block">Gender / Age:</span><span className="font-bold">{selectedDeathDetail.deceasedDetails?.gender} / {selectedDeathDetail.deceasedDetails?.age || 'N/A'} yrs</span></div>
                  <div><span className="text-slate-500 block">Date of Death:</span><span className="font-bold">{selectedDeathDetail.deceasedDetails?.dateOfDeath}</span></div>
                  <div><span className="text-slate-500 block">Place of Death:</span><span className="font-bold">{selectedDeathDetail.deceasedDetails?.placeType} ({selectedDeathDetail.deceasedDetails?.placeOfDeath || 'N/A'})</span></div>
                  <div><span className="text-slate-500 block">Address:</span><span className="font-bold">{selectedDeathDetail.deceasedDetails?.presentAddress?.villageCity || 'N/A'}, {selectedDeathDetail.deceasedDetails?.presentAddress?.district || 'N/A'}</span></div>
                  <div><span className="text-slate-500 block">Religion / Occupation:</span><span className="font-bold">{selectedDeathDetail.statisticalDetails?.religion || 'N/A'} / {selectedDeathDetail.statisticalDetails?.occupation || 'N/A'}</span></div>
                  <div><span className="text-slate-500 block">Medical Cert:</span><span className="font-bold">{selectedDeathDetail.statisticalDetails?.isMedicallyCertified || 'N/A'}</span></div>
                </div>
              </div>

              <h4 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">Activity Timeline</h4>
              <ApplicationTimeline timeline={selectedDeathDetail.timeline || []} />
            </div>
          </div>
        )}

        {/* Certificate Preview Modal */}
        {deathCertPreview && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 my-8 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-slate-900 font-extrabold text-base flex items-center gap-2">
                  📜 Official Death Certificate Preview
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="btn btn-primary btn-sm flex items-center gap-1 font-bold"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print / Download PDF
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

      </div>
    </div>
  )
}

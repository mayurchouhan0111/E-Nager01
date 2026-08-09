'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getNotifications, markNotificationAsRead } from '../services/notificationService';
import { getBirthCertificates } from '../services/birthCertificateService';
import { getDeathCertificates } from '../services/deathCertificateService';
import { getWaterConnections } from '../services/waterConnectionService';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import ApplicationLetterTemplate from './ApplicationLetterTemplate';
import BirthCertificateTemplate from './BirthCertificateTemplate';
import DeathCertificateTemplate from './DeathCertificateTemplate';
import WaterConnectionTemplate from './WaterConnectionTemplate';
import { Layers, ShieldAlert, Bell, X, Search, Printer, FileText, Baby, Droplets, ShieldCheck, Building2, Sparkles, CheckCircle2, Presentation } from 'lucide-react';
import { subscribeToMaintenance } from '../services/maintenanceService';

export default function ServiceHeader() {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [maintStatus, setMaintStatus] = useState({ isMaintenanceMode: false });
  const [listRef] = useAutoAnimate({ duration: 250, easing: 'ease-out' });

  // Public Track Search Modal State
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    const unsub = subscribeToMaintenance((status) => {
      setMaintStatus(status);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    loadNotifications();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const appNoParam = params.get('appNo') || params.get('applicationNo') || params.get('id');
      if (appNoParam && appNoParam.trim()) {
        const queryVal = appNoParam.trim();
        setShowTrackModal(true);
        setSearchQuery(queryVal);
        performQuerySearch(queryVal);
      }
    }
  }, []);

  const loadNotifications = async () => {
    const data = await getNotifications(null, null, 20);
    setNotifications(data);
    setUnreadCount(data.filter(n => !n.isRead).length);
  };

  const handleMarkAsRead = async (id) => {
    await markNotificationAsRead(id);
    loadNotifications();
  };

  const performQuerySearch = async (queryText) => {
    setSearching(true);
    setHasSearched(true);
    setSearchResults([]);

    const cleanQuery = queryText.trim().toLowerCase();

    try {
      const [births, deaths, waters] = await Promise.all([
        getBirthCertificates(),
        getDeathCertificates(),
        getWaterConnections()
      ]);

      const matches = [];

      const isMatch = (app) => {
        const appNo = (app.applicationNo || '').toLowerCase();
        const appId = (app.id || '').toLowerCase();
        const certNo = (app.certificateNo || app.permitNo || '').toLowerCase();
        const mobile = (app.applicantDetails?.mobile || '').replace(/[\s-]/g, '');
        const q = cleanQuery.replace(/[\s-]/g, '');

        return appNo.includes(cleanQuery) || appId.includes(cleanQuery) || certNo.includes(cleanQuery) || (mobile && mobile.includes(q));
      };

      births.filter(isMatch).forEach(b => matches.push({ ...b, serviceType: 'birth', serviceName: 'जन्म प्रमाण पत्र' }));
      deaths.filter(isMatch).forEach(d => matches.push({ ...d, serviceType: 'death', serviceName: 'मृत्यु प्रमाण पत्र' }));
      waters.filter(isMatch).forEach(w => matches.push({ ...w, serviceType: 'water_connection', serviceName: 'जल कनेक्शन' }));

      setSearchResults(matches);
    } catch (err) {
      console.error('Search error:', err);
    }
    setSearching(false);
  };

  const handlePublicSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery || !searchQuery.trim()) return;
    performQuerySearch(searchQuery.trim());
  };

  const isCurrentTab = (path) => {
    if (path === '/' && pathname === '/') return true;
    if (path === '/death-certificate' && pathname?.startsWith('/death-certificate')) return true;
    if (path === '/birth-certificate' && pathname?.startsWith('/birth-certificate')) return true;
    if (path === '/water-connection' && pathname?.startsWith('/water-connection')) return true;
    if (path === '/admin' && pathname?.startsWith('/admin')) return true;
    return false;
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Approved':
      case 'Sanctioned':
      case 'Certificate Generated':
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Correction Requested':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Under Review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <>
      {/* Real-time System Maintenance Banner */}
      {maintStatus.isMaintenanceMode && (
        <div className="bg-rose-600 text-white px-4 py-2.5 text-xs font-bold shadow-md flex items-center justify-between gap-3 animate-pulse no-print border-b border-rose-700 z-[60] relative">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center w-full">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>🛠️ शासकीय सूचना: {maintStatus.message || 'सुरक्षा एवं तकनीकी रखरखाव हेतु पोर्टल पर रूटीन अद्यतन जारी है। सेवाएं शीघ्र बहाल होंगी।'}</span>
          </div>
        </div>
      )}

      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 font-sans shadow-sm no-print print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <Link href="/" className="flex items-center gap-3 group">
              <img 
                src="/mp-logo.png" 
                alt="मध्य प्रदेश शासन" 
                className="w-11 h-11 object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300" 
              />
              <div className="hidden sm:block">
                <div className="text-slate-900 font-extrabold text-sm leading-tight flex items-center gap-2">
                  नगर पालिका ई-सेवा पोर्टल
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">MP e-Nagar</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">झाबुआ — मध्य प्रदेश शासन</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-sm">
              <Link href="/death-certificate" className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap icon-hover-bounce ${isCurrentTab('/death-certificate') ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'}`}>
                <FileText className={`w-3.5 h-3.5 shrink-0 ${isCurrentTab('/death-certificate') ? 'text-emerald-300' : 'text-emerald-600'}`} />
                <span>मृतक</span>
              </Link>
              <Link href="/birth-certificate" className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap icon-hover-bounce ${isCurrentTab('/birth-certificate') ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'}`}>
                <Baby className={`w-3.5 h-3.5 shrink-0 ${isCurrentTab('/birth-certificate') ? 'text-blue-300' : 'text-blue-600'}`} />
                <span>जन्म</span>
              </Link>
              <Link href="/water-connection" className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap icon-hover-bounce ${isCurrentTab('/water-connection') ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'}`}>
                <Droplets className={`w-3.5 h-3.5 shrink-0 ${isCurrentTab('/water-connection') ? 'text-cyan-300' : 'text-cyan-600'}`} />
                <span>जल कनेक्शन</span>
              </Link>
              <Link href="/privacy-policy" className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap icon-hover-bounce ${isCurrentTab('/privacy-policy') ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'}`}>
                <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${isCurrentTab('/privacy-policy') ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>DPDP प्राइवेसी</span>
              </Link>
              <Link href="/presentation" className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap icon-hover-bounce ${isCurrentTab('/presentation') ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'}`}>
                <Presentation className={`w-3.5 h-3.5 shrink-0 ${isCurrentTab('/presentation') ? 'text-purple-300' : 'text-purple-600'}`} />
                <span>SOP प्रेजेंटेशन</span>
              </Link>
              <Link href="/grievance" className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap icon-hover-bounce ${isCurrentTab('/grievance') ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'}`}>
                <Building2 className={`w-3.5 h-3.5 shrink-0 ${isCurrentTab('/grievance') ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>शिकायत</span>
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <button onClick={() => { setShowTrackModal(true); setHasSearched(false); }} aria-label="आवेदन स्थिति खोजें" className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all icon-hover-bounce">
                <Search className="w-3.5 h-3.5 text-emerald-700" /> <span className="hidden sm:inline">स्थिति खोजें</span>
              </button>

              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} aria-label="सूचनाएँ (Notifications)" className="relative p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm transition-all duration-200 icon-hover-bounce">
                  <Bell className="w-4 h-4 text-emerald-700" />
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center animate-bounce">{unreadCount}</span>}
                </button>
                {showNotifications && (
                  <div className="fixed sm:absolute top-16 sm:top-auto left-4 right-4 sm:left-auto sm:right-0 mt-2 sm:w-80 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-scale-in">
                    <div className="px-4 py-3 border-b bg-slate-50/80 flex items-center justify-between">
                      <h3 className="text-xs font-extrabold uppercase text-slate-800 flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> सूचनाएँ (Notifications)
                      </h3>
                      <button onClick={() => setShowNotifications(false)} aria-label="सूचना पैनल बंद करें" className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"><X className="w-4 h-4" /></button>
                    </div>
                    <div ref={listRef} className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? <div className="p-8 text-center text-xs text-slate-500 font-medium">कोई नई सूचना नहीं है</div> : notifications.map((n) => (
                        <div key={n.id} onClick={() => handleMarkAsRead(n.id)} className={`px-4 py-3.5 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-emerald-50/60 font-semibold' : ''}`}>
                          <p className="text-xs text-slate-800 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block font-mono">{new Date(n.timestamp || Date.now()).toLocaleDateString('hi-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link href="/admin" aria-label="अधिकारी लॉगिन" className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 icon-hover-bounce ${isCurrentTab('/admin') ? 'bg-emerald-700 text-white border-emerald-700 shadow-md' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                <ShieldAlert className="w-3.5 h-3.5 animate-pulse text-amber-500" /> <span className="hidden sm:inline">अधिकारी लॉगिन</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* MODALS RENDERED OUTSIDE HEADER STACKING CONTEXT AT TOP VIEWPORT LEVEL */}
      {showTrackModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[9999] overflow-y-auto p-3 sm:p-6 flex items-start sm:items-center justify-center pt-14 sm:pt-6">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[80vh] sm:max-h-[85vh] my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" /> 
                आवेदन स्थिति खोजें (Track Application Status)
              </h3>
              <button 
                onClick={() => setShowTrackModal(false)}
                aria-label="खोज खिड़की बंद करें"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublicSearch} className="py-3 sm:py-4 flex gap-2 shrink-0">
              <input 
                type="text" 
                required 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="आवेदन क्र. या मोबाइल नंबर दर्ज करें..." 
                className="input flex-1 text-xs sm:text-sm" 
              />
              <button 
                type="submit" 
                className="btn btn-primary text-xs font-bold px-4 sm:px-5"
              >
                {searching ? 'खोज रहे...' : 'खोजें'}
              </button>
            </form>

            <div className="overflow-y-auto flex-1 pr-1">
              {hasSearched && (
                <div className="space-y-3 pt-1">
                  {searchResults.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      कोई आवेदन नहीं मिला। कृपया सही आवेदन क्रमांक या मोबाइल नंबर दर्ज करें।
                    </div>
                  ) : (
                    searchResults.map((rec) => (
                      <div key={rec.id} className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 space-y-2.5 shadow-sm">
                        <div className="flex items-center justify-between gap-2 text-xs font-bold flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-200">{rec.applicationNo}</span>
                            <span className="text-slate-500 font-medium text-[11px]">({rec.serviceName})</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${getStatusChip(rec.status)}`}>{rec.status}</span>
                        </div>

                        <div className="text-xs text-slate-800 font-medium">
                          <p><span className="text-slate-500">नाम:</span> {rec.deceasedDetails?.fullName ? `स्व. ${rec.deceasedDetails.fullName}` : rec.childDetails?.fullName || rec.applicantDetails?.fullName || 'N/A'}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">आवेदन तिथि: {new Date(rec.appliedAt || rec.createdAt || Date.now()).toLocaleDateString('hi-IN')}</p>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 flex-wrap">
                          <button 
                            onClick={() => { setSelectedRecord(rec); setModalType('letter'); }} 
                            className="btn btn-secondary btn-sm text-[11px] font-bold text-slate-800 flex items-center gap-1 bg-white"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" /> पावती पत्र देखें
                          </button>

                          {(rec.status === 'Approved' || rec.status === 'Sanctioned' || rec.status === 'Certificate Generated' || rec.status === 'Completed') && (
                            <button 
                              onClick={() => { setSelectedRecord(rec); setModalType('certificate'); }} 
                              className="btn btn-primary btn-sm text-[11px] font-bold flex items-center gap-1"
                            >
                              📜 प्रमाण पत्र डाउनलोड
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedRecord && modalType === 'letter' && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[9999] overflow-y-auto p-3 sm:p-6 flex items-start sm:items-center justify-center pt-14 sm:pt-6">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[80vh] sm:max-h-[85vh] my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0 mb-2">
              <span className="font-extrabold text-slate-900 text-sm">📄 पावती पत्र (Submission Letter)</span>
              <button onClick={() => { setSelectedRecord(null); setModalType(null); }} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto flex-1 pr-1">
              <ApplicationLetterTemplate record={selectedRecord} serviceType={selectedRecord.serviceType} />
            </div>
          </div>
        </div>
      )}

      {selectedRecord && modalType === 'certificate' && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[9999] overflow-y-auto p-3 sm:p-6 flex items-start sm:items-center justify-center pt-14 sm:pt-6">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[80vh] sm:max-h-[85vh] my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0 mb-2">
              <span className="font-extrabold text-slate-900 text-sm">📜 प्रमाण पत्र (Certificate Preview)</span>
              <button onClick={() => { setSelectedRecord(null); setModalType(null); }} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto flex-1 pr-1">
              {selectedRecord.serviceType === 'birth' && <BirthCertificateTemplate record={selectedRecord} />}
              {selectedRecord.serviceType === 'death' && <DeathCertificateTemplate record={selectedRecord} />}
              {selectedRecord.serviceType === 'water_connection' && <WaterConnectionTemplate record={selectedRecord} />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

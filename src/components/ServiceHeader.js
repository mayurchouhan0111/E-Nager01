'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getNotifications, markNotificationAsRead } from '../services/notificationService';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Layers, ShieldAlert, Bell, X, Check } from 'lucide-react';

export default function ServiceHeader() {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [listRef] = useAutoAnimate({ duration: 250, easing: 'ease-out' });

  useEffect(() => {
    loadNotifications();
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

  const isCurrentTab = (path) => {
    if (path === '/' && pathname === '/') return true;
    if (path === '/death-certificate' && pathname?.startsWith('/death-certificate')) return true;
    if (path === '/birth-certificate' && pathname?.startsWith('/birth-certificate')) return true;
    if (path === '/water-connection' && pathname?.startsWith('/water-connection')) return true;
    if (path === '/admin' && pathname?.startsWith('/admin')) return true;
    return false;
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-md shadow-emerald-100 text-white group-hover:shadow-lg group-hover:shadow-emerald-200 transition-all duration-300">
              <Layers className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="text-slate-900 font-extrabold text-sm leading-tight flex items-center gap-2">
                नगर पालिका ई-सेवा पोर्टल
                <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  MP e-Nagar
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">झाबुआ — नागरिक सेवा पोर्टल</p>
            </div>
          </Link>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
            <Link
              href="/death-certificate"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                isCurrentTab('/death-certificate')
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <span className="text-sm">📜</span>
              <span>मृतक प्रमाण पत्र</span>
            </Link>

            <Link
              href="/birth-certificate"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                isCurrentTab('/birth-certificate')
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <span className="text-sm">👶</span>
              <span>जन्म प्रमाण पत्र</span>
            </Link>

            <Link
              href="/water-connection"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                isCurrentTab('/water-connection')
                  ? 'bg-teal-700 text-white shadow-md shadow-teal-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <span className="text-sm">💧</span>
              <span>जल कनेक्शन सेवा</span>
            </Link>
          </nav>

          {/* Right Action Icons & Admin Switch */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all duration-200"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                    <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                      सूचनाएँ
                    </h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {unreadCount} नई
                        </span>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-slate-400 hover:text-slate-700 p-0.5 rounded-lg hover:bg-slate-200/60 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div ref={listRef} className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 font-medium">
                        कोई नई सूचना नहीं है
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkAsRead(n.id)}
                          className={`px-4 py-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer border-b border-slate-100 last:border-0 ${
                            !n.isRead ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {!n.isRead && (
                              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                                  {n.serviceType || 'SYSTEM'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                  {n.timestamp ? new Date(n.timestamp).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-slate-800 leading-relaxed">{n.message}</p>
                              {n.officerRemark && (
                                <p className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100 mt-2 font-medium leading-relaxed">
                                  💬 {n.officerRemark}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Officer Admin Portal Switch */}
            <Link
              href="/admin"
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-200 flex items-center gap-1.5 ${
                isCurrentTab('/admin')
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">अधिकारी लॉगिन</span>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}

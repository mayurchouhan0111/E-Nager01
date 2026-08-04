'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getNotifications, markNotificationAsRead } from '../services/notificationService';
import { Layers, ShieldAlert, Bell, X } from 'lucide-react';

export default function ServiceHeader() {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
    if (path === '/admin' && pathname?.startsWith('/admin')) return true;
    return false;
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-800 flex items-center justify-center shadow-md shadow-emerald-100 text-white font-bold text-lg hover:opacity-90 transition">
              <Layers className="w-5 h-5 text-white" />
            </Link>
            <div>
              <div className="text-slate-900 font-extrabold text-sm sm:text-base leading-tight flex items-center gap-2">
                नगर पालिका ई-सेवा पोर्टल (Nagar Palika e-Service Portal)
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md uppercase tracking-wider font-bold">
                  MP e-Nagar
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">झाबुआ नगर पालिका प्रमाण पत्र सेवा पोर्टल (Jhabua Nagar Palika Certificate Service Portal)</p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            <Link
              href="/death-certificate"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isCurrentTab('/death-certificate')
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <span>📜</span>
              <span>मृतक प्रमाण पत्र (Death Cert)</span>
            </Link>

            <Link
              href="/birth-certificate"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isCurrentTab('/birth-certificate')
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <span>👶</span>
              <span>जन्म प्रमाण पत्र (Birth Cert)</span>
            </Link>
          </nav>

          {/* Right Action Icons & Admin Switch */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm transition-all"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-up">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      📢 सूचनाएँ (Notifications)
                    </h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-700 text-xs p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 font-medium">
                        कोई नई सूचना नहीं है (No notifications)
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkAsRead(n.id)}
                          className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                            !n.isRead ? 'bg-emerald-50/60 border-l-3 border-emerald-700' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                            <span className="font-bold text-emerald-700 uppercase">{n.serviceType || 'SYSTEM'}</span>
                            <span className="font-mono text-[10px]">{n.timestamp ? new Date(n.timestamp).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 mb-1">{n.message}</p>
                          {n.officerRemark && (
                            <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1 font-medium">
                              💬 अधिकारी टिप्पणी: (Officer Remark:) {n.officerRemark}
                            </p>
                          )}
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
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 ${
                isCurrentTab('/admin')
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>अधिकारी लॉगिन (Admin)</span>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}

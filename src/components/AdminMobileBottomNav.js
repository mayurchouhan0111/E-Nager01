'use client';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { FileText, Baby, Droplets, Building2, History, MessageSquareWarning } from 'lucide-react';
import { subscribeToAdminAuthState } from '@/services/adminAuthService';

export default function AdminMobileBottomNav() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('death-certificates');
  const [officerSession, setOfficerSession] = useState(null);

  useEffect(() => {
    const unsub = subscribeToAdminAuthState((session) => {
      setOfficerSession(session);
    });

    const handleTabChange = (e) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
      } else if (typeof e.detail === 'string') {
        setActiveTab(e.detail);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('admin-tab-changed', handleTabChange);
    }

    return () => {
      unsub();
      if (typeof window !== 'undefined') {
        window.removeEventListener('admin-tab-changed', handleTabChange);
      }
    };
  }, [pathname]);

  if (!pathname?.startsWith('/admin') || !officerSession) {
    return null;
  }

  const handleSwitchTab = (tabKey) => {
    setActiveTab(tabKey);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('change-admin-tab', { detail: tabKey }));
    }
  };

  const allNavItems = [
    {
      key: 'death-certificates',
      label: 'मृत्यु',
      icon: FileText,
    },
    {
      key: 'birth-certificates',
      label: 'जन्म',
      icon: Baby,
    },
    {
      key: 'water-connections',
      label: 'जल',
      icon: Droplets,
    },
    {
      key: 'no-dues-certificates',
      label: 'नो ड्यूज',
      icon: Building2,
    },
    {
      key: 'grievances',
      label: 'शिकायत',
      icon: MessageSquareWarning,
    },
    {
      key: 'audit',
      label: 'ऑडिट',
      icon: History,
    },
  ];

  const allowedTabs = officerSession.allowedTabs || [];
  const navItems = allNavItems.filter((item) => allowedTabs.includes(item.key));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 text-slate-900 shadow-[0_-4px_24px_rgba(0,0,0,0.07)] no-print pb-safe">
      <div className="flex items-center justify-around h-15 max-w-md mx-auto relative px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleSwitchTab(item.key)}
              className="flex-1 flex items-center justify-center h-full active:scale-95 transition-transform"
              aria-label={item.label}
            >
              <div className="relative flex flex-col items-center justify-center w-full h-full py-1">
                {active && (
                  <div className="absolute top-0 w-8 h-1 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-b-full shadow-xs animate-scale-in" />
                )}

                <div
                  className={`px-3 py-1 rounded-full transition-all duration-300 flex items-center justify-center ${
                    active
                      ? 'bg-emerald-100/90 text-emerald-800 scale-105 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 bg-transparent'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform duration-300 ${
                      active ? 'stroke-[2.4] text-emerald-800' : 'stroke-[1.8]'
                    }`}
                  />
                </div>

                <span
                  className={`text-[10px] leading-tight mt-0.5 tracking-tight transition-colors ${
                    active ? 'font-extrabold text-emerald-900' : 'font-semibold text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

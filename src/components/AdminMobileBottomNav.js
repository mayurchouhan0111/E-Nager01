'use client';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { DocumentTextIcon, BabyIcon, Droplets, BuildingOffice2Icon, ClockIcon } from '@heroicons/react/24/outline';

export default function AdminMobileBottomNav() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('death-certificates');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminRole, setAdminRole] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkAuth = () => {
        const stored = sessionStorage.getItem('dc_admin_authenticated');
        const role = sessionStorage.getItem('dc_admin_role') || '';
        setIsAdminAuthenticated(stored === 'true');
        setAdminRole(role);
      };
      
      checkAuth();

      const handleTabChange = (e) => {
        if (e.detail?.tab) {
          setActiveTab(e.detail.tab);
        } else if (typeof e.detail === 'string') {
          setActiveTab(e.detail);
        }
      };

      const handleAuthChange = (e) => {
        setIsAdminAuthenticated(!!e.detail);
        setAdminRole(sessionStorage.getItem('dc_admin_role') || '');
      };

      window.addEventListener('admin-tab-changed', handleTabChange);
      window.addEventListener('admin-auth-changed', handleAuthChange);
      
      return () => {
        window.removeEventListener('admin-tab-changed', handleTabChange);
        window.removeEventListener('admin-auth-changed', handleAuthChange);
      };
    }
  }, [pathname]);

  if (!pathname?.startsWith('/admin') || !isAdminAuthenticated) {
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
      roles: ['birth_death_admin', 'super_admin']
    },
    {
      key: 'birth-certificates',
      label: 'जन्म',
      icon: Baby,
      roles: ['birth_death_admin', 'super_admin']
    },
    {
      key: 'water-connections',
      label: 'जल',
      icon: Droplets,
      roles: ['water_admin', 'super_admin']
    },
    {
      key: 'no-dues-certificates',
      label: 'नो ड्यूज',
      icon: Building2,
      roles: ['nodues_admin', 'super_admin']
    },
    {
      key: 'audit',
      label: 'ऑडिट',
      icon: History,
      roles: ['super_admin']
    },
  ];

  const navItems = adminRole
    ? allNavItems.filter(item => !item.roles || item.roles.includes(adminRole))
    : allNavItems;

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
                {/* Sleek Top Active Accent Line */}
                {active && (
                  <div className="absolute top-0 w-8 h-1 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-b-full shadow-xs animate-scale-in" />
                )}

                {/* Icon Container with Pill Highlight */}
                <div className={`px-3 py-1 rounded-full transition-all duration-300 flex items-center justify-center ${
                  active
                    ? 'bg-emerald-100/90 text-emerald-800 scale-105 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 bg-transparent'
                }`}>
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'stroke-[2.4] text-emerald-800' : 'stroke-[1.8]'}`} />
                </div>

                {/* Text Label */}
                <span className={`text-[10px] leading-tight mt-0.5 tracking-tight transition-colors ${
                  active ? 'font-extrabold text-emerald-900' : 'font-semibold text-slate-500'
                }`}>
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

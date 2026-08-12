'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Baby, Droplets, Search } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const isCurrentTab = (path) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  const handleOpenTrackModal = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-track-modal'));
    }
  };

  const navItems = [
    {
      label: 'गृह',
      href: '/',
      icon: Home,
    },
    {
      label: 'मृत्यु',
      href: '/death-certificate',
      icon: FileText,
    },
    {
      label: 'जन्म',
      href: '/birth-certificate',
      icon: Baby,
    },
    {
      label: 'जल',
      href: '/water-connection',
      icon: Droplets,
    },
    {
      label: 'स्थिति',
      action: handleOpenTrackModal,
      icon: Search,
      isAction: true,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.07)] no-print pb-safe">
      <div className="flex items-center justify-around h-15 max-w-md mx-auto relative px-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = !item.isAction && isCurrentTab(item.href);

          const content = (
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
              <span className={`text-[11px] leading-tight mt-0.5 tracking-tight transition-colors ${
                active ? 'font-extrabold text-emerald-900' : 'font-semibold text-slate-500'
              }`}>
                {item.label}
              </span>
            </div>
          );

          if (item.isAction) {
            return (
              <button
                key={index}
                type="button"
                onClick={item.action}
                className="flex-1 flex items-center justify-center h-full active:scale-95 transition-transform"
                aria-label={item.label}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={index}
              href={item.href}
              className="flex-1 flex items-center justify-center h-full active:scale-95 transition-transform"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

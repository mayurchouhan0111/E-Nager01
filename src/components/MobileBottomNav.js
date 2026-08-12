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
      sublabel: 'Home',
      href: '/',
      icon: Home,
    },
    {
      label: 'मृत्यु',
      sublabel: 'Death',
      href: '/death-certificate',
      icon: FileText,
    },
    {
      label: 'जन्म',
      sublabel: 'Birth',
      href: '/birth-certificate',
      icon: Baby,
    },
    {
      label: 'जल',
      sublabel: 'Water',
      href: '/water-connection',
      icon: Droplets,
    },
    {
      label: 'स्थिति',
      sublabel: 'Track',
      action: handleOpenTrackModal,
      icon: Search,
      isAction: true,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] no-print pb-safe">
      <div className="flex items-center justify-around h-15 px-1 max-w-md mx-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = !item.isAction && isCurrentTab(item.href);

          const content = (
            <div className={`flex flex-col items-center justify-center w-full h-full py-1 rounded-xl transition-all duration-200 ${
              active 
                ? 'text-emerald-700 font-extrabold scale-105' 
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}>
              <div className={`relative p-1 rounded-xl transition-colors ${
                active ? 'bg-emerald-100/90 text-emerald-800' : 'bg-transparent'
              }`}>
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {active && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] leading-none mt-1 tracking-tight">
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

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  FileSearch,
  Sparkles,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  userEmail?: string;
  onLogout: () => void;
  children: React.ReactNode;
}

export function AdminLayout({
  currentPath,
  onNavigate,
  userEmail,
  onLogout,
  children,
}: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
    },
    {
      label: 'Leads',
      path: '/admin/leads',
      icon: Users,
    },
    {
      label: 'AI Audits',
      path: '/admin/audits',
      icon: FileSearch,
    },
    {
      label: 'Opportunities',
      path: '/admin/opportunities',
      icon: Sparkles,
    },
    {
      label: 'Contact Requests',
      path: '/admin/contact-requests',
      icon: MessageSquare,
    },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
  };

  const getBreadcrumbTitle = () => {
    switch (currentPath) {
      case '/admin':
        return 'Dashboard Overview';
      case '/admin/leads':
        return 'Leads Management';
      case '/admin/audits':
        return 'AI Audits';
      case '/admin/opportunities':
        return 'Identified AI Opportunities';
      case '/admin/contact-requests':
        return 'Contact & Consultation Requests';
      default:
        return 'Admin Portal';
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F5] text-slate-900 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-[#0A292C] text-white px-4 py-3 flex items-center justify-between border-b border-teal-900/50 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <img
            src="/Kre8Link-06.svg"
            alt="Kre8Link Logo"
            className="h-7 sm:h-8 w-auto object-contain brightness-0 invert"
          />
          <span className="text-[10px] text-teal-300 font-mono tracking-wide uppercase font-semibold border-l border-teal-800/80 pl-2">
            Admin
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-teal-900/50 focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0A292C] text-slate-300 border-r border-teal-900/40 shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Brand Header */}
        <div className="p-6 border-b border-teal-900/50 flex flex-col items-start gap-2">
          <img
            src="/Kre8Link-06.svg"
            alt="Kre8Link Logo"
            className="h-8 sm:h-9 w-auto object-contain max-w-[180px] brightness-0 invert"
          />
          <span className="text-[10px] font-mono text-teal-400 font-medium tracking-wider uppercase">
            Admin Control Panel
          </span>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-6 space-y-1 flex-1">
          <div className="px-3 mb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400/80">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#F05323] text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-teal-900/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom User & System Controls */}
        <div className="p-4 border-t border-teal-900/50 bg-[#072023]">
          {/* Public Site Link */}
          <button
            onClick={() => onNavigate('/')}
            className="w-full mb-3 flex items-center justify-between px-3 py-2 rounded-md bg-teal-950/60 border border-teal-900/60 text-xs text-teal-300 hover:text-white hover:border-teal-700 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#F05323]" />
              <span>Public Website</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Admin User Badge */}
          <div className="px-3 py-2 bg-teal-900/30 rounded-lg border border-teal-800/30 mb-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="truncate">{userEmail || 'Administrator'}</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 border border-rose-900/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/70 backdrop-blur-sm flex flex-col">
          <div className="bg-[#0A292C] text-slate-200 w-full max-w-sm p-5 border-b border-teal-900/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-teal-900/50 pb-4">
              <div className="flex flex-col items-start gap-1">
                <img
                  src="/Kre8Link-06.svg"
                  alt="Kre8Link Logo"
                  className="h-8 sm:h-9 w-auto object-contain max-w-[180px] brightness-0 invert"
                />
                <span className="text-[10px] font-mono text-teal-300 uppercase tracking-wider font-semibold">
                  Admin Portal
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-1 py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#F05323] text-white font-semibold'
                        : 'text-slate-300 hover:bg-teal-900/40'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-teal-900/50 space-y-2">
              <button
                onClick={() => handleNavClick('/')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-teal-900/40 text-xs font-semibold text-teal-300 border border-teal-800/40"
              >
                <ExternalLink className="w-4 h-4 text-[#F05323]" />
                <span>View Public Website</span>
              </button>

              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-rose-950/40 text-xs font-semibold text-rose-300 border border-rose-900/40"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200/80 sticky top-0 z-20 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>Admin</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-[#0A292C] font-semibold">{getBreadcrumbTitle()}</span>
            </div>
            <h1 className="text-xl font-bold text-[#0A292C] tracking-tight mt-0.5">
              {getBreadcrumbTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#F05323]" />
              <span>Public Website</span>
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <div className="text-right">
              <span className="text-xs font-semibold text-[#0A292C] block">
                {userEmail || 'Admin User'}
              </span>
              <span className="text-[10px] text-teal-700 font-mono">Authenticated</span>
            </div>
          </div>
        </header>

        {/* Page Children Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Database, Copy, Check, Terminal, X, Mail, Instagram, Linkedin, ExternalLink, Headphones } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { KreLinkLogo } from './KreLinkLogo';

// Official X brand icon
const XIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={`fill-current ${className}`}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface FooterProps {
  onOpenContact: () => void;
  onOpenScanner: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContact, onOpenScanner }) => {
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const sqlSchema = `-- Kre8Link Supabase Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  industry TEXT,
  description TEXT NOT NULL,
  company_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  source TEXT DEFAULT 'AI Opportunity Scanner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  primary_goal TEXT,
  pain_points TEXT[],
  current_tools TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_response_id UUID REFERENCES audit_responses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact TEXT CHECK (impact IN ('HIGH', 'MEDIUM', 'CRITICAL')),
  priority INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/kre8link?igsh=MWdlb3owbXNhNG5kZg==',
      icon: Instagram,
      handle: '@kre8link',
    },
    {
      name: 'X',
      href: 'https://x.com/kre8link',
      icon: XIcon,
      handle: '@kre8link',
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/company/kre8link-technologies/',
      icon: Linkedin,
      handle: 'Kre8Link Technologies',
    },
  ];

  return (
    <footer className="bg-[#F8FAF9] border-t border-slate-200/80 text-slate-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info & Socials */}
          <div className="lg:col-span-2 space-y-5">
            <a href="#" className="flex items-center gap-2">
              <KreLinkLogo size="lg" variant="dark" />
            </a>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              AI transformation for ambitious businesses. We find the processes slowing your business down and turn them into intelligent systems that work for you.
            </p>

            {/* Social Media Links */}
            <div className="pt-2 space-y-3">
              <h5 className="text-[11px] font-mono uppercase tracking-wider text-[#0A292C] font-bold">
                Connect With Us
              </h5>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white border border-slate-200/80 hover:border-[#F05323]/50 hover:bg-orange-50/40 text-slate-600 hover:text-[#F05323] transition-all flex items-center justify-center shadow-xs group"
                      title={social.name}
                      aria-label={social.name}
                    >
                      <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#0A292C] font-bold">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => scrollToSection('solutions')} className="hover:text-[#F05323] transition-colors cursor-pointer">
                  Solutions
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('transformation')} className="hover:text-[#F05323] transition-colors cursor-pointer">
                  How We Work
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('cases')} className="hover:text-[#F05323] transition-colors cursor-pointer">
                  Case Studies
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('about')} className="hover:text-[#F05323] transition-colors cursor-pointer">
                  About
                </button>
              </li>
              <li>
                <button onClick={onOpenContact} className="hover:text-[#F05323] transition-colors cursor-pointer">
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Capabilities Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#0A292C] font-bold">Capabilities</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><button onClick={onOpenScanner} className="hover:text-[#F05323] cursor-pointer">AI Agents</button></li>
              <li><button onClick={onOpenScanner} className="hover:text-[#F05323] cursor-pointer">Business Automation</button></li>
              <li><button onClick={onOpenScanner} className="hover:text-[#F05323] cursor-pointer">AI Customer Experience</button></li>
              <li><button onClick={onOpenScanner} className="hover:text-[#F05323] cursor-pointer">Business Intelligence</button></li>
              <li><button onClick={onOpenScanner} className="hover:text-[#F05323] cursor-pointer">AI Opportunity Scanner</button></li>
            </ul>
          </div>

          {/* Contact & Support Channels */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#0A292C] font-bold">Contact &amp; Support</h4>
            <ul className="space-y-3 text-xs">
              <li>
                <div className="text-[11px] text-slate-400 font-mono uppercase">General Inquiries</div>
                <a
                  href="mailto:info@kre8link.com"
                  className="flex items-center gap-1.5 text-slate-700 hover:text-[#F05323] font-medium transition-colors mt-0.5 group"
                >
                  <Mail className="w-3.5 h-3.5 text-[#0d9488] group-hover:text-[#F05323]" />
                  <span>info@kre8link.com</span>
                </a>
              </li>
              <li>
                <div className="text-[11px] text-slate-400 font-mono uppercase">Support &amp; Assistance</div>
                <a
                  href="mailto:support@kre8link.com"
                  className="flex items-center gap-1.5 text-slate-700 hover:text-[#F05323] font-medium transition-colors mt-0.5 group"
                >
                  <Headphones className="w-3.5 h-3.5 text-[#0d9488] group-hover:text-[#F05323]" />
                  <span>support@kre8link.com</span>
                </a>
              </li>
              <li className="pt-1">
                <button
                  onClick={onOpenContact}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F05323] hover:text-[#D94418] transition-colors cursor-pointer"
                >
                  <span>Request a Consultation &rarr;</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div>
            &copy; 2026 Kre8Link. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a
              href="mailto:info@kre8link.com"
              className="hover:text-[#F05323] transition-colors"
            >
              info@kre8link.com
            </a>
            <span>&bull;</span>
            <a
              href="mailto:support@kre8link.com"
              className="hover:text-[#F05323] transition-colors"
            >
              support@kre8link.com
            </a>
          </div>
        </div>
      </div>

      {/* Supabase SQL Schema Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full relative shadow-2xl space-y-4">
            <button
              onClick={() => setShowSqlModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#F05323]" />
              <h3 className="text-base font-bold text-[#0A292C]">Supabase SQL Migration Schema</h3>
            </div>

            <p className="text-xs text-slate-500">
              Copy and paste this schema into your Supabase SQL Editor to create all required database tables.
            </p>

            <div className="relative bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 max-h-72 overflow-y-auto">
              <pre>{sqlSchema}</pre>
              <button
                onClick={copySql}
                className="absolute top-3 right-3 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white flex items-center gap-1.5 cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 rounded-xl bg-[#F05323] text-white text-xs font-semibold hover:bg-[#D94418] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { KreLinkLogo } from './KreLinkLogo';

interface NavbarProps {
  onOpenScanner: () => void;
  onOpenContact: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenScanner, onOpenContact }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    // Slight timeout ensures mobile menu closure doesn't interrupt scroll calculation
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#F8FAF9]/95 backdrop-blur-md border-b border-slate-200/80 py-3 shadow-sm'
          : 'bg-[#F8FAF9]/80 backdrop-blur-xs md:bg-transparent py-3 md:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#"
          className="flex items-center gap-2 group transition-opacity pl-1 sm:pl-2"
        >
          <KreLinkLogo size="lg" variant="dark" />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => scrollToSection('solutions')}
            className="hover:text-[#0A292C] transition-colors cursor-pointer"
          >
            Solutions
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('transformation')}
            className="hover:text-[#0A292C] transition-colors cursor-pointer"
          >
            How We Work
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('cases')}
            className="hover:text-[#0A292C] transition-colors cursor-pointer"
          >
            Case Studies
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('about')}
            className="hover:text-[#0A292C] transition-colors cursor-pointer"
          >
            About
          </button>
        </nav>

        {/* Right Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenContact}
            className="text-xs font-semibold text-slate-700 hover:text-[#0A292C] px-3.5 py-2 transition-colors cursor-pointer"
          >
            Contact
          </button>
          <button
            type="button"
            onClick={onOpenScanner}
            className="relative group inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white bg-[#F05323] hover:bg-[#D94418] transition-all duration-200 shadow-md shadow-[#F05323]/20 cursor-pointer overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              Find Your AI Opportunity
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        </div>

        {/* Mobile Header Buttons (Consistent Find Your AI Opportunity) */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={onOpenScanner}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white bg-[#F05323] hover:bg-[#D94418] transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Find Your AI Opportunity</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-[#0A292C] hover:bg-slate-100/80 rounded-lg focus:outline-none cursor-pointer transition-colors active:scale-95"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#F8FAF9] border-b border-slate-200/90 shadow-xl px-5 pt-3 pb-6 space-y-4 relative z-50"
          >
            <div className="flex flex-col space-y-1 text-base font-medium text-slate-700">
              <button
                type="button"
                onClick={() => scrollToSection('solutions')}
                className="w-full text-left py-3 px-2 rounded-lg hover:bg-slate-100 hover:text-[#0A292C] transition-colors cursor-pointer border-b border-slate-100 font-semibold"
              >
                Solutions
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('transformation')}
                className="w-full text-left py-3 px-2 rounded-lg hover:bg-slate-100 hover:text-[#0A292C] transition-colors cursor-pointer border-b border-slate-100 font-semibold"
              >
                How We Work
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('cases')}
                className="w-full text-left py-3 px-2 rounded-lg hover:bg-slate-100 hover:text-[#0A292C] transition-colors cursor-pointer border-b border-slate-100 font-semibold"
              >
                Case Studies
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('about')}
                className="w-full text-left py-3 px-2 rounded-lg hover:bg-slate-100 hover:text-[#0A292C] transition-colors cursor-pointer font-semibold"
              >
                About
              </button>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setTimeout(onOpenScanner, 50);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F05323] hover:bg-[#D94418] text-white text-sm font-semibold shadow-md shadow-[#F05323]/20 cursor-pointer active:scale-98 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Find Your AI Opportunity</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setTimeout(onOpenContact, 50);
                }}
                className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 hover:text-[#0A292C] transition-colors cursor-pointer active:scale-98"
              >
                Talk to Kre8Link
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

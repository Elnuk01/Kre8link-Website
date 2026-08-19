import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProblemSection } from './components/ProblemSection';
import { Transformation } from './components/Transformation';
import { Solutions } from './components/Solutions';
import { OpportunityScanner } from './components/OpportunityScanner';
import { CaseStudies } from './components/CaseStudies';
import { ProcessSection } from './components/ProcessSection';
import { TechnologySection } from './components/TechnologySection';
import { AboutSection } from './components/AboutSection';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { ContactModal } from './components/ContactModal';
import { ScrollToTopButton } from './components/ScrollToTopButton';

// Admin Portal Imports
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLeads } from './components/admin/AdminLeads';
import { AdminAudits } from './components/admin/AdminAudits';
import { AdminOpportunities } from './components/admin/AdminOpportunities';
import { AdminContactRequests } from './components/admin/AdminContactRequests';
import { supabase } from './lib/supabase';
import { isAllowedAdminEmail } from './lib/adminData';

export default function App() {
  // Navigation & Router state
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  // Admin Auth state
  const [authUser, setAuthUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Public site state
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactPrefillData, setContactPrefillData] = useState<any>(null);

  // Sync route changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Check Supabase Auth state for admin routes
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      if (!supabase) {
        setIsAuthChecking(false);
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setAuthUser(data.session?.user || null);
          setIsAuthChecking(false);
        }
      } catch (err) {
        console.error('[Auth Check Error]:', err);
        if (mounted) setIsAuthChecking(false);
      }
    }

    checkAuth();

    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) {
          setAuthUser(session?.user || null);
          setIsAuthChecking(false);
        }
      });

      return () => {
        mounted = false;
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setAuthUser(null);
    navigate('/admin/login');
  };

  const handleOpenScanner = () => {
    const el = document.getElementById('scanner');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenContact = () => {
    setContactPrefillData(null);
    setIsContactOpen(true);
  };

  const handleOpenContactWithData = (data: any) => {
    setContactPrefillData(data);
    setIsContactOpen(true);
  };

  // ===================================================
  // ADMIN ROUTING BRANCH
  // ===================================================
  const isAdminRoute = currentPath.startsWith('/admin');

  if (isAdminRoute) {
    if (isAuthChecking) {
      return (
        <div className="min-h-screen bg-[#0A292C] flex items-center justify-center p-4 text-white">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#F05323] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-teal-300 font-semibold uppercase tracking-wider">
              Verifying Kre8Link Admin Credentials...
            </p>
          </div>
        </div>
      );
    }

    // Is the authenticated user authorized?
    const isAuthenticatedAndAuthorized =
      authUser && isAllowedAdminEmail(authUser.email);

    // Route: /admin/login
    if (currentPath === '/admin/login') {
      if (isAuthenticatedAndAuthorized) {
        // Already logged in as admin -> redirect to /admin
        navigate('/admin');
        return null;
      }
      return (
        <AdminLogin
          onSuccess={() => navigate('/admin')}
          onNavigateHome={() => navigate('/')}
        />
      );
    }

    // If not authenticated or not authorized on any other /admin/* route
    if (!isAuthenticatedAndAuthorized) {
      return (
        <AdminLogin
          onSuccess={() => navigate('/admin')}
          onNavigateHome={() => navigate('/')}
        />
      );
    }

    // Authorized Admin Dashboard Area
    return (
      <AdminLayout
        currentPath={currentPath}
        onNavigate={navigate}
        userEmail={authUser?.email}
        onLogout={handleLogout}
      >
        {currentPath === '/admin' && <AdminDashboard onNavigate={navigate} />}
        {currentPath === '/admin/leads' && <AdminLeads onNavigate={navigate} />}
        {currentPath === '/admin/audits' && <AdminAudits />}
        {currentPath === '/admin/opportunities' && <AdminOpportunities />}
        {currentPath === '/admin/contact-requests' && <AdminContactRequests />}
        {/* Fallback for unrecognized /admin paths */}
        {!['/admin', '/admin/leads', '/admin/audits', '/admin/opportunities', '/admin/contact-requests'].includes(
          currentPath
        ) && <AdminDashboard onNavigate={navigate} />}
      </AdminLayout>
    );
  }

  // ===================================================
  // PUBLIC WEBSITE (UNTOUCHED)
  // ===================================================
  return (
    <div className="min-h-screen bg-[#F8FAF9] text-slate-900 selection:bg-[#F05323] selection:text-white font-sans antialiased">
      {/* Navigation */}
      <Navbar
        onOpenScanner={handleOpenScanner}
        onOpenContact={handleOpenContact}
      />

      {/* Main Page Sections */}
      <main>
        {/* Hero Section */}
        <Hero
          onOpenScanner={handleOpenScanner}
          onOpenContact={handleOpenContact}
        />

        {/* Bottleneck & Problem Cards (Emphasizing Identifying The Problem & Finding AI Opportunity) */}
        <ProblemSection onOpenScanner={handleOpenScanner} />

        {/* Kre8link Transformation Architecture */}
        <Transformation />

        {/* Solutions & Capabilities */}
        <Solutions
          onOpenScanner={handleOpenScanner}
          onOpenContact={handleOpenContact}
        />

        {/* Interactive AI Opportunity Scanner Tool (Primary Flagship Feature) */}
        <OpportunityScanner
          onOpenContactWithData={handleOpenContactWithData}
        />

        {/* Case Studies */}
        <CaseStudies />

        {/* Four-step Process */}
        <ProcessSection />

        {/* Technology Ecosystem */}
        <TechnologySection />

        {/* About Kre8link */}
        <AboutSection />

        {/* Final CTA */}
        <FinalCTA
          onOpenScanner={handleOpenScanner}
          onOpenContact={handleOpenContact}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenContact={handleOpenContact}
        onOpenScanner={handleOpenScanner}
      />

      {/* Floating Scroll To Top Button */}
      <ScrollToTopButton />

      {/* Contact & Consultation Request Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        prefillData={contactPrefillData}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldAlert, CheckCircle, KeyRound, ArrowLeft } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getAdminEmail, isAllowedAdminEmail } from '../../lib/adminData';

interface AdminLoginProps {
  onSuccess: () => void;
  onNavigateHome: () => void;
}

export function AdminLogin({ onSuccess, onNavigateHome }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const configuredAdminEmail = getAdminEmail();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage('Supabase is not configured. Please verify environment credentials.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMessage(error.message || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      // 2. Verify if the authenticated user matches ADMIN_EMAIL
      const loggedInEmail = data.user?.email;
      if (!isAllowedAdminEmail(loggedInEmail)) {
        // Sign out unauthorized user immediately
        await supabase.auth.signOut();
        setErrorMessage('You are not authorized to access the Kre8link Admin Portal.');
        setIsLoading(false);
        return;
      }

      // Success
      setIsLoading(false);
      onSuccess();
    } catch (err: any) {
      console.error('[Admin Login] Exception:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during sign in.');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setForgotError('Supabase is not configured.');
      return;
    }

    setForgotLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/admin/login`,
      });

      if (error) {
        setForgotError(error.message);
      } else {
        setForgotSuccess('Password reset instructions have been sent to your email.');
      }
    } catch (err: any) {
      setForgotError(err.message || 'Failed to request password reset.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A292C] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#F05323]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top back button */}
      <button
        onClick={onNavigateHome}
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-[#F05323]" />
        <span>Back to Kre8link</span>
      </button>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-200 relative z-10 overflow-hidden">
        {/* Brand Header */}
        <div className="bg-[#0A292C] -mx-8 -mt-8 p-8 text-center border-b border-teal-900/40 mb-6 flex flex-col items-center justify-center">
          <img
            src="/Kre8Link-06.svg"
            alt="Kre8link Logo"
            className="h-10 sm:h-12 w-auto object-contain mb-3 max-w-[240px] brightness-0 invert"
          />
          <p className="text-[11px] font-mono text-teal-300 uppercase tracking-widest font-semibold">
            Admin Portal Sign In
          </p>
        </div>

        {/* Security Notice */}
        <div className="mb-5 p-3 rounded-lg bg-teal-50 border border-teal-200/80 text-xs text-teal-900 font-medium flex items-center gap-2">
          <Lock className="w-4 h-4 text-teal-700 shrink-0" />
          <span>Restricted to authorized administrator access only.</span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kre8link.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F05323] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setIsForgotModalOpen(true);
                }}
                className="text-xs font-semibold text-[#F05323] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F05323] focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#F05323] hover:bg-[#d84419] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-[#0A292C] mb-2">Reset Password</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Enter your admin email address and we will send you a password reset link.
            </p>

            {forgotError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-800 text-xs font-medium">
                {forgotError}
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="admin@kre8link.com"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F05323]"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-4 py-2 bg-[#F05323] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-[#d84419]"
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

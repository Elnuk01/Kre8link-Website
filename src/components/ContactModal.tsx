import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { submitContactRequest } from '../lib/supabase';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillData?: any;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, prefillData }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (prefillData) {
      if (prefillData.name) setName(prefillData.name);
      if (prefillData.email) setEmail(prefillData.email);
      if (prefillData.phone) setPhone(prefillData.phone);
      if (prefillData.companyName) setCompany(prefillData.companyName);
      if (prefillData.opportunities) {
        const oppTitles = prefillData.opportunities.map((o: any) => o.title).join(', ');
        setMessage(`Requested Proposal for AI Opportunities: ${oppTitles}\nBusiness Description: ${prefillData.description || ''}`);
      }
    }
  }, [prefillData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      // Direct call to Supabase contact_requests table
      const res = await submitContactRequest({
        name,
        email,
        phone,
        company,
        message
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(res.error || 'Failed to submit contact request. Please try again.');
      }
    } catch (err: any) {
      console.error('Contact submit error:', err);
      setErrorMsg('Something went wrong while sending your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setErrorMsg(null);
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl space-y-6"
        >
          <button
            onClick={handleResetAndClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-teal-600" />
              </div>

              <h3 className="text-2xl font-bold text-[#0A292C]">Request Received</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Thanks — we've received your message. A Kre8Link AI transformation architect will review your request and reach out within 24 hours.
              </p>

              <button
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-full bg-[#F05323] text-white text-xs font-semibold hover:bg-[#D94418] cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#F05323] border border-orange-200 text-xs font-mono font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Talk to Kre8Link
                </div>
                <h3 className="text-2xl font-bold text-[#0A292C]">Find Your AI Opportunity</h3>
                <p className="text-xs text-slate-500">
                  Tell us about your business goals. We'll map out a custom AI architecture proposal.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-500 mb-1 font-bold">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#F05323]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-500 mb-1 font-bold">Business Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#F05323]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-500 mb-1 font-bold">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#F05323]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-500 mb-1 font-bold">Company Name</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Company Ltd"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#F05323]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-500 mb-1 font-bold">Message / Bottlenecks</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Briefly describe what's slowing your team down..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#F05323] resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !name.trim() || !email.trim()}
                    className="w-full py-3 rounded-xl bg-[#F05323] hover:bg-[#D94418] disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#F05323]/20 cursor-pointer"
                  >
                    {submitting ? (
                      <span>Sending Request...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Consultation Request →</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};


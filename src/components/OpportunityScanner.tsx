import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Check, RefreshCw, Send, ShieldCheck, AlertCircle, FileText, Printer, Building2, Calendar } from 'lucide-react';
import { calculateOpportunities } from '../lib/opportunities';
import { submitOpportunityAudit, submitLead } from '../lib/supabase';
import { AIOpportunity, AuditResponse } from '../types';
import { AIOpportunityReportModal } from './admin/AIOpportunityReportModal';

interface OpportunityScannerProps {
  onOpenContactWithData?: (data: any) => void;
}

export const OpportunityScanner: React.FC<OpportunityScannerProps> = ({ onOpenContactWithData }) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [companyName, setCompanyName] = useState<string>('');
  const [industry, setIndustry] = useState<string>('');
  const [customIndustry, setCustomIndustry] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // Result State
  const [businessId, setBusinessId] = useState<string | undefined>(undefined);
  const [opportunities, setOpportunities] = useState<AIOpportunity[] | null>(null);

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Lead Capture State
  const [leadName, setLeadName] = useState<string>('');
  const [leadEmail, setLeadEmail] = useState<string>('');
  const [leadPhone, setLeadPhone] = useState<string>('');
  const [leadCompany, setLeadCompany] = useState<string>('');
  const [leadSubmitting, setLeadSubmitting] = useState<boolean>(false);
  const [leadSubmitted, setLeadSubmitted] = useState<boolean>(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  const industryOptions = [
    'E-commerce & Retail',
    'Logistics & Supply Chain',
    'Professional Services & Consulting',
    'Healthcare & Medical',
    'Real Estate & Property',
    'Financial Services & Fintech',
    'Technology & Software',
    'Hospitality & Tourism',
    'Manufacturing & Industrial',
    'Construction & Trades',
    'Legal & Compliance',
    'Education & Training',
    'Marketing & Media',
    'Other'
  ];

  const popularIndustries = [
    'E-commerce & Retail',
    'Logistics & Supply Chain',
    'Professional Services',
    'Healthcare & Medical',
    'Real Estate',
    'Financial Services',
    'Technology & Software'
  ];

  const deptOptions = ['Customer service', 'Sales', 'Operations', 'Finance', 'Marketing', 'Reporting', 'Other'];
  const toolOptions = ['WhatsApp', 'Email', 'Excel', 'Google Sheets', 'CRM', 'Accounting software', 'Website', 'Other'];
  const goalOptions = ['Reduce costs', 'Increase sales', 'Save time', 'Improve customer service', 'Understand data', 'Scale operations'];

  const loadingMessages = [
    'Analyzing your business...',
    'Mapping your AI opportunities...',
    'Building your opportunity report...'
  ];

  // Animated loading states text rotation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingTextIndex(0);
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const toggleArrayItem = (array: string[], item: string, setter: (val: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  const handleRunAudit = async () => {
    if (!description.trim()) {
      setErrorMessage('Please provide a business description before generating report.');
      setStep(1);
      return;
    }

    const resolvedIndustry = industry === 'Other'
      ? (customIndustry.trim() || 'Other')
      : (industry.trim() || undefined);

    setErrorMessage(null);
    setLoading(true);
    setStep(5);

    // Generate rule-based AI opportunities matching prompt criteria
    const localOpps = calculateOpportunities({
      description,
      industry: resolvedIndustry,
      departments: selectedDepts,
      tools: selectedTools,
      goals: selectedGoals
    });

    setOpportunities(localOpps);

    // Save audit details and generated opportunities directly to Supabase
    try {
      const res = await submitOpportunityAudit({
        company_name: companyName,
        industry: resolvedIndustry,
        business_description: description,
        pain_points: selectedDepts,
        current_tools: selectedTools,
        primary_goal: selectedGoals[0] || 'Automation',
        opportunities: localOpps
      });

      if (res.success) {
        setBusinessId(res.business_id);
        if (companyName) setLeadCompany(companyName);
      } else {
        console.error('[Scanner] Audit save failed:', res.error);
        setErrorMessage(res.error || 'Your AI opportunity scan could not be completed. Please try again.');
      }
    } catch (err: any) {
      console.error('[Scanner] Audit submit exception:', err);
      setErrorMessage(err?.message || 'Your AI opportunity scan could not be completed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (leadSubmitting || leadSubmitted) return;

    if (!leadName.trim() || !leadEmail.trim()) {
      setLeadError('Please fill in required fields (Name and Email).');
      return;
    }

    setLeadError(null);
    setLeadSubmitting(true);

    try {
      const res = await submitLead({
        business_id: businessId,
        name: leadName.trim(),
        email: leadEmail.trim(),
        phone: leadPhone.trim() || null
      });

      if (res.success) {
        setLeadSubmitted(true);
      } else {
        const detailMsg = res.error
          ? `Your AI opportunity report was generated, but we couldn't save your contact details (${res.error}). Please try again.`
          : "Your AI opportunity report was generated, but we couldn't save your contact details. Please try again.";
        setLeadError(detailMsg);
      }
    } catch (err: any) {
      console.error('[Lead] Error:', err);
      const detailMsg = err?.message
        ? `Your AI opportunity report was generated, but we couldn't save your contact details (${err.message}). Please try again.`
        : "Your AI opportunity report was generated, but we couldn't save your contact details. Please try again.";
      setLeadError(detailMsg);
    } finally {
      setLeadSubmitting(false);
    }
  };

  const resetAudit = () => {
    setStep(1);
    setLoading(false);
    setErrorMessage(null);
    setOpportunities(null);
    setBusinessId(undefined);
    setDescription('');
    setCompanyName('');
    setIndustry('');
    setCustomIndustry('');
    setSelectedDepts([]);
    setSelectedTools([]);
    setSelectedGoals([]);
    setLeadName('');
    setLeadEmail('');
    setLeadPhone('');
    setLeadCompany('');
    setLeadSubmitted(false);
    setLeadError(null);
    setShowReportModal(false);
  };

  const resolvedIndustry = industry === 'Other'
    ? (customIndustry.trim() || 'Other')
    : (industry.trim() || undefined);

  // Construct AuditResponse object for report modal display
  const currentAuditResponse: AuditResponse = {
    id: businessId || 'preview-audit',
    business_id: businessId,
    description: description || 'Business Overview',
    primary_goal: selectedGoals.join(', ') || 'Process Automation',
    pain_points: selectedDepts,
    current_tools: selectedTools,
    created_at: new Date().toISOString(),
    business: {
      id: businessId,
      company_name: companyName || 'Your Business',
      industry: resolvedIndustry,
      description: description,
    },
    opportunities: opportunities || [],
  };

  return (
    <section id="scanner" className="py-20 sm:py-24 bg-[#F8FAF9] relative overflow-hidden border-t border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#F05323] text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive AI Opportunity Scanner
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0A292C] tracking-tight">
            Find your AI opportunities.
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Tell us a little about your business. We'll identify processes that could potentially be improved with AI and automation.
          </p>
        </div>

        {/* Wizard Container */}
        <div className="p-5 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl relative">
          {/* Step Progress Bar */}
          {step < 5 && (
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2 font-semibold">
                <span>STEP 0{step} OF 04</span>
                <span>
                  {step === 1 ? 'Business Context' : step === 2 ? 'Time Sinks' : step === 3 ? 'Tech Stack' : 'Primary Goals'}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#F05323] h-full transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1 */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-[#0A292C] mb-1">Step 1: What does your business do?</h3>
                  <p className="text-xs text-slate-500">Provide a brief overview so our engine understands your operating model.</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-500 mb-1.5 font-bold">Company Name (Optional)</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Apex Logistics or Nova Dental"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#F05323] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-500 mb-1.5 font-bold">Industry Sector (Optional)</label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#F05323] transition-colors cursor-pointer"
                      >
                        <option value="">Select industry or pick below...</option>
                        {industryOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Popular Industry Quick-Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider block">
                      Common Sectors:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {popularIndustries.map((ind) => {
                        const isSelected = industry === ind;
                        return (
                          <button
                            key={ind}
                            type="button"
                            onClick={() => setIndustry(isSelected ? '' : ind)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#F05323] text-white border-[#F05323] shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {ind}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Industry Input if "Other" is selected */}
                  {industry === 'Other' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-3 bg-orange-50/60 rounded-xl border border-orange-200/80 space-y-1.5"
                    >
                      <label className="block text-xs font-mono text-slate-700 font-bold">Specify Your Industry / Niche</label>
                      <input
                        type="text"
                        value={customIndustry}
                        onChange={(e) => setCustomIndustry(e.target.value)}
                        placeholder="e.g. Renewable Energy, Renewable Logistics, Event Management, Veterinary..."
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#F05323] transition-colors"
                      />
                    </motion.div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-mono text-slate-500 font-bold">Business Description & Services *</label>
                      {!description.trim() && (
                        <span className="text-[10px] text-red-500 font-mono">* Required field</span>
                      )}
                    </div>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="e.g. We operate a multi-location logistics company. We handle 100+ inbound delivery inquiries daily via WhatsApp and email..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#F05323] transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    disabled={!description.trim()}
                    onClick={() => {
                      if (description.trim()) setStep(2);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F05323] hover:bg-[#D94418] disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <span>Next: Team Time Sinks</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-[#0A292C] mb-1">Step 2: Where does your team spend the most time?</h3>
                  <p className="text-xs text-slate-500">Select all operational areas that suffer from manual workload.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {deptOptions.map((dept) => {
                    const isSelected = selectedDepts.includes(dept);
                    return (
                      <button
                        key={dept}
                        onClick={() => toggleArrayItem(selectedDepts, dept, setSelectedDepts)}
                        className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-orange-50 border-[#F05323] text-[#0A292C] font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>{dept}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#F05323]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F05323] hover:bg-[#D94418] text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <span>Next: Current Tools</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-[#0A292C] mb-1">Step 3: What tools do you currently use?</h3>
                  <p className="text-xs text-slate-500">Select software currently in use across your team.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {toolOptions.map((tool) => {
                    const isSelected = selectedTools.includes(tool);
                    return (
                      <button
                        key={tool}
                        onClick={() => toggleArrayItem(selectedTools, tool, setSelectedTools)}
                        className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-orange-50 border-[#F05323] text-[#0A292C] font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>{tool}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#F05323]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F05323] hover:bg-[#D94418] text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <span>Next: Desired Outcome</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-[#0A292C] mb-1">Step 4: What would you most like to improve?</h3>
                  <p className="text-xs text-slate-500">Select your top priorities for AI transformation.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {goalOptions.map((goal) => {
                    const isSelected = selectedGoals.includes(goal);
                    return (
                      <button
                        key={goal}
                        onClick={() => toggleArrayItem(selectedGoals, goal, setSelectedGoals)}
                        className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-orange-50 border-[#F05323] text-[#0A292C] font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>{goal}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#F05323]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleRunAudit}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#F05323] hover:bg-[#D94418] text-white font-semibold text-xs shadow-lg shadow-[#F05323]/25 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze & Generate Opportunities</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: RESULTS SCREEN */}
            {step === 5 && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                {loading ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-12 h-12 border-3 border-[#F05323] border-t-transparent rounded-full animate-spin mx-auto" />
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={loadingTextIndex}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-1"
                      >
                        <h3 className="text-lg font-bold text-[#0A292C]">
                          {loadingMessages[loadingTextIndex]}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono">
                          Evaluating operational workflows & generating AI opportunity roadmap...
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                ) : (
                  <>
                    {/* Header Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                      <div>
                        <div className="text-xs font-mono text-teal-700 flex items-center gap-1.5 mb-1 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-teal-600" />
                          <span>AI OPPORTUNITY SCAN COMPLETE</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0A292C]">
                          AI Opportunities for {companyName || 'Your Business'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Identified {opportunities?.length || 0} high-value AI transformation opportunities tailored to your operations.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowReportModal(true)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A292C] bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-700" />
                          <span>View Full PDF Report</span>
                        </button>
                        <button
                          onClick={resetAudit}
                          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 px-3.5 py-2 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 font-medium"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Start New Scan
                        </button>
                      </div>
                    </div>

                    {/* Business Audit Summary Context */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/60 border border-teal-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-teal-800 block">
                          Business Profile
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="font-bold text-[#0A292C] block">
                            {companyName || 'Unspecified Company'}
                          </span>
                          {resolvedIndustry && (
                            <span className="px-2 py-0.5 bg-teal-100/80 text-teal-900 font-mono text-[10px] rounded-md font-semibold">
                              {resolvedIndustry}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-[11px] line-clamp-2 mt-0.5">{description}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-teal-800 block">
                          Primary Goals & Challenges
                        </span>
                        <span className="font-semibold text-slate-800 block mt-0.5">
                          {selectedGoals.length > 0 ? selectedGoals.join(', ') : 'Process Automation & Time Savings'}
                        </span>
                        <span className="text-slate-500 text-[11px] block mt-0.5">
                          Focus Areas: {selectedDepts.length > 0 ? selectedDepts.join(', ') : 'All Operations'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-teal-800 block">
                          Current Tech Stack
                        </span>
                        <span className="font-semibold text-slate-800 block mt-0.5">
                          {selectedTools.length > 0 ? selectedTools.join(', ') : 'Standard Productivity Software'}
                        </span>
                        <span className="text-emerald-700 font-mono text-[11px] block mt-0.5 font-bold">
                          ⚡ Status: Saved in Database
                        </span>
                      </div>
                    </div>

                    {/* Opportunities List - Premium Animated Cards */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-[#0A292C] uppercase tracking-wider font-mono">
                          Tailored AI Opportunities ({opportunities?.length || 0})
                        </h4>
                        <span className="text-xs text-slate-500">Prioritized by Impact & Feasibility</span>
                      </div>

                      {opportunities?.map((opp, idx) => (
                        <motion.div
                          key={opp.id ? `scanner-opp-${opp.id}` : `scanner-opp-idx-${idx}`}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#F05323]/40 transition-all space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-mono font-bold text-[#F05323] bg-orange-100/60 px-2 py-0.5 rounded">
                                0{idx + 1}
                              </span>
                              <h4 className="text-base font-bold text-[#0A292C]">{opp.title}</h4>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-auto">
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-orange-100 text-[#F05323] border border-orange-200">
                                Impact: {opp.impact}
                              </span>
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-teal-100 text-teal-800 border border-teal-200">
                                Priority: {opp.priority || 'HIGH'}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {opp.description}
                          </p>

                          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-200/60">
                            {opp.estimatedHoursSaved && (
                              <span className="text-teal-800 font-semibold font-mono">
                                ⚡ Est. Savings: {opp.estimatedHoursSaved}
                              </span>
                            )}
                            {opp.suggestedTech && opp.suggestedTech.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 text-slate-500">
                                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Stack:</span>
                                {opp.suggestedTech.map((tech, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-700">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* LEAD CAPTURE SECTION */}
                    <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0A292C] to-[#0d3438] text-white space-y-6 shadow-lg">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-teal-900/60 pb-4">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-mono font-bold mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#F05323]" />
                            Get Your AI Opportunity Report
                          </div>
                          <h4 className="text-xl sm:text-2xl font-extrabold text-white">
                            Get Your AI Opportunity Report & Consultation
                          </h4>
                          <p className="text-xs text-slate-300 mt-1 max-w-xl">
                            Get your customized AI opportunity report and discuss how we can implement the highest-impact opportunities for your business.
                          </p>
                        </div>

                        <button
                          onClick={() => setShowReportModal(true)}
                          className="shrink-0 px-4 py-2.5 bg-teal-900/80 hover:bg-teal-800 text-teal-200 border border-teal-700/60 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Preview PDF Report</span>
                        </button>
                      </div>

                      {leadSubmitted ? (
                        <div className="p-6 rounded-2xl bg-teal-900/50 border border-teal-500/40 text-center space-y-4">
                          <CheckCircle2 className="w-10 h-10 text-teal-300 mx-auto" />
                          <div>
                            <h5 className="text-lg font-bold text-white">Your AI Opportunity Report is Ready!</h5>
                            <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
                              Thank you, <strong className="text-white">{leadName}</strong>! Your information has been saved and connected to your audit profile. Our senior AI consultants will review your roadmap.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            <button
                              onClick={() => setShowReportModal(true)}
                              className="px-5 py-2.5 rounded-xl bg-[#F05323] hover:bg-[#D94418] text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                            >
                              <FileText className="w-4 h-4" />
                              <span>Download / Print PDF Report</span>
                            </button>

                            <button
                              onClick={() => {
                                if (onOpenContactWithData) {
                                  onOpenContactWithData({
                                    name: leadName,
                                    email: leadEmail,
                                    phone: leadPhone,
                                    companyName: companyName || leadCompany,
                                    description,
                                    opportunities
                                  });
                                }
                              }}
                              className="px-5 py-2.5 rounded-xl bg-white text-[#0A292C] hover:bg-slate-100 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <span>Book a Consultation</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleLeadSubmit} className="space-y-4">
                          {leadError && (
                            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                              <span>{leadError}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-mono text-slate-300 mb-1 font-bold">Your Name *</label>
                              <input
                                type="text"
                                required
                                value={leadName}
                                onChange={(e) => setLeadName(e.target.value)}
                                placeholder="Jane Doe"
                                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#F05323]"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-mono text-slate-300 mb-1 font-bold">Business Email *</label>
                              <input
                                type="email"
                                required
                                value={leadEmail}
                                onChange={(e) => setLeadEmail(e.target.value)}
                                placeholder="jane@company.com"
                                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#F05323]"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-mono text-slate-300 mb-1 font-bold">Phone Number (Optional)</label>
                              <input
                                type="tel"
                                value={leadPhone}
                                onChange={(e) => setLeadPhone(e.target.value)}
                                placeholder="+1 (555) 000-0000"
                                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#F05323]"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-mono text-slate-300 mb-1 font-bold">Company Name</label>
                              <input
                                type="text"
                                value={leadCompany || companyName}
                                onChange={(e) => setLeadCompany(e.target.value)}
                                placeholder="Company Ltd"
                                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#F05323]"
                              />
                            </div>
                          </div>

                          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <span className="text-[11px] text-slate-400">
                              🔒 Your details will be saved to your business audit profile.
                            </span>

                            <button
                              type="submit"
                              disabled={leadSubmitting || !leadName.trim() || !leadEmail.trim()}
                              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#F05323] hover:bg-[#D94418] disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                            >
                              {leadSubmitting ? (
                                <span className="flex items-center gap-2">
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Saving Details...</span>
                                </span>
                              ) : (
                                <>
                                  <Send className="w-3.5 h-3.5" />
                                  <span>Submit Lead Request & Get Report →</span>
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                    {/* Bottom Action */}
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>All data securely stored in Kre8link Supabase database.</span>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => setShowReportModal(true)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-700" />
                          <span>View PDF Report</span>
                        </button>

                        <button
                          onClick={() => {
                            if (onOpenContactWithData) {
                              onOpenContactWithData({
                                name: leadName,
                                email: leadEmail,
                                companyName: companyName || leadCompany,
                                description,
                                opportunities
                              });
                            }
                          }}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0A292C] hover:bg-slate-800 transition-all cursor-pointer"
                        >
                          <span>Book Consultation</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Printable AI Opportunity Report Modal */}
      {showReportModal && (
        <AIOpportunityReportModal
          audit={currentAuditResponse}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </section>
  );
};

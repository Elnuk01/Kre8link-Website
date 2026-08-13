import React, { useEffect } from 'react';
import { X, FileText, Sparkles, Building2, CheckCircle, ArrowRight, Printer } from 'lucide-react';
import { AuditResponse } from '../../types';

interface AIOpportunityReportModalProps {
  audit: AuditResponse;
  onClose: () => void;
}

export function AIOpportunityReportModal({ audit, onClose }: AIOpportunityReportModalProps) {
  const companyName = audit.business?.company_name || 'Business Overview';
  const industry = audit.business?.industry || 'General Business';
  const companySize = audit.business?.company_size || 'N/A';
  const description = audit.description || audit.business?.description || 'N/A';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="print-container bg-white text-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-scaleUp relative">
        {/* Top Actions & Banner */}
        <div className="p-5 sm:p-6 bg-[#0A292C] text-white flex items-center justify-between border-b border-teal-900/50 print:hidden sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F05323] text-white flex items-center justify-center font-black text-xl shrink-0">
              K
            </div>
            <div>
              <span className="text-[10px] font-mono text-teal-300 font-semibold uppercase tracking-wider block">
                Kre8link Intelligence System
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">AI Opportunity Report</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 bg-teal-900/80 hover:bg-teal-800 text-teal-200 text-xs font-semibold rounded-xl border border-teal-700/60 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Report</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white bg-white/10 hover:bg-rose-600 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold pl-3 pr-3"
              title="Close Report (Esc)"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-8 space-y-8 print:p-0">
          {/* Business Header */}
          <div className="border-b border-slate-200 pb-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-[#F05323] font-bold uppercase tracking-widest block">
                  AI OPPORTUNITY REPORT
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-[#0A292C] tracking-tight mt-1">
                  {companyName}
                </h1>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Generated Date</span>
                <span className="text-xs font-bold font-mono text-slate-700">
                  {audit.created_at ? new Date(audit.created_at).toLocaleDateString() : 'Recent'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <strong className="text-slate-800">Business Overview:</strong> {description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                <span className="text-[10px] font-mono font-bold uppercase text-teal-800 block">Industry</span>
                <span className="font-semibold text-[#0A292C]">{industry}</span>
              </div>
              <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                <span className="text-[10px] font-mono font-bold uppercase text-teal-800 block">Company Size</span>
                <span className="font-semibold text-[#0A292C]">{companySize}</span>
              </div>
              <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 sm:col-span-2">
                <span className="text-[10px] font-mono font-bold uppercase text-teal-800 block">Primary Goal</span>
                <span className="font-semibold text-[#0A292C] truncate block">
                  {audit.primary_goal || 'Process Automation'}
                </span>
              </div>
            </div>
          </div>

          {/* Operational Context: Pain Points & Current Tools */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-[#0A292C] tracking-wider block mb-2">
                Identified Pain Points
              </span>
              {audit.pain_points && audit.pain_points.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {audit.pain_points.map((p, idx) => (
                    <span
                      key={`pp-${idx}-${p}`}
                      className="px-3 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs font-semibold"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">None specified</span>
              )}
            </div>

            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-[#0A292C] tracking-wider block mb-2">
                Current Technology Tools
              </span>
              {audit.current_tools && audit.current_tools.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {audit.current_tools.map((t, idx) => (
                    <span
                      key={`tool-${idx}-${t}`}
                      className="px-3 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">None specified</span>
              )}
            </div>
          </div>

          {/* AI Opportunities Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-extrabold text-[#0A292C] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F05323]" />
                Tailored AI Opportunities
              </h2>
              <span className="text-xs font-mono font-bold text-[#F05323]">
                {audit.opportunities?.length || 0} OPPORTUNITIES IDENTIFIED
              </span>
            </div>

            {!audit.opportunities || audit.opportunities.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No specific opportunities recorded for this audit.</p>
            ) : (
              <div className="space-y-6">
                {audit.opportunities.map((opp, index) => {
                  const numStr = String(index + 1).padStart(2, '0');
                  return (
                    <div
                      key={opp.id ? `modal-opp-${opp.id}` : `modal-opp-idx-${index}`}
                      className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-3 relative overflow-hidden"
                    >
                      {/* Top Opp Bar */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-black font-mono text-[#F05323]">
                            {numStr}
                          </span>
                          <div>
                            <h3 className="text-base font-extrabold text-[#0A292C]">{opp.title}</h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-extrabold rounded-md uppercase">
                            Impact: {opp.impact || 'HIGH'}
                          </span>
                          <span className="px-2.5 py-1 bg-teal-100 text-teal-900 border border-teal-300 text-[10px] font-mono font-extrabold rounded-md uppercase">
                            Priority: {String(opp.priority || 'HIGH').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {opp.description}
                      </p>

                      {/* Tech / Hours tags if available */}
                      <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] border-t border-slate-200/60">
                        {opp.estimatedHoursSaved && (
                          <span className="text-teal-800 font-semibold font-mono">
                            ⚡ Est. Time Savings: {opp.estimatedHoursSaved}
                          </span>
                        )}
                        {opp.suggestedTech && opp.suggestedTech.length > 0 && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <span className="font-mono text-[10px] uppercase font-bold text-slate-400">Tech Stack:</span>
                            {opp.suggestedTech.map((tech, i) => (
                              <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-700 font-mono">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Branding & Actions */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs print:pb-0">
            <div className="text-slate-400 font-mono text-[11px] flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span>Kre8link AI Transformation Systems</span>
              <span className="hidden sm:inline">•</span>
              <span>Confidential Executive Audit</span>
            </div>

            <div className="flex items-center gap-2 print:hidden w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Print PDF</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-[#0A292C] hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

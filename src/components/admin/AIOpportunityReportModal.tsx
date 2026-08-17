import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Printer } from 'lucide-react';
import { AuditResponse } from '../../types';

interface AIOpportunityReportModalProps {
  audit: AuditResponse;
  onClose: () => void;
}

export function AIOpportunityReportModal({ audit, onClose }: AIOpportunityReportModalProps) {
  const [printMount, setPrintMount] = useState<HTMLElement | null>(null);

  const companyName = audit.business?.company_name || 'Business Overview';
  const industry = audit.business?.industry || 'General Business';
  const companySize = audit.business?.company_size || 'N/A';
  const description = audit.description || audit.business?.description || 'N/A';

  useEffect(() => {
    let mount = document.getElementById('print-root');
    if (!mount) {
      mount = document.createElement('div');
      mount.id = 'print-root';
      document.body.appendChild(mount);
    }
    setPrintMount(mount);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = 'Kre8Link — AI Opportunity Report';
    window.print();
    setTimeout(() => {
      document.title = originalTitle || 'Kre8Link';
    }, 1500);
  };

  return (
    <>
      {/* 1. ON-SCREEN INTERACTIVE MODAL */}
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      >
        <div className="bg-white text-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-scaleUp relative">
          {/* Top Actions & Banner */}
          <div className="p-5 sm:p-6 bg-[#0A292C] text-white flex items-center justify-between border-b border-teal-900/50 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <img
                src="/Kre8Link-07.svg"
                alt="Kre8Link Logo"
                className="w-10 h-10 object-contain shrink-0"
              />
              <div>
                <span className="text-[10px] font-mono text-teal-300 font-semibold uppercase tracking-wider block">
                  Kre8Link AI Transformation Systems
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

          {/* Modal Preview Body */}
          <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
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

                        {/* Tech / Hours tags */}
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
            <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="text-slate-500 font-mono text-[11px] flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="font-bold text-slate-700">Kre8Link AI Transformation Systems</span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="text-[#F05323] font-semibold">https://kre8link.com</span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="text-slate-400">Confidential Executive Assessment</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
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

      {/* 2. PURE PRINT PORTAL (Mounted directly into #print-root outside #root) */}
      {printMount &&
        createPortal(
          <div className="print-report-root p-6 max-w-4xl mx-auto space-y-6">
            {/* Executive Print Header */}
            <div className="print-report-section flex items-center justify-between pb-4 border-b-2 border-[#0A292C]">
              <div className="flex items-center gap-3">
                <img
                  src="/Kre8Link-07.svg"
                  alt="Kre8Link Logo"
                  className="w-10 h-10 object-contain shrink-0"
                />
                <div>
                  <div className="text-xl font-black text-[#0A292C] tracking-tight">Kre8Link</div>
                  <div className="text-xs font-mono text-slate-500 font-semibold">AI Transformation Systems</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold font-mono text-[#F05323]">https://kre8link.com</div>
                <div className="text-xs font-mono text-slate-500">Confidential Executive Assessment</div>
              </div>
            </div>

            {/* Business Header */}
            <div className="print-report-section border-b border-slate-200 pb-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-[#F05323] font-bold uppercase tracking-widest block">
                    AI OPPORTUNITY REPORT
                  </span>
                  <h1 className="text-2xl font-black text-[#0A292C] tracking-tight mt-1">
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

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                <strong className="text-slate-900">Business Overview:</strong> {description}
              </p>

              <div className="grid grid-cols-4 gap-3 pt-1 text-xs">
                <div className="p-2.5 bg-teal-50/60 rounded-lg border border-teal-100">
                  <span className="text-[10px] font-mono font-bold uppercase text-teal-800 block">Industry</span>
                  <span className="font-semibold text-[#0A292C]">{industry}</span>
                </div>
                <div className="p-2.5 bg-teal-50/60 rounded-lg border border-teal-100">
                  <span className="text-[10px] font-mono font-bold uppercase text-teal-800 block">Company Size</span>
                  <span className="font-semibold text-[#0A292C]">{companySize}</span>
                </div>
                <div className="p-2.5 bg-teal-50/60 rounded-lg border border-teal-100 col-span-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-teal-800 block">Primary Goal</span>
                  <span className="font-semibold text-[#0A292C] truncate block">
                    {audit.primary_goal || 'Process Automation'}
                  </span>
                </div>
              </div>
            </div>

            {/* Operational Context: Pain Points & Current Tools */}
            <div className="print-report-section grid grid-cols-2 gap-6 pb-5 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-[#0A292C] tracking-wider block mb-2">
                  Identified Pain Points
                </span>
                {audit.pain_points && audit.pain_points.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {audit.pain_points.map((p, idx) => (
                      <span
                        key={`print-pp-${idx}-${p}`}
                        className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded text-xs font-semibold"
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
                  <div className="flex flex-wrap gap-1.5">
                    {audit.current_tools.map((t, idx) => (
                      <span
                        key={`print-tool-${idx}-${t}`}
                        className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded text-xs font-semibold"
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
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-sm font-extrabold text-[#0A292C] uppercase tracking-wider flex items-center gap-2">
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
                <div className="space-y-3.5">
                  {audit.opportunities.map((opp, index) => {
                    const numStr = String(index + 1).padStart(2, '0');
                    return (
                      <div
                        key={opp.id ? `print-opp-${opp.id}` : `print-opp-idx-${index}`}
                        className="print-report-card p-4.5 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2"
                      >
                        {/* Top Opp Bar */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl font-black font-mono text-[#F05323]">
                              {numStr}
                            </span>
                            <h3 className="text-sm font-extrabold text-[#0A292C]">{opp.title}</h3>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-extrabold rounded uppercase">
                              Impact: {opp.impact || 'HIGH'}
                            </span>
                            <span className="px-2 py-0.5 bg-teal-100 text-teal-900 border border-teal-300 text-[10px] font-mono font-extrabold rounded uppercase">
                              Priority: {String(opp.priority || 'HIGH').toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-700 leading-relaxed font-normal">
                          {opp.description}
                        </p>

                        {/* Tech / Hours tags */}
                        <div className="flex flex-wrap items-center gap-3 pt-1.5 text-[11px] border-t border-slate-200/60">
                          {opp.estimatedHoursSaved && (
                            <span className="text-teal-800 font-semibold font-mono">
                              ⚡ Est. Time Savings: {opp.estimatedHoursSaved}
                            </span>
                          )}
                          {opp.suggestedTech && opp.suggestedTech.length > 0 && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <span className="font-mono text-[10px] uppercase font-bold text-slate-400">Tech Stack:</span>
                              {opp.suggestedTech.map((tech, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-700 font-mono">
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

            {/* Footer Branding */}
            <div className="print-report-section pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono text-[11px]">
              <span className="font-bold text-slate-700">Kre8Link AI Transformation Systems</span>
              <span className="text-[#F05323] font-semibold">https://kre8link.com</span>
              <span className="text-slate-400">Confidential Executive Assessment</span>
            </div>
          </div>,
          printMount
        )}
    </>
  );
}


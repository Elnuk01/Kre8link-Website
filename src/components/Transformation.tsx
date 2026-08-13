import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, ArrowRight, CheckCircle2, AlertCircle, MessageSquare, Database, FileSpreadsheet, User, BarChart, Cpu, Zap, Network } from 'lucide-react';

export const Transformation: React.FC = () => {
  const [viewState, setViewState] = useState<'before' | 'after'>('after');

  return (
    <section id="transformation" className="py-24 bg-[#F8FAF9] relative overflow-hidden border-t border-slate-200/80">
      {/* Glow effect */}
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[300px] bg-[#F05323]/05 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <p className="text-xs font-mono uppercase tracking-widest text-[#F05323] font-bold">
            Kre8link Architecture Transformation
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0A292C] tracking-tight leading-tight">
            From disconnected work to intelligent systems.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal">
            Toggle between traditional disconnected business chaos and a unified Kre8link automated ecosystem.
          </p>

          {/* Before / After Toggle Buttons */}
          <div className="inline-flex p-1.5 rounded-full bg-white border border-slate-200 shadow-sm mt-4">
            <button
              onClick={() => setViewState('before')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewState === 'before'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm'
                  : 'text-slate-600 hover:text-[#0A292C]'
              }`}
            >
              BEFORE — Disconnected Work
            </button>
            <button
              onClick={() => setViewState('after')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewState === 'after'
                  ? 'bg-[#F05323] text-white shadow-md shadow-[#F05323]/25'
                  : 'text-slate-600 hover:text-[#0A292C]'
              }`}
            >
              AFTER — Kre8link System
            </button>
          </div>
        </div>

        {/* Dynamic Display Canvas */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xl relative min-h-[420px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {viewState === 'before' ? (
              <motion.div
                key="before-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="space-y-8 my-auto"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2 text-amber-700 text-xs font-mono font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>TRADITIONAL STATE: HIGH FRICTION & SILOED DATA</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Status: Manual Bottlenecks</span>
                </div>

                {/* Disconnected Sequential Diagram */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-8">
                  {[
                    { label: 'WhatsApp', sub: 'Inbound Customer Message', icon: MessageSquare, color: 'border-amber-200 bg-amber-50/50 text-amber-800' },
                    { label: 'Salesperson', sub: 'Manual Typing & Delays', icon: User, color: 'border-slate-200 bg-slate-50 text-slate-700' },
                    { label: 'Spreadsheet', sub: 'Unsynced Excel / Sheets', icon: FileSpreadsheet, color: 'border-slate-200 bg-slate-50 text-slate-700' },
                    { label: 'Manager', sub: 'Manual Status Check', icon: User, color: 'border-slate-200 bg-slate-50 text-slate-700' },
                    { label: 'Manual Report', sub: 'Outdated static document', icon: BarChart, color: 'border-amber-200 bg-amber-50/50 text-amber-800' }
                  ].map((node, i, arr) => {
                    const Icon = node.icon;
                    return (
                      <React.Fragment key={i}>
                        <div className={`w-full md:w-auto p-4 rounded-xl border ${node.color} text-center flex-1 max-w-[200px]`}>
                          <Icon className="w-5 h-5 mx-auto mb-2 opacity-80" />
                          <div className="text-sm font-bold text-[#0A292C] mb-1">{node.label}</div>
                          <div className="text-[11px] text-slate-500">{node.sub}</div>
                        </div>

                        {i < arr.length - 1 && (
                          <div className="hidden md:block text-slate-400 font-bold text-lg">→</div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                  <span>⚠️ Problem: Slow response times, lost leads, human error, zero real-time visibility.</span>
                  <button
                    onClick={() => setViewState('after')}
                    className="underline hover:text-amber-950 font-bold cursor-pointer"
                  >
                    See how Kre8link fixes this →
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="after-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="space-y-8 my-auto"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2 text-teal-700 text-xs font-mono font-bold">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>KRE8LINK STATE: AUTONOMOUS CONNECTED SYSTEM</span>
                  </div>
                  <span className="text-xs text-teal-700 font-mono bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Real-time Synchronization
                  </span>
                </div>

                {/* Connected System Flow Diagram */}
                <div className="py-6 flex flex-col items-center justify-center space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#F05323] text-xs font-mono font-bold">
                      <Cpu className="w-3.5 h-3.5" />
                      AI Agent Engine Active
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-3xl">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center w-full md:w-48">
                      <MessageSquare className="w-5 h-5 mx-auto mb-1 text-[#F05323]" />
                      <span className="text-sm font-bold text-[#0A292C]">WhatsApp & Web</span>
                      <span className="block text-[10px] text-slate-500">Inbound Channel</span>
                    </div>

                    <div className="text-[#F05323] font-mono text-sm hidden md:block">───────→</div>

                    {/* Central Core System */}
                    <div className="p-6 rounded-2xl bg-orange-50/80 border-2 border-[#F05323] text-center w-full md:w-64 shadow-lg shadow-[#F05323]/10">
                      <Network className="w-8 h-8 mx-auto mb-2 text-[#F05323] animate-pulse" />
                      <div className="text-base font-extrabold text-[#0A292C]">Kre8link System</div>
                      <div className="text-xs text-[#F05323] font-bold mt-1">AI Agent & Workflows</div>
                    </div>

                    <div className="text-[#F05323] font-mono text-sm hidden md:block">←───────</div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center w-full md:w-48">
                      <Database className="w-5 h-5 mx-auto mb-1 text-teal-700" />
                      <span className="text-sm font-bold text-[#0A292C]">CRM & ERP</span>
                      <span className="block text-[10px] text-slate-500">Live Database</span>
                    </div>
                  </div>

                  {/* Downstream Outputs */}
                  <div className="flex items-center gap-8 pt-2">
                    <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-center w-36">
                      <Zap className="w-4 h-4 mx-auto mb-1 text-teal-700" />
                      <span className="text-xs font-bold text-[#0A292C]">Automation</span>
                    </div>
                    <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-center w-36">
                      <BarChart className="w-4 h-4 mx-auto mb-1 text-teal-700" />
                      <span className="text-xs font-bold text-[#0A292C]">Reporting</span>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <h3 className="text-2xl font-extrabold text-[#0A292C] tracking-tight">
                    One connected business.
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Zero lost leads. Instant responses. Complete operational transparency.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

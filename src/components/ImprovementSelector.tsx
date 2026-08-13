import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, TrendingDown, Zap, BarChart2, ArrowRight, Check } from 'lucide-react';

interface ImprovementSelectorProps {
  onOpenContact: () => void;
  onOpenScanner: () => void;
}

export const ImprovementSelector: React.FC<ImprovementSelectorProps> = ({ onOpenContact, onOpenScanner }) => {
  const [selectedGoal, setSelectedGoal] = useState<number>(0);

  const options = [
    {
      id: 'sales',
      title: 'Get more customers',
      icon: Users,
      badge: 'Sales & Growth',
      headlineText: 'Turn more enquiries into paying customers.',
      diagramNodes: ['LEAD', 'AI QUALIFICATION', 'CRM', 'FOLLOW-UP', 'SALES TEAM', 'CUSTOMER'],
      explanation: 'Kre8link automates lead capture across WhatsApp, web, and social channels. Our AI handles initial qualification, automated follow-up sequences, and routes high-intent buyers directly to your calendar so reps focus exclusively on closing.',
      systemBenefit: '2.5x increase in sales conversion speed & 0% lead dropoff.'
    },
    {
      id: 'costs',
      title: 'Reduce operational costs',
      icon: TrendingDown,
      badge: 'Operational Efficiency',
      headlineText: 'Cut manual data entry and administrative overhead by up to 70%.',
      diagramNodes: ['INCOMING DATA', 'AI EXTRACTOR', 'RULES ENGINE', 'DATABASE', 'NOTIFICATION'],
      explanation: 'Stop paying team members to manually copy numbers between spreadsheets, invoices, and software. Kre8link builds autonomous document processing and workflow pipelines that execute background tasks flawlessly at near-zero incremental cost.',
      systemBenefit: 'Reduces operational execution cost by over 60% per workflow.'
    },
    {
      id: 'speed',
      title: 'Serve customers faster',
      icon: Zap,
      badge: 'Customer Satisfaction',
      headlineText: 'Instant answers 24/7 across every communication channel.',
      diagramNodes: ['INQUIRY', 'AI CUSTOMER AGENT', 'KNOWLEDGE BASE', 'ACTION EXECUTED', 'RESOLVED'],
      explanation: 'Customers expect immediate responses. We deploy conversational AI agents that resolve 80%+ of customer enquiries, process order updates, and initiate service tickets in seconds without human delay.',
      systemBenefit: 'Average customer wait time drops from 4 hours to 3 seconds.'
    },
    {
      id: 'data',
      title: 'Understand my business better',
      icon: BarChart2,
      badge: 'Data Intelligence',
      headlineText: 'Turn scattered records into daily actionable management insights.',
      diagramNodes: ['RAW DATA', 'SUPABASE / SQL', 'AI ANALYTICS ENGINE', 'EXECUTIVE DIGEST'],
      explanation: 'Bring your operational data together. Kre8link aggregates records from your accounting software, CRM, and communication logs to deliver automated daily executive briefings directly to Slack, WhatsApp, or Email.',
      systemBenefit: 'Eliminates 10+ hours per week spent compiling manual spreadsheets.'
    }
  ];

  const current = options[selectedGoal];
  const IconComponent = current.icon;

  return (
    <section className="py-24 bg-[#F8FAF9] relative border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <p className="text-xs font-mono uppercase tracking-widest text-[#F05323] font-bold">
            Interactive Improvement Engine
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0A292C] tracking-tight leading-tight">
            What would you like to improve?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal">
            Tell us where your business is struggling. We'll show you where AI could help.
          </p>
        </div>

        {/* 4 Interactive Choice Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {options.map((opt, idx) => {
            const Icon = opt.icon;
            const isSelected = selectedGoal === idx;

            return (
              <button
                key={opt.id}
                onClick={() => setSelectedGoal(idx)}
                className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-orange-50/70 border-[#F05323] shadow-md scale-[1.02]'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-[#F05323] text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="flex h-2 w-2 rounded-full bg-[#F05323] animate-pulse" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#F05323] font-bold block mb-1">
                    0{idx + 1}
                  </span>
                  <div className={`text-base font-bold ${isSelected ? 'text-[#0A292C]' : 'text-slate-700'}`}>
                    {opt.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Visual & Explanation Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl relative"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-orange-50 text-[#F05323] border border-orange-200 text-xs font-mono font-bold">
                {current.badge}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-[#0A292C] mb-4">
              {current.headlineText}
            </h3>

            {/* Diagram Flow Nodes */}
            <div className="my-8 p-6 rounded-2xl bg-slate-50 border border-slate-200 overflow-x-auto">
              <div className="text-[11px] font-mono text-slate-400 mb-4 uppercase tracking-wider">
                Target Architecture Flow:
              </div>
              <div className="flex items-center gap-2 min-w-[600px]">
                {current.diagramNodes.map((node, i) => {
                  const isLast = i === current.diagramNodes.length - 1;
                  const isHighlighted = i === 1 || i === 3;

                  return (
                    <React.Fragment key={i}>
                      <div
                        className={`px-3.5 py-2.5 rounded-xl border text-xs font-mono font-semibold whitespace-nowrap ${
                          isHighlighted
                            ? 'bg-[#0A292C] border-[#F05323] text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {node}
                      </div>
                      {!isLast && <span className="text-[#F05323] font-bold text-xs">→</span>}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <p className="text-base text-slate-600 max-w-3xl leading-relaxed mb-6">
              {current.explanation}
            </p>

            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 mb-8 flex items-center gap-2">
              <Check className="w-4 h-4 text-teal-600 shrink-0" />
              <span><strong>Estimated Impact:</strong> {current.systemBenefit}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={onOpenContact}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-semibold text-white bg-[#F05323] hover:bg-[#D94418] transition-all shadow-md shadow-[#F05323]/25 cursor-pointer"
              >
                <span>Build This System</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenScanner}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-semibold text-slate-700 hover:text-[#0A292C] bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
              >
                <span>Run AI Opportunity Audit First</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

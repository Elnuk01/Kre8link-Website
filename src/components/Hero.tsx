import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, UserCheck, Cpu, Zap, Database, TrendingUp, CheckCircle2 } from 'lucide-react';
import { HeroSystemVisual } from './HomepageVisuals';

interface HeroProps {
  onOpenScanner: () => void;
  onOpenContact: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenScanner, onOpenContact }) => {
  const [activeNode, setActiveNode] = useState<number | null>(null);

  const nodes = [
    {
      id: 1,
      title: 'Customer',
      subtitle: 'Inquiries, WhatsApp, Emails & Calls',
      icon: UserCheck,
      color: 'border-slate-200 bg-white text-slate-800'
    },
    {
      id: 2,
      title: 'AI Reasoning',
      subtitle: 'Context understanding & Intent classification',
      icon: Cpu,
      color: 'border-orange-200/80 bg-orange-50/50 text-[#0A292C]'
    },
    {
      id: 3,
      title: 'Automation',
      subtitle: 'Workflow triggers & API execution',
      icon: Zap,
      color: 'border-teal-200/80 bg-teal-50/50 text-[#0A292C]'
    },
    {
      id: 4,
      title: 'Business Systems',
      subtitle: 'CRM, ERP, Billing & Database Sync',
      icon: Database,
      color: 'border-slate-200 bg-white text-slate-800'
    },
    {
      id: 5,
      title: 'Results',
      subtitle: 'Instant responses & 10x ROI',
      icon: TrendingUp,
      color: 'border-emerald-200 bg-emerald-50/60 text-[#0A292C]'
    }
  ];

  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden bg-grid-pattern bg-radial-glow">
      {/* Background subtle orange glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#F05323]/05 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
        <div className="max-w-4xl space-y-6 text-center lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs font-mono uppercase tracking-widest text-[#F05323] font-bold"
          >
            Business Automation &amp; Smarter Systems
          </motion.p>
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#0A292C] leading-[1.08]"
          >
            Make Your Business{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F05323] via-[#FF6B3D] to-[#D94418]">
              Work Smarter.
            </span>
          </motion.h1>

          {/* Supporting text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg font-normal leading-relaxed text-slate-600 sm:text-xl lg:mx-0"
          >
            We help you reduce repetitive work, respond to customers faster, and make better decisions
            by automating and connecting the tools your team already uses.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row lg:justify-start"
          >
            <button
              onClick={onOpenScanner}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full text-sm font-semibold text-white bg-[#F05323] hover:bg-[#D94418] transition-all duration-200 shadow-lg shadow-[#F05323]/25 hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-orange-100" />
              Get a Free Business Audit
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenContact}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-sm font-semibold text-slate-700 hover:text-[#0A292C] bg-white hover:bg-slate-50 border border-slate-200 transition-all duration-200 cursor-pointer shadow-sm"
            >
              Book a Strategy Call
            </button>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed"
          >
            Answer a few questions about how your business works and get a personalised report showing where you can save time, automate work and improve operations.
          </motion.p>
        </div>
        <HeroSystemVisual className="mt-2 lg:mt-0" />
        </div>

        {/* Animated Business System Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 md:mt-24 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 backdrop-blur-xl shadow-xl relative"
        >
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs font-mono text-slate-400">kre8link_business_systems.v1</span>
            </div>
          </div>

          {/* Connected Flow Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {nodes.map((node, index) => {
              const Icon = node.icon;
              const isLast = index === nodes.length - 1;
              const isActive = activeNode === node.id;

              return (
                <div key={node.id} className="relative group">
                  <div
                    onMouseEnter={() => setActiveNode(node.id)}
                    onMouseLeave={() => setActiveNode(null)}
                    className={`h-full p-4 rounded-2xl border transition-all duration-300 ${
                      node.color
                    } ${
                      isActive ? 'scale-[1.03] shadow-md shadow-orange-500/10 border-[#F05323]' : 'hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <Icon className="w-5 h-5 text-[#F05323]" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">0{node.id}</span>
                    </div>

                    <h3 className="text-sm font-bold text-[#0A292C] mb-1">{node.title}</h3>
                    <p className="text-xs text-slate-500 leading-snug">{node.subtitle}</p>
                  </div>

                  {/* Connecting Arrow for Desktop */}
                  {!isLast && (
                    <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-20 items-center justify-center pointer-events-none">
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-[#F05323] text-xs font-bold"
                      >
                        →
                      </motion.div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Interactive Banner footer inside diagram */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Automated end-to-end data flow with zero manual intervention required.</span>
            </div>
            <span className="font-mono text-slate-400 text-[11px]">Connected business systems</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

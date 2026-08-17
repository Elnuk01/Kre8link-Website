import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, MessageSquare, Zap, CheckCircle2 } from 'lucide-react';

interface FinalCTAProps {
  onOpenScanner: () => void;
  onOpenContact: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenScanner, onOpenContact }) => {
  return (
    <section className="py-28 bg-[#F8FAF9] relative overflow-hidden border-t border-slate-200/80 bg-grid-pattern">
      {/* Background subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#F05323]/08 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#F05323] text-xs font-mono font-bold">
            <Zap className="w-3.5 h-3.5" />
            Ready for AI Transformation
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0A292C] tracking-tight leading-tight max-w-4xl mx-auto">
            What could your business do if the repetitive work disappeared?
          </h2>

          <p className="text-lg sm:text-xl text-slate-600 font-normal max-w-2xl mx-auto">
            Let's identify the processes that are slowing you down and determine what AI can do about them.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <button
            onClick={onOpenScanner}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-sm font-semibold text-white bg-[#F05323] hover:bg-[#D94418] transition-all duration-200 shadow-xl shadow-[#F05323]/25 hover:scale-[1.02] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-orange-100" />
            <span>Find Your AI Opportunity</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenContact}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm font-semibold text-slate-700 hover:text-[#0A292C] bg-white hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer shadow-sm"
          >
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span>Talk to Kre8Link</span>
          </button>
        </motion.div>

        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-mono">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            No generic proposals
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            Custom AI architecture
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            Rapid 24h response
          </span>
        </div>
      </div>
    </section>
  );
};

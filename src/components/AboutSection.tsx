import React from 'react';
import { motion } from 'motion/react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-[#F8FAF9] relative border-t border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        <p className="text-xs font-mono uppercase tracking-widest text-[#F05323] font-bold">
          About Kre8Link
        </p>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0A292C] tracking-tight leading-tight">
          Technology should make business simpler.
        </h2>

        <p className="text-lg sm:text-xl text-slate-700 font-normal leading-relaxed max-w-2xl mx-auto">
          Kre8Link exists to help businesses move from manual processes and disconnected tools to intelligent systems that work together.
        </p>

        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <div className="text-xs font-mono text-[#F05323] font-bold mb-1">01. BUSINESS FIRST</div>
            <p className="text-xs text-slate-600">We prioritize ROI and process clarity over hype and jargon.</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <div className="text-xs font-mono text-[#F05323] font-bold mb-1">02. SEAMLESS FIT</div>
            <p className="text-xs text-slate-600">We integrate directly into the software your team uses daily.</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <div className="text-xs font-mono text-[#F05323] font-bold mb-1">03. DURABLE ROI</div>
            <p className="text-xs text-slate-600">Systems engineered to scale autonomously as your business expands.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { motion } from 'motion/react';

export const TrustStatement: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#F8FAF9] border-y border-slate-200/80 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <p className="text-xs font-mono uppercase tracking-widest text-[#F05323] font-bold">
            Our Core Belief
          </p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0A292C] tracking-tight leading-tight">
            AI isn't the strategy.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F05323] to-[#D94418]">
              Your business is.
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto pt-2 font-medium">
            We start with the problem, not the technology.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

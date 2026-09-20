import React from 'react';
import { motion } from 'motion/react';
import { Search, Compass, Cpu } from 'lucide-react';

export const ProcessSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'We Understand Your Business',
      description: 'Tell us how your current processes work.',
      details: 'We learn how your team handles daily work, customers and reporting.',
      icon: Search
    },
    {
      number: '02',
      title: 'We Identify What Can Be Improved',
      description: 'We find repetitive work, bottlenecks and missed opportunities.',
      details: 'We focus on the changes that can save time, improve follow-up and make operations clearer.',
      icon: Compass
    },
    {
      number: '03',
      title: 'We Build the Solution',
      description: 'We automate and connect the right parts of your operation.',
      details: 'We work with the tools you already use and make the improved process practical for your team.',
      icon: Cpu
    }
  ];

  return (
    <section className="py-24 bg-[#F8FAF9] relative border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <p className="text-xs font-mono uppercase tracking-widest text-[#F05323] font-bold">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0A292C] tracking-tight leading-tight">
            A simple path to a better-running business.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal">
            We start with how your business works today, then improve the areas that matter most.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 hover:border-[#F05323]/50 card-hover-shadow transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-black font-mono text-[#F05323]">
                      {step.number}
                    </span>
                    <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-100 text-[#F05323]">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[#0A292C] mb-2 group-hover:text-[#F05323] transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-sm font-bold text-slate-800 mb-3 leading-snug">
                    {step.description}
                  </p>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {step.details}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

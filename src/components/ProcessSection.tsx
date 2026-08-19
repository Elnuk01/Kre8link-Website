import React from 'react';
import { motion } from 'motion/react';
import { Search, Compass, Cpu, TrendingUp } from 'lucide-react';

export const ProcessSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Discover',
      description: 'Understand the business and identify bottlenecks.',
      details: 'We audit your current daily operations, shadow repetitive employee tasks, and map out where hours and revenue are being leaked.',
      icon: Search
    },
    {
      number: '02',
      title: 'Design',
      description: 'Map the process and determine where AI can create value.',
      details: 'We model the ideal automated state, selecting the optimal combination of LLMs, API connectors, and security rules for your business.',
      icon: Compass
    },
    {
      number: '03',
      title: 'Build',
      description: 'Build the AI agents, automations and integrations.',
      details: 'We write clean, production-grade agent scripts, set up database pipelines, and integrate with your existing CRM and communication platforms.',
      icon: Cpu
    },
    {
      number: '04',
      title: 'Improve',
      description: 'Measure performance, refine the system and scale.',
      details: 'We monitor response accuracy, track hours saved, gather staff feedback, and continuously fine-tune prompt models as your business grows.',
      icon: TrendingUp
    }
  ];

  return (
    <section className="py-24 bg-[#F8FAF9] relative border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <p className="text-xs font-mono uppercase tracking-widest text-[#F05323] font-bold">
            Our Implementation Methodology
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0A292C] tracking-tight leading-tight">
            We don't start with AI. We start with the problem.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal">
            A disciplined, four-step engineering process designed to deliver high ROI without breaking existing business operations.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
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

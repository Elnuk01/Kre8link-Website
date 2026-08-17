import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Zap, Sparkles, LineChart, Compass, ArrowRight, CheckCircle2, X } from 'lucide-react';

interface SolutionsProps {
  onOpenScanner: () => void;
  onOpenContact: () => void;
}

export const Solutions: React.FC<SolutionsProps> = ({ onOpenScanner, onOpenContact }) => {
  const [activeModalSolution, setActiveModalSolution] = useState<any | null>(null);

  const solutions = [
    {
      id: 'ai-agents',
      title: 'AI AGENTS',
      tagline: 'Intelligent agents that communicate, reason and take action.',
      icon: Bot,
      examples: [
        'Customer service agents',
        'Sales & lead qualification agents',
        'Voice AI telephone assistants',
        'Internal company knowledge bots',
        'Payment recovery & follow-up agents'
      ],
      ctaText: 'Explore AI Agents →',
      details: 'Kre8Link designs and deploys custom AI agents trained on your business data, operating guidelines, and brand voice. They interface directly with your WhatsApp, phone system, CRM, and databases to take real action rather than just giving generic replies.'
    },
    {
      id: 'business-automation',
      title: 'BUSINESS AUTOMATION',
      tagline: 'Connect your tools and eliminate repetitive manual work.',
      icon: Zap,
      examples: [
        'Lead automation & CRM routing',
        'Multi-app workflow automation',
        'Automated customer notifications',
        'Scheduled management reporting',
        'Cross-platform data synchronization'
      ],
      ctaText: 'Automate a Process →',
      details: 'We build enterprise-grade automation pipelines using n8n, Make, and direct API triggers. Move data between spreadsheets, CRMs, email servers, and accounting software without human double-entry.'
    },
    {
      id: 'customer-experience',
      title: 'AI CUSTOMER EXPERIENCE',
      tagline: 'Make every customer interaction faster and smarter.',
      icon: Sparkles,
      examples: [
        'WhatsApp AI business assistants',
        'Interactive website chat guides',
        'Voice AI call handling',
        'Instant multi-channel support',
        'Real-time lead qualification'
      ],
      ctaText: 'Improve Customer Experience →',
      details: 'Transform customer satisfaction by eliminating wait times. Kre8Link AI Customer Experience systems answer enquiries instantly, collect key information, book meetings, and route complex cases to senior reps.'
    },
    {
      id: 'business-intelligence',
      title: 'BUSINESS INTELLIGENCE',
      tagline: 'Turn your business data into decisions.',
      icon: LineChart,
      examples: [
        'Live executive dashboards',
        'Payment behavior & recovery analysis',
        'Customer retention AI insights',
        'Automated daily/weekly executive digests',
        'Predictive business analytics'
      ],
      ctaText: 'Unlock Your Data →',
      details: 'Stop digging through static spreadsheets. Kre8Link builds automated pipelines that analyze transactional data, customer behavior, and operational trends to deliver plain-English AI summaries directly to leadership.'
    },
    {
      id: 'ai-transformation',
      title: 'AI TRANSFORMATION',
      tagline: 'We examine your business end to end and build high-impact AI systems.',
      icon: Compass,
      examples: [
        'Comprehensive operational audit',
        'Process bottleneck mapping',
        'Custom AI architecture blueprint',
        'Turnkey build & system implementation',
        'Team training & continuous optimization'
      ],
      ctaText: 'Start an AI Transformation →',
      details: 'For ambitious businesses ready for complete digital modernization. We evaluate your entire workflow ecosystem, identify top-ROI opportunities, design custom intelligent architecture, and manage execution from start to finish.'
    }
  ];

  return (
    <section id="solutions" className="py-24 bg-[#F8FAF9] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <p className="text-xs font-mono uppercase tracking-widest text-[#F05323] font-bold">
            Our Transformation Capabilities
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0A292C] tracking-tight leading-tight">
            What can we transform?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal">
            We don't sell generic software off the shelf. We build tailored intelligent systems for your specific business goals.
          </p>
        </div>

        {/* 5 Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((item, idx) => {
            const Icon = item.icon;
            const isFeatured = idx === 4;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`group rounded-3xl p-8 bg-white border border-slate-200/90 hover:border-[#F05323]/50 card-hover-shadow transition-all duration-300 flex flex-col justify-between ${
                  isFeatured ? 'md:col-span-2 lg:col-span-1 border-orange-200/80 bg-gradient-to-b from-white to-orange-50/20' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 rounded-2xl bg-orange-50 border border-orange-100 text-[#F05323]">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono text-slate-400">0{idx + 1}</span>
                  </div>

                  <h3 className="text-xl font-bold text-[#0A292C] mb-2 tracking-wide">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-700 mb-6 font-medium leading-relaxed">
                    "{item.tagline}"
                  </p>

                  <div className="space-y-2 mb-8">
                    <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">Examples:</div>
                    {item.examples.map((ex, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#F05323] shrink-0" />
                        <span>{ex}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalSolution(item)}
                  className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-[#F05323] text-slate-800 hover:text-white text-xs font-semibold flex items-center justify-between transition-all group-hover:shadow-md cursor-pointer"
                >
                  <span>{item.ctaText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {activeModalSolution && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full relative shadow-2xl space-y-6"
            >
              <button
                onClick={() => setActiveModalSolution(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-orange-50 text-[#F05323]">
                  {React.createElement(activeModalSolution.icon, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0A292C]">{activeModalSolution.title}</h3>
                  <p className="text-xs text-[#F05323] font-mono font-semibold">{activeModalSolution.tagline}</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                {activeModalSolution.details}
              </p>

              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400">Key Deliverables:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeModalSolution.examples.map((ex: string, i: number) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F05323]" />
                      {ex}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => {
                    setActiveModalSolution(null);
                    onOpenScanner();
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#F05323] text-white font-semibold text-xs text-center shadow-md hover:bg-[#D94418] cursor-pointer"
                >
                  Find Opportunity in This Area →
                </button>
                <button
                  onClick={() => {
                    setActiveModalSolution(null);
                    onOpenContact();
                  }}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Talk to Architect
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

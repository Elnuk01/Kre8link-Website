import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Clock, Database, BarChart3, Repeat, ArrowUpRight } from 'lucide-react';

interface ProblemSectionProps {
  onOpenScanner: () => void;
}

export const ProblemSection: React.FC<ProblemSectionProps> = ({ onOpenScanner }) => {
  const problems = [
    {
      id: 'enquiries',
      icon: MessageSquare,
      title: 'Too many enquiries',
      problemText: 'Customer enquiries backlog on WhatsApp, email, and web chat causing missed sales opportunities.',
      solutionTitle: 'AI Customer Agents',
      solutionText: 'AI customer agents that respond, qualify and route customers instantly 24/7.'
    },
    {
      id: 'followups',
      icon: Clock,
      title: 'Manual follow-ups',
      problemText: 'Sales leads cold off while salespeople spend hours typing repetitive email and text follow-ups.',
      solutionTitle: 'Automated Lead Nurturing',
      solutionText: 'Automated lead nurturing and customer follow-up sequences synced to calendar.'
    },
    {
      id: 'data',
      icon: Database,
      title: 'Scattered business data',
      problemText: 'Critical metrics locked inside Excel sheets, CRM, invoicing software, and employee heads.',
      solutionTitle: 'Connected Systems',
      solutionText: 'Connected systems that bring your information together seamlessly.'
    },
    {
      id: 'reporting',
      icon: BarChart3,
      title: 'Slow reporting',
      problemText: 'Managers waste hours every week compiling status reports and tracking updates manually.',
      solutionTitle: 'AI Business Intelligence',
      solutionText: 'Automated reporting and AI-powered business intelligence delivered on schedule.'
    },
    {
      id: 'operations',
      icon: Repeat,
      title: 'Repetitive operations',
      problemText: 'Staff copy and paste data across tools, creating human errors and slowing delivery.',
      solutionTitle: 'Intelligent Workflows',
      solutionText: 'AI agents and autonomous workflows that handle repetitive tasks flawlessly.'
    }
  ];

  return (
    <section id="problems" className="py-24 bg-[#F8FAF9] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <p className="text-xs font-mono uppercase tracking-widest text-[#F05323] font-bold">
            Common Bottlenecks
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0A292C] tracking-tight leading-tight">
            Your team shouldn't be doing work AI can handle.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Every business has repetitive work, disconnected systems, slow processes and information trapped inside spreadsheets, inboxes and conversations. We turn those bottlenecks into intelligent workflows.
          </p>
        </div>

        {/* 5 Interactive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((item, idx) => {
            const Icon = item.icon;
            const isWide = idx === 3 || idx === 4;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`group relative p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 hover:border-[#F05323]/50 card-hover-shadow transition-all duration-300 flex flex-col justify-between ${
                  isWide ? 'lg:col-span-1' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 text-[#F05323] group-hover:scale-110 group-hover:bg-[#F05323] group-hover:text-white transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono text-slate-400">0{idx + 1}</span>
                  </div>

                  <h3 className="text-xl font-bold text-[#0A292C] mb-2 group-hover:text-[#F05323] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                    {item.problemText}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="text-xs font-mono text-[#F05323] font-bold mb-1 uppercase tracking-wider">
                    Kre8Link Solution
                  </div>
                  <p className="text-sm text-slate-800 font-semibold leading-snug">
                    {item.solutionText}
                  </p>

                  <div className="mt-4 flex items-center gap-1.5 text-xs text-[#F05323] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Automate this workflow</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA trigger */}
        <div className="mt-12 text-center">
          <button
            onClick={onOpenScanner}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold text-slate-700 hover:text-[#0A292C] bg-white border border-slate-200 hover:border-[#F05323] shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <span>Scan your business for these bottlenecks</span>
            <ArrowUpRight className="w-4 h-4 text-[#F05323]" />
          </button>
        </div>
      </div>
    </section>
  );
};

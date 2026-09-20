import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Clock, Database, BarChart3 } from 'lucide-react';
import { ProblemVisual } from './HomepageVisuals';

interface ProblemSectionProps {
  onOpenScanner: () => void;
}

export const ProblemSection: React.FC<ProblemSectionProps> = ({ onOpenScanner }) => {
  const problems = [
    {
      id: 'enquiries',
      icon: MessageSquare,
      visual: 'manual' as const,
      title: 'Too Much Manual Work',
      problemText: 'Your team spends hours copying data, updating spreadsheets and repeating routine tasks.'
    },
    {
      id: 'followups',
      icon: Clock,
      visual: 'messages' as const,
      title: 'Slow Customer Response',
      problemText: 'Customers wait too long for answers because your team cannot respond to everyone immediately.'
    },
    {
      id: 'data',
      icon: Database,
      visual: 'pipeline' as const,
      title: 'Leads Falling Through the Cracks',
      problemText: 'Enquiries come in, but follow-up is inconsistent or completely manual.'
    },
    {
      id: 'reporting',
      icon: BarChart3,
      visual: 'scattered' as const,
      title: 'Scattered Business Information',
      problemText: 'Your data lives across WhatsApp, spreadsheets, email and different software, making reporting difficult.'
    }
  ];

  return (
    <section id="problems" className="py-24 bg-[#F8FAF9] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0A292C] tracking-tight leading-tight">
            What's Slowing Your Business Down?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Small delays and disconnected tools can quietly cost your business time, sales and visibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 hover:border-[#F05323]/50 card-hover-shadow transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 text-[#F05323] group-hover:scale-110 group-hover:bg-[#F05323] group-hover:text-white transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono text-slate-400">0{idx + 1}</span>
                  </div>

                  <ProblemVisual type={item.visual} />

                  <h3 className="text-xl font-bold text-[#0A292C] mb-2 group-hover:text-[#F05323] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.problemText}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={onOpenScanner}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold text-white bg-[#F05323] hover:bg-[#D94418] shadow-md shadow-[#F05323]/20 transition-all cursor-pointer"
          >
            <span>Check My Business</span>
          </button>
        </div>
      </div>
    </section>
  );
};

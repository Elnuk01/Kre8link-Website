import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, MessageSquare, UserRound, FileSpreadsheet, ClipboardList, Bot, Database, Send, UsersRound } from 'lucide-react';

const beforeSteps = [
  { label: 'Customer enquiry', icon: MessageSquare },
  { label: 'WhatsApp', icon: MessageSquare },
  { label: 'Employee', icon: UserRound },
  { label: 'Spreadsheet', icon: FileSpreadsheet },
  { label: 'Manual follow-up', icon: ClipboardList }
];

const afterSteps = [
  { label: 'Customer enquiry', icon: MessageSquare },
  { label: 'Automatic qualification', icon: Bot },
  { label: 'CRM', icon: Database },
  { label: 'Instant response', icon: Send },
  { label: 'Automated follow-up', icon: ClipboardList },
  { label: 'Sales team', icon: UsersRound }
];

const Workflow = ({ steps, accent }: { steps: typeof beforeSteps; accent: 'slate' | 'orange' }) => (
  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-2">
    {steps.map((step, index) => {
      const Icon = step.icon;
      return (
        <React.Fragment key={step.label}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold ${
              accent === 'orange' ? 'bg-orange-50 border-orange-200 text-[#0A292C]' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <Icon className={`w-4 h-4 ${accent === 'orange' ? 'text-[#F05323]' : 'text-slate-500'}`} />
            {step.label}
          </motion.div>
          {index < steps.length - 1 && <ArrowRight className="w-4 h-4 text-[#F05323] hidden sm:block" />}
        </React.Fragment>
      );
    })}
  </div>
);

export const Transformation: React.FC = () => (
  <section id="transformation" className="py-24 bg-[#F8FAF9] relative overflow-hidden border-t border-slate-200/80">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <p className="text-xs font-mono uppercase tracking-widest text-[#F05323] font-bold">A Clearer Way To Work</p>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0A292C] tracking-tight leading-tight">See the difference better systems make.</h2>
        <p className="text-base sm:text-lg text-slate-600">One connected workflow can turn a slow enquiry process into a faster path to a sale.</p>
      </div>

      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-10">
        <div>
          <div className="flex items-center gap-2 mb-5 text-xs font-mono font-bold uppercase tracking-wider text-slate-500"><span className="w-2 h-2 rounded-full bg-slate-400" /> Before: manual work</div>
          <Workflow steps={beforeSteps} accent="slate" />
        </div>
        <div className="h-px bg-slate-100" />
        <div>
          <div className="flex items-center gap-2 mb-5 text-xs font-mono font-bold uppercase tracking-wider text-teal-700"><CheckCircle2 className="w-4 h-4" /> After Kre8Link: connected work</div>
          <Workflow steps={afterSteps} accent="orange" />
        </div>
      </div>
    </div>
  </section>
);

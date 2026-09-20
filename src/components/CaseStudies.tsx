import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Bot, Check, MessageCircle, PhoneCall, UserRound, Workflow } from 'lucide-react';

type UseCase = {
  id: string;
  title: string;
  description: string;
  label: string;
  visual: 'chat' | 'flow' | 'voice';
};

const useCases: UseCase[] = [
  {
    id: 'customer-service',
    title: 'Respond to Customers Automatically',
    description: 'Answer common questions instantly, capture customer details, and send complex requests to the right person.',
    label: 'Customer Service → Faster responses',
    visual: 'chat'
  },
  {
    id: 'lead-follow-up',
    title: 'Never Lose Track of a Lead',
    description: 'Capture new enquiries, organise them automatically, follow up at the right time, and notify your sales team when someone is ready to buy.',
    label: 'Lead Management → Better follow-up',
    visual: 'flow'
  },
  {
    id: 'voice-agent',
    title: 'Let Your Business Answer the Phone',
    description: 'Handle routine calls, answer common questions, collect customer information and route important conversations to your team.',
    label: 'Voice Automation → Fewer missed calls',
    visual: 'voice'
  }
];

const ChatVisual: React.FC = () => (
  <div className="relative h-44 overflow-hidden rounded-2xl bg-[#EAF5F2] p-5">
    <motion.div
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute right-5 top-5 flex items-center gap-2 rounded-xl rounded-tr-sm bg-white px-3 py-2 text-xs font-medium text-[#0A292C] shadow-sm"
    >
      <MessageCircle className="h-4 w-4 text-[#F05323]" />
      How can I help?
    </motion.div>
    <motion.div
      animate={{ y: [0, 3, 0] }}
      transition={{ duration: 3, repeat: Infinity, delay: 0.5, ease: 'easeInOut' }}
      className="absolute bottom-7 left-5 flex items-center gap-2 rounded-xl rounded-bl-sm bg-[#0A292C] px-3 py-2 text-xs font-medium text-white shadow-sm"
    >
      <Bot className="h-4 w-4 text-[#FF9B78]" />
      Request captured
    </motion.div>
    <div className="absolute bottom-5 right-6 flex gap-1">
      {[0, 1, 2].map((dot) => <span key={dot} className="h-1.5 w-1.5 rounded-full bg-[#F05323]" />)}
    </div>
  </div>
);

const FlowVisual: React.FC = () => (
  <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-2xl bg-[#FFF2EB] px-5">
    <div className="absolute left-6 right-6 top-1/2 h-px bg-[#F05323]/25" />
    <div className="relative z-10 flex w-full items-center justify-between">
      {[
        { icon: UserRound, label: 'New lead' },
        { icon: Workflow, label: 'Follow up' },
        { icon: Check, label: 'Ready' }
      ].map(({ icon: Icon, label }, index) => (
        <React.Fragment key={label}>
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.35, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#F05323]/20 bg-white text-[#F05323] shadow-sm">
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A292C]/65">{label}</span>
          </motion.div>
          {index < 2 && <ArrowRight className="h-4 w-4 text-[#F05323]/70" />}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const VoiceVisual: React.FC = () => (
  <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-2xl bg-[#EAF0F5]">
    <motion.div
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute h-28 w-28 rounded-full border border-[#0A292C]/10"
    />
    <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#0A292C] text-white shadow-lg">
      <PhoneCall className="h-6 w-6" />
    </div>
    <div className="absolute bottom-7 flex h-8 items-center gap-1.5">
      {[10, 20, 30, 16, 26, 38, 22, 12, 25, 16].map((height, index) => (
        <motion.span
          key={index}
          animate={{ height: [height, Math.max(8, height - 8), height] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.08, ease: 'easeInOut' }}
          className="w-1 rounded-full bg-[#F05323]"
        />
      ))}
    </div>
  </div>
);

const visuals = { chat: ChatVisual, flow: FlowVisual, voice: VoiceVisual };

export const CaseStudies: React.FC = () => {
  return (
    <section id="cases" className="py-24 bg-[#F8FAF9] relative border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <p className="text-xs font-mono uppercase tracking-widest text-[#F05323] font-bold">
            PRACTICAL USE CASES
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0A292C] tracking-tight leading-tight">
            See What Smarter Systems Can Do
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal">
            From customer enquiries to lead follow-up and phone calls, we build systems that handle routine work automatically while keeping your team in control.
          </p>
        </div>

        {/* Case Study Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((study, idx) => {
            const Visual = visuals[study.visual];
            return (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group flex flex-col rounded-3xl border border-slate-200/90 bg-white p-5 transition-all duration-300 hover:border-[#F05323]/50 card-hover-shadow sm:p-6"
              >
                <Visual />
                <div className="flex flex-1 flex-col pt-5">
                  <h3 className="mb-3 text-xl font-bold leading-snug text-[#0A292C] transition-colors group-hover:text-[#F05323]">
                    {study.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">{study.description}</p>
                  <div className="mt-auto border-t border-slate-100 pt-5">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0A292C]/65">{study.label}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

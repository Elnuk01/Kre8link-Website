import React from 'react';
import { motion } from 'motion/react';

export const TechnologySection: React.FC = () => {
  const techCloud = [
    { name: 'OpenAI', category: 'LLM & Reasoning' },
    { name: 'Google Gemini', category: 'Multi-modal AI' },
    { name: 'Claude', category: 'Complex Analysis' },
    { name: 'n8n', category: 'Workflow Engine' },
    { name: 'Make', category: 'Integration Bridge' },
    { name: 'Vapi', category: 'Voice AI Engine' },
    { name: 'Twilio', category: 'Telecom API' },
    { name: 'Supabase', category: 'Database & Auth' },
    { name: 'Airtable', category: 'Relational Records' },
    { name: 'REST APIs', category: 'Custom Endpoints' },
    { name: 'HubSpot / CRM', category: 'Sales Pipeline' },
    { name: 'WhatsApp Business', category: 'Messaging Gateway' }
  ];

  return (
    <section className="py-24 bg-[#F8FAF9] relative border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <p className="text-xs font-mono uppercase tracking-widest text-[#F05323] font-bold">
            Technology Ecosystem
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0A292C] tracking-tight leading-tight">
            We build systems, not hype.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal">
            We work across the AI and automation ecosystem to build the right solution for each business.
          </p>
        </div>

        {/* Tech Cloud */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-12">
          {techCloud.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-[#F05323]/50 text-center card-hover-shadow transition-all group hover:scale-[1.02]"
            >
              <div className="text-sm font-bold text-[#0A292C] group-hover:text-[#F05323] transition-colors">
                {tech.name}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                {tech.category}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Central Core Principle Banner */}
        <div className="max-w-2xl mx-auto text-center p-6 rounded-2xl bg-orange-50 border border-orange-200 shadow-sm">
          <p className="text-lg sm:text-xl font-extrabold text-[#0A292C] tracking-tight">
            "The tools change. Your business system stays."
          </p>
          <p className="text-xs text-[#F05323] font-bold mt-1">
            Kre8link builds vendor-agnostic architecture designed for long-term reliability.
          </p>
        </div>
      </div>
    </section>
  );
};

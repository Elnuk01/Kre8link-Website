import React from 'react';
import { motion } from 'motion/react';
import { CreditCard, CalendarCheck, PhoneCall, ArrowUpRight } from 'lucide-react';
import { CaseStudy } from '../types';

export const CaseStudies: React.FC = () => {
  const caseStudies: CaseStudy[] = [
    {
      id: 'payment-recovery',
      title: 'Payment & Recovery Intelligence',
      type: 'Case Study',
      problem: 'Payment behavior was difficult to analyze manually across fragmented invoicing channels, leading to delayed recovery and high administrative overhead.',
      solution: 'AI-assisted payment behavior analysis and automated recovery intelligence system connected directly to billing gateways.',
      technologies: ['Stripe Webhooks', 'Automated Reminder Engine', 'AI Risk Scoring'],
      impactBadge: '100% Automated Reminders'
    },
    {
      id: 'event-registration',
      title: 'Automated Event Registration System',
      type: 'Internal System',
      problem: 'Manual attendee registration, ticket issuance, SMS reminders, and multi-channel communication caused staff bottlenecks before every major company session.',
      solution: 'End-to-end automated registration, QR ticketing, calendar invite dispatches, and WhatsApp reminder workflows.',
      technologies: ['WhatsApp API', 'Google Calendar API', 'n8n Automation'],
      impactBadge: 'Zero Manual Interventions'
    },
    {
      id: 'ai-voice-agent',
      title: 'Conversational AI Voice Agent',
      type: 'Prototype',
      problem: 'High-volume telephone inquiries required dedicated front-desk staff during peak hours, causing long caller hold times and missed bookings after hours.',
      solution: 'AI-powered voice agent capable of handling multi-turn natural customer conversations, answering service FAQs, and booking appointments.',
      technologies: ['Vapi Voice Engine', 'OpenAI Realtime', 'CRM Live Booking'],
      impactBadge: 'Sub-800ms Voice Latency'
    }
  ];

  return (
    <section id="cases" className="py-24 bg-[#F8FAF9] relative border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <p className="text-xs font-mono uppercase tracking-widest text-[#F05323] font-bold">
            Proven Systems
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0A292C] tracking-tight leading-tight">
            AI that solves real business problems.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal">
            We focus on tangible operational bottlenecks rather than theoretical AI demos.
          </p>
        </div>

        {/* Case Study Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {caseStudies.map((study, idx) => {
            return (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-8 rounded-3xl bg-white border border-slate-200/90 hover:border-[#F05323]/50 card-hover-shadow transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-bold uppercase tracking-wider">
                      {study.type}
                    </span>
                    <span className="text-xs font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-bold">
                      {study.impactBadge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#0A292C] mb-4 group-hover:text-[#F05323] transition-colors">
                    {study.title}
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div>
                      <span className="text-[10px] font-mono text-amber-700 font-bold uppercase tracking-wider block mb-1">
                        Problem:
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {study.problem}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-teal-700 font-bold uppercase tracking-wider block mb-1">
                        Solution:
                      </span>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        {study.solution}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                    Technologies Used:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {study.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-mono"
                      >
                        {tech}
                      </span>
                    ))}
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

import React from 'react';
import {
  BarChart3,
  Check,
  Database,
  FileSpreadsheet,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Send,
  Users,
  Workflow,
  X
} from 'lucide-react';

type VisualProps = { className?: string };

const Node: React.FC<{ icon: React.ElementType; label: string; tone?: string }> = ({ icon: Icon, label, tone = 'bg-white text-[#0A292C]' }) => (
  <div className={`flex items-center gap-2 rounded-xl border border-slate-200/80 px-2.5 py-2 text-[10px] font-bold text-[#0A292C] shadow-sm ${tone}`}>
    <Icon className="h-3.5 w-3.5 text-[#F05323]" />
    <span>{label}</span>
  </div>
);

const MotionPulse: React.FC<{ className?: string }> = ({ className = '' }) => <span className={`visual-pulse h-2 w-2 rounded-full bg-[#F05323] ${className}`} />;

export const HeroSystemVisual: React.FC<VisualProps> = ({ className = '' }) => (
  <div className={`relative mx-auto h-[300px] w-full max-w-[520px] ${className}`} aria-hidden="true">
    <div className="absolute inset-5 rounded-[2rem] border border-[#0A292C]/10 bg-white/65 shadow-[0_24px_60px_-30px_rgba(10,41,44,0.35)] backdrop-blur-sm" />
    <div className="absolute inset-x-12 top-1/2 h-px bg-[#F05323]/25" />
    <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-orange-200 bg-orange-50 shadow-lg shadow-orange-900/5">
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <Workflow className="h-7 w-7 text-[#F05323]" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A292C]">Automation</span>
        <span className="font-mono text-[9px] text-slate-400">ACTIVE</span>
      </div>
    </div>
    <div className="absolute left-8 top-10 visual-float"><Node icon={MessageCircle} label="WhatsApp" tone="bg-[#EAF5F2]" /></div>
    <div className="absolute right-8 top-10 visual-float-delay"><Node icon={Mail} label="Email" /></div>
    <div className="absolute bottom-12 left-8 visual-float-delay"><Node icon={Users} label="Customer enquiry" /></div>
    <div className="absolute bottom-12 right-8 visual-float"><Node icon={Database} label="CRM" tone="bg-[#FFF2EB]" /></div>
    <div className="absolute left-1/2 top-7 -translate-x-1/2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-teal-800">
      Reporting ready
    </div>
    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#0A292C] px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-lg">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Connected systems
    </div>
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 520 300" fill="none">
      <path d="M115 63 C180 63 192 105 222 124" stroke="#F05323" strokeOpacity=".35" strokeDasharray="4 5" />
      <path d="M405 63 C340 63 328 105 298 124" stroke="#F05323" strokeOpacity=".35" strokeDasharray="4 5" />
      <path d="M115 244 C180 244 192 195 222 176" stroke="#0A292C" strokeOpacity=".2" strokeDasharray="4 5" />
      <path d="M405 244 C340 244 328 195 298 176" stroke="#0A292C" strokeOpacity=".2" strokeDasharray="4 5" />
    </svg>
  </div>
);

const problemVisuals = {
  manual: (
    <div className="relative h-20 overflow-hidden rounded-xl bg-[#FFF2EB] p-3">
      <div className="space-y-2 rounded-lg bg-white p-2 shadow-sm">
        {[0, 1, 2].map((row) => <div key={row} className="flex gap-1.5"><span className="h-1.5 w-10 rounded-full bg-slate-200" /><span className="h-1.5 flex-1 rounded-full bg-orange-200" /><span className="h-1.5 w-5 rounded-full bg-slate-100" /></div>)}
      </div>
      <MotionPulse className="absolute bottom-2 right-3" />
    </div>
  ),
  messages: (
    <div className="relative h-20 overflow-hidden rounded-xl bg-[#EAF5F2] p-3">
      <div className="absolute right-3 top-3 rounded-lg rounded-tr-sm bg-white px-2 py-1 text-[9px] text-slate-400 shadow-sm">Anyone there?</div>
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-[#0A292C] px-2 py-1 text-[9px] text-white"><MessageCircle className="h-3 w-3 text-[#FF9B78]" /> 3 waiting</div>
    </div>
  ),
  pipeline: (
    <div className="relative flex h-20 items-center justify-center overflow-hidden rounded-xl bg-[#FFF2EB] px-3">
      <div className="flex w-full items-center justify-between"><span className="h-7 w-7 rounded-full border-2 border-[#F05323] bg-white" /><span className="h-px flex-1 bg-[#F05323]/35" /><span className="h-7 w-7 rounded-full border-2 border-[#F05323]/45 bg-white" /><span className="h-px flex-1 bg-[#F05323]/35" /><span className="h-7 w-7 rounded-full border-2 border-slate-200 bg-slate-100" /></div>
      <span className="absolute bottom-2 right-3 flex items-center gap-1 text-[9px] font-bold text-[#F05323]"><X className="h-3 w-3" /> missed</span>
    </div>
  ),
  scattered: (
    <div className="relative flex h-20 items-center justify-center overflow-hidden rounded-xl bg-[#EAF0F5]">
      <div className="flex items-center gap-2"><Node icon={MessageCircle} label="" /><Plus className="h-3 w-3 text-slate-400" /><Node icon={Mail} label="" /><Plus className="h-3 w-3 text-slate-400" /><Node icon={FileSpreadsheet} label="" /><Plus className="h-3 w-3 text-slate-400" /><Node icon={Database} label="" /></div>
    </div>
  )
};

export const ProblemVisual: React.FC<{ type: keyof typeof problemVisuals }> = ({ type }) => problemVisuals[type];

export const SolutionVisual: React.FC<{ type: 'automation' | 'tools' | 'chat' | 'report' }> = ({ type }) => {
  const visuals = {
    automation: <div className="flex items-center justify-center gap-2 rounded-xl bg-[#FFF2EB] py-4"><Workflow className="h-5 w-5 text-[#F05323]" /><span className="h-px w-8 bg-[#F05323]/40" /><Send className="h-5 w-5 text-[#0A292C]" /><span className="h-px w-8 bg-[#F05323]/40" /><Check className="h-5 w-5 text-emerald-600" /></div>,
    tools: <div className="flex items-center justify-center gap-2 rounded-xl bg-[#EAF5F2] py-4"><MessageCircle className="h-5 w-5 text-[#F05323]" /><span className="h-px w-5 bg-[#0A292C]/30" /><Mail className="h-5 w-5 text-[#0A292C]" /><span className="h-px w-5 bg-[#0A292C]/30" /><Database className="h-5 w-5 text-teal-700" /></div>,
    chat: <div className="flex items-center justify-center gap-2 rounded-xl bg-[#FFF2EB] py-4"><div className="rounded-lg bg-white px-2 py-1 text-[9px] text-[#0A292C] shadow-sm">Hello!</div><MessageCircle className="h-5 w-5 text-[#F05323]" /><div className="rounded-lg bg-[#0A292C] px-2 py-1 text-[9px] text-white">Sorted</div></div>,
    report: <div className="flex items-end justify-center gap-1.5 rounded-xl bg-[#EAF0F5] py-3"><span className="h-4 w-2 rounded-t bg-[#F05323]/45" /><span className="h-7 w-2 rounded-t bg-[#F05323]/65" /><span className="h-10 w-2 rounded-t bg-[#F05323]" /><BarChart3 className="ml-2 h-5 w-5 text-[#0A292C]" /></div>
  };
  return <div className="mb-5">{visuals[type]}</div>;
};

export const PhoneVisual: React.FC = () => (
  <div className="flex items-center justify-center gap-4 rounded-xl bg-[#EAF0F5] py-3"><Phone className="h-5 w-5 text-[#0A292C]" /><div className="flex h-7 items-center gap-1">{[10, 20, 14, 26, 12, 22, 16, 9].map((height, index) => <span key={index} className="visual-wave w-1 rounded-full bg-[#F05323]" style={{ height }} />)}</div></div>
);

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Building2,
  Calendar,
  X,
  FileSearch,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  UserCheck,
  MessageSquare,
  Send,
  Phone,
  Mail,
  ArrowRightLeft,
  AlertTriangle,
  FileText,
  UserPlus,
  Save,
  Tag,
  Filter,
  Check,
  RotateCcw,
  TrendingUp,
  Target,
  Percent,
  ChevronRight,
  Plus,
} from 'lucide-react';
import {
  fetchLeads,
  updateLeadStatus,
  updateLeadCrmFields,
  fetchLeadActivities,
  addLeadActivity,
  markFollowUpComplete,
  rescheduleFollowUp,
  updateLeadDealValue,
  fetchAuditResponses,
  formatRelativeTime,
} from '../../lib/adminData';
import { Lead, AuditResponse, LeadActivity } from '../../types';
import { AIOpportunityReportModal } from './AIOpportunityReportModal';

interface AdminLeadsProps {
  onNavigate?: (path: string) => void;
}

const ALLOWED_STATUSES = [
  { value: 'new', label: 'NEW', bg: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'contacted', label: 'CONTACTED', bg: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'qualified', label: 'QUALIFIED', bg: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'proposal', label: 'PROPOSAL', bg: 'bg-orange-100 text-[#F05323] border-orange-300' },
  { value: 'won', label: 'WON', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'lost', label: 'LOST', bg: 'bg-slate-100 text-slate-700 border-slate-300' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  { value: 'medium', label: 'Medium', badge: 'bg-amber-100 text-amber-800 border-amber-300 font-bold' },
  { value: 'high', label: 'High', badge: 'bg-orange-100 text-orange-800 border-orange-300 font-bold' },
  { value: 'urgent', label: 'Urgent', badge: 'bg-rose-100 text-rose-800 border-rose-300 font-bold' },
];

export function getFollowUpInfo(nextFollowUpAt?: string | null) {
  if (!nextFollowUpAt) return null;
  const target = new Date(nextFollowUpAt);
  if (isNaN(target.getTime())) return null;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (target < todayStart) {
    return {
      type: 'overdue',
      label: 'OVERDUE',
      bg: 'bg-rose-100 text-rose-800 border-rose-300',
      dot: 'bg-rose-500',
      formatted: target.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
  } else if (target >= todayStart && target <= todayEnd) {
    return {
      type: 'due_today',
      label: 'DUE TODAY',
      bg: 'bg-amber-100 text-amber-900 border-amber-300',
      dot: 'bg-amber-500',
      formatted: target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  } else {
    return {
      type: 'upcoming',
      label: 'UPCOMING',
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      dot: 'bg-slate-400',
      formatted: target.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
  }
}

export function AdminLeads({ onNavigate }: AdminLeadsProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [audits, setAudits] = useState<AuditResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'pipeline' | 'followups'>('pipeline');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [followUpFilter, setFollowUpFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');

  // Selected Lead & Drawer State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedAuditForModal, setSelectedAuditForModal] = useState<AuditResponse | null>(null);

  // Reschedule Modal State
  const [rescheduleLead, setRescheduleLead] = useState<Lead | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleAction, setRescheduleAction] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Drawer Form state
  const [crmForm, setCrmForm] = useState({
    estimated_value: '',
    priority: 'medium',
    assigned_to: '',
    expected_close_date: '',
    next_follow_up_at: '',
    next_action: '',
  });
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newActivityType, setNewActivityType] = useState<'note' | 'call' | 'email' | 'follow_up'>('note');
  const [isSavingCrm, setIsSavingCrm] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [crmSuccessMsg, setCrmSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const [leadsRes, auditsRes] = await Promise.all([fetchLeads(), fetchAuditResponses()]);
    setLeads(leadsRes.leads);
    setAudits(auditsRes.audits);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync drawer state when selectedLead changes
  useEffect(() => {
    if (selectedLead) {
      let isoFollowUp = '';
      if (selectedLead.next_follow_up_at) {
        try {
          const d = new Date(selectedLead.next_follow_up_at);
          if (!isNaN(d.getTime())) {
            const tzOffset = d.getTimezoneOffset() * 60000;
            const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
            isoFollowUp = localISOTime;
          }
        } catch (e) {
          isoFollowUp = '';
        }
      }

      setCrmForm({
        estimated_value: selectedLead.estimated_value != null ? String(selectedLead.estimated_value) : '',
        priority: selectedLead.priority || 'medium',
        assigned_to: selectedLead.assigned_to || '',
        expected_close_date: selectedLead.expected_close_date || '',
        next_follow_up_at: isoFollowUp,
        next_action: selectedLead.next_action || '',
      });

      if (selectedLead.id) {
        setIsLoadingActivities(true);
        fetchLeadActivities(selectedLead.id).then((res) => {
          setActivities(res.activities);
          setIsLoadingActivities(false);
        });
      }
    } else {
      setActivities([]);
      setCrmSuccessMsg(null);
    }
  }, [selectedLead?.id]);

  // Derived Assigned Reps list
  const assignedReps = Array.from(
    new Set(leads.map((l) => l.assigned_to).filter((a): a is string => Boolean(a && a.trim())))
  );

  // Dynamic Pipeline Metric Calculations
  const stageStats = ALLOWED_STATUSES.map((s) => {
    const stageLeads = leads.filter((l) => (l.status || 'new').toLowerCase() === s.value);
    const count = stageLeads.length;
    const value = stageLeads.reduce((acc, l) => acc + (l.estimated_value != null ? Number(l.estimated_value) : 0), 0);
    return { ...s, count, value };
  });

  const totalPipelineValue = stageStats
    .filter((s) => ['new', 'contacted', 'qualified', 'proposal'].includes(s.value))
    .reduce((acc, s) => acc + s.value, 0);

  const wonRevenue = stageStats.find((s) => s.value === 'won')?.value || 0;
  const wonCount = stageStats.find((s) => s.value === 'won')?.count || 0;

  const totalOpenOpportunities = stageStats
    .filter((s) => ['new', 'contacted', 'qualified', 'proposal'].includes(s.value))
    .reduce((acc, s) => acc + s.count, 0);

  const overallConversionRate = leads.length > 0 ? (wonCount / leads.length) * 100 : 0;

  // Filtered Leads logic
  const filteredLeads = leads.filter((lead) => {
    const term = searchTerm.toLowerCase();
    const company = lead.business?.company_name || '';
    const assigned = lead.assigned_to || '';
    const action = lead.next_action || '';
    const matchesSearch =
      lead.name.toLowerCase().includes(term) ||
      lead.email.toLowerCase().includes(term) ||
      (lead.phone && lead.phone.toLowerCase().includes(term)) ||
      company.toLowerCase().includes(term) ||
      (lead.source && lead.source.toLowerCase().includes(term)) ||
      assigned.toLowerCase().includes(term) ||
      action.toLowerCase().includes(term);

    const leadStatus = (lead.status || 'new').toLowerCase();
    const matchesStatus = statusFilter === 'all' || leadStatus === statusFilter.toLowerCase();

    const leadPriority = (lead.priority || 'medium').toLowerCase();
    const matchesPriority = priorityFilter === 'all' || leadPriority === priorityFilter.toLowerCase();

    const matchesAssigned = assignedFilter === 'all' || assigned.toLowerCase() === assignedFilter.toLowerCase();

    const followInfo = getFollowUpInfo(lead.next_follow_up_at);
    let matchesFollowUp = true;
    if (followUpFilter === 'overdue') {
      matchesFollowUp = followInfo?.type === 'overdue';
    } else if (followUpFilter === 'due_today') {
      matchesFollowUp = followInfo?.type === 'due_today';
    } else if (followUpFilter === 'upcoming') {
      matchesFollowUp = followInfo?.type === 'upcoming';
    } else if (followUpFilter === 'none') {
      matchesFollowUp = !lead.next_follow_up_at;
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesAssigned && matchesFollowUp;
  });

  // Follow-up Groups for Follow-ups Tab
  const overdueList = leads.filter((l) => getFollowUpInfo(l.next_follow_up_at)?.type === 'overdue');
  const dueTodayList = leads.filter((l) => getFollowUpInfo(l.next_follow_up_at)?.type === 'due_today');
  const upcomingList = leads.filter((l) => getFollowUpInfo(l.next_follow_up_at)?.type === 'upcoming');

  // Actions
  const handleStatusChange = async (leadId: string, newStatus: string) => {
    const currentLead = leads.find((l) => l.id === leadId);
    const oldStatus = currentLead?.status || 'new';

    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    const res = await updateLeadStatus(leadId, newStatus, oldStatus);
    if (!res.success) {
      setStatusMessage(`Status update error: ${res.error || 'Failed to update'}`);
    } else {
      setStatusMessage(`Lead status updated to ${newStatus.toUpperCase()}`);
      setTimeout(() => setStatusMessage(null), 3000);

      if (selectedLead && selectedLead.id === leadId) {
        const actRes = await fetchLeadActivities(leadId);
        setActivities(actRes.activities);
      }
    }
  };

  const handleMarkComplete = async (lead: Lead) => {
    if (!lead.id) return;
    setStatusMessage(null);

    // Optimistic UI
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, next_follow_up_at: null } : l))
    );
    if (selectedLead && selectedLead.id === lead.id) {
      setSelectedLead((prev) => (prev ? { ...prev, next_follow_up_at: null } : null));
    }

    const res = await markFollowUpComplete(lead.id, lead.next_action);
    if (res.success) {
      setStatusMessage(`Follow-up marked complete for ${lead.name}`);
      setTimeout(() => setStatusMessage(null), 3000);

      if (selectedLead && selectedLead.id === lead.id) {
        const actRes = await fetchLeadActivities(lead.id);
        setActivities(actRes.activities);
      }
    } else {
      setStatusMessage(`Error marking complete: ${res.error || 'Failed'}`);
    }
  };

  const handleOpenRescheduleModal = (lead: Lead) => {
    setRescheduleLead(lead);
    let defaultIso = '';
    if (lead.next_follow_up_at) {
      try {
        const d = new Date(lead.next_follow_up_at);
        if (!isNaN(d.getTime())) {
          const tzOffset = d.getTimezoneOffset() * 60000;
          defaultIso = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
        }
      } catch (e) {
        defaultIso = '';
      }
    }
    setRescheduleDate(defaultIso);
    setRescheduleAction(lead.next_action || '');
  };

  const handleSaveReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleLead?.id || !rescheduleDate) return;

    setIsRescheduling(true);
    const isoString = new Date(rescheduleDate).toISOString();

    const res = await rescheduleFollowUp(rescheduleLead.id, isoString, rescheduleAction);
    if (res.success) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === rescheduleLead.id
            ? { ...l, next_follow_up_at: isoString, next_action: rescheduleAction }
            : l
        )
      );
      if (selectedLead && selectedLead.id === rescheduleLead.id) {
        setSelectedLead((prev) =>
          prev ? { ...prev, next_follow_up_at: isoString, next_action: rescheduleAction } : null
        );
        const actRes = await fetchLeadActivities(rescheduleLead.id);
        setActivities(actRes.activities);
      }

      setStatusMessage(`Rescheduled follow-up for ${rescheduleLead.name}`);
      setTimeout(() => setStatusMessage(null), 3000);
      setRescheduleLead(null);
    } else {
      setStatusMessage(`Failed to reschedule: ${res.error || 'Error'}`);
    }
    setIsRescheduling(false);
  };

  // Quick Action Email / Call
  const handleQuickEmail = async (lead: Lead) => {
    if (!lead.email) return;
    window.location.href = `mailto:${lead.email}`;

    if (lead.id) {
      await addLeadActivity(lead.id, 'email', `Initiated email communication to ${lead.email}`);
      if (selectedLead && selectedLead.id === lead.id) {
        const actRes = await fetchLeadActivities(lead.id);
        setActivities(actRes.activities);
      }
    }
  };

  const handleQuickCall = async (lead: Lead) => {
    if (lead.phone) {
      window.location.href = `tel:${lead.phone}`;
    }

    if (lead.id) {
      const target = lead.phone ? lead.phone : lead.name;
      await addLeadActivity(lead.id, 'call', `Initiated phone call attempt to ${target}`);
      if (selectedLead && selectedLead.id === lead.id) {
        const actRes = await fetchLeadActivities(lead.id);
        setActivities(actRes.activities);
      }
    }
  };

  // Save CRM fields form
  const handleSaveCrm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead?.id) return;

    setIsSavingCrm(true);
    setCrmSuccessMsg(null);

    const numVal = crmForm.estimated_value !== '' ? Number(crmForm.estimated_value) : null;
    let followUpIso: string | null = null;
    if (crmForm.next_follow_up_at) {
      followUpIso = new Date(crmForm.next_follow_up_at).toISOString();
    }

    const payload = {
      estimated_value: numVal,
      priority: crmForm.priority,
      assigned_to: crmForm.assigned_to.trim() || null,
      expected_close_date: crmForm.expected_close_date || null,
      next_follow_up_at: followUpIso,
      next_action: crmForm.next_action.trim() || null,
    };

    const res = await updateLeadCrmFields(selectedLead.id, payload);

    if (res.success) {
      const updatedLead: Lead = { ...selectedLead, ...payload };
      setSelectedLead(updatedLead);
      setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? updatedLead : l)));

      if (crmForm.next_action && crmForm.next_action !== selectedLead.next_action) {
        await addLeadActivity(
          selectedLead.id,
          'follow_up',
          `Next Action updated: "${crmForm.next_action}"`
        );
      }

      if (numVal !== selectedLead.estimated_value) {
        await addLeadActivity(
          selectedLead.id,
          'deal_value_change',
          `Deal value updated to $${(numVal ?? 0).toLocaleString()}`
        );
      }

      const actRes = await fetchLeadActivities(selectedLead.id);
      setActivities(actRes.activities);

      setCrmSuccessMsg('CRM fields saved successfully.');
      setTimeout(() => setCrmSuccessMsg(null), 3000);
    } else {
      setStatusMessage(`Error saving CRM fields: ${res.error || 'Failed'}`);
    }

    setIsSavingCrm(false);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead?.id || !newNote.trim()) return;

    setIsAddingNote(true);
    const text = newNote.trim();

    const res = await addLeadActivity(selectedLead.id, newActivityType, text);
    if (res.success && res.activity) {
      setActivities((prev) => [res.activity!, ...prev]);
      setNewNote('');
    } else {
      setStatusMessage(`Failed to add note: ${res.error || 'Unknown error'}`);
    }
    setIsAddingNote(false);
  };

  const getAssociatedAudit = (lead: Lead): AuditResponse | undefined => {
    if (!lead.business_id) return undefined;
    return audits.find((a) => a.business_id === lead.business_id);
  };

  const getBadgeStyle = (statusVal?: string) => {
    const match = ALLOWED_STATUSES.find((s) => s.value === (statusVal || 'new').toLowerCase());
    return match ? match.bg : 'bg-blue-100 text-blue-800 border-blue-300';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />;
      case 'deal_value_change':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-600" />;
      case 'call':
        return <Phone className="w-3.5 h-3.5 text-teal-600" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-indigo-600" />;
      case 'follow_up':
        return <Calendar className="w-3.5 h-3.5 text-orange-600" />;
      case 'created':
        return <UserPlus className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setFollowUpFilter('all');
    setAssignedFilter('all');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Banner & Nav Tabs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#F05323]/10 text-[#F05323] rounded-xl border border-[#F05323]/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0A292C]">Sales CRM & Operating System</h2>
              <p className="text-xs text-slate-500">
                Real-time pipeline tracking, deals management, task follow-ups, and activity history
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('pipeline')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'pipeline'
                    ? 'bg-white text-[#0A292C] shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#F05323]" />
                <span>Pipeline & Leads</span>
              </button>
              <button
                onClick={() => setActiveTab('followups')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 relative ${
                  activeTab === 'followups'
                    ? 'bg-white text-[#0A292C] shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                <span>Follow-ups</span>
                {overdueList.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-mono font-bold">
                    {overdueList.length}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Refresh Sales Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Summary Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
              Total Pipeline Value
            </span>
            <span className="text-base font-extrabold text-[#0A292C] font-mono">
              ${totalPipelineValue.toLocaleString()}
            </span>
          </div>

          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/80">
            <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">
              Won Revenue
            </span>
            <span className="text-base font-extrabold text-emerald-900 font-mono">
              ${wonRevenue.toLocaleString()}
            </span>
          </div>

          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/80">
            <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">
              Open Opportunities
            </span>
            <span className="text-base font-extrabold text-amber-900 font-mono">
              {totalOpenOpportunities}
            </span>
          </div>

          <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-200/80">
            <span className="text-[10px] font-mono font-bold text-purple-800 uppercase block">
              Overall Conversion Rate
            </span>
            <span className="text-base font-extrabold text-purple-900 font-mono">
              {overallConversionRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs font-medium flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{statusMessage}</span>
          </span>
          <button onClick={() => setStatusMessage(null)} className="text-teal-600 hover:text-teal-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PIPELINE & ALL LEADS TAB */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          {/* Interactive Pipeline Stage Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                Sales Pipeline Stages (Click stage to filter table)
              </span>
              {statusFilter !== 'all' && (
                <button
                  onClick={() => setStatusFilter('all')}
                  className="text-[11px] font-bold text-[#F05323] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Show All Stages
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {stageStats.map((st) => {
                const isActive = statusFilter.toLowerCase() === st.value;
                return (
                  <div
                    key={st.value}
                    onClick={() => setStatusFilter(isActive ? 'all' : st.value)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'ring-2 ring-[#F05323] bg-orange-50/50 border-orange-300 shadow-sm'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-600">
                        {st.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${st.bg}`}>
                        {st.count}
                      </span>
                    </div>
                    <span className="text-base font-extrabold font-mono text-[#0A292C] block">
                      ${st.value.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Search & Multi-Filter Control Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search lead name, email, phone, company, next action, assigned rep..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F05323]"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F05323] cursor-pointer"
              >
                <option value="all">All Statuses</option>
                {ALLOWED_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    Stage: {s.label}
                  </option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F05323] cursor-pointer"
              >
                <option value="all">All Priorities</option>
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    Priority: {p.label}
                  </option>
                ))}
              </select>

              {/* Follow-up State Filter */}
              <select
                value={followUpFilter}
                onChange={(e) => setFollowUpFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F05323] cursor-pointer"
              >
                <option value="all">All Follow-up States</option>
                <option value="overdue">Overdue Tasks</option>
                <option value="due_today">Due Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="none">No Follow-up Scheduled</option>
              </select>

              {/* Assigned Rep Filter */}
              {assignedReps.length > 0 && (
                <select
                  value={assignedFilter}
                  onChange={(e) => setAssignedFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F05323] cursor-pointer"
                >
                  <option value="all">All Reps</option>
                  {assignedReps.map((rep, idx) => (
                    <option key={`rep-${rep}-${idx}`} value={rep}>
                      Rep: {rep}
                    </option>
                  ))}
                </select>
              )}

              {(searchTerm ||
                statusFilter !== 'all' ||
                priorityFilter !== 'all' ||
                followUpFilter !== 'all' ||
                assignedFilter !== 'all') && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Leads Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-6 h-6 border-2 border-[#F05323] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-500">Loading sales leads...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700">No leads match criteria</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting search or filter dropdowns above.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-3 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-mono font-bold text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Name / Lead</th>
                      <th className="py-3.5 px-4">Company</th>
                      <th className="py-3.5 px-4">Deal Value</th>
                      <th className="py-3.5 px-4">Next Follow-up</th>
                      <th className="py-3.5 px-4">Source</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {filteredLeads.map((lead, idx) => {
                      const currentStat = lead.status || 'new';
                      const followInfo = getFollowUpInfo(lead.next_follow_up_at);
                      const prioOption = PRIORITY_OPTIONS.find((p) => p.value === (lead.priority || 'medium'));

                      return (
                        <tr
                          key={lead.id ? `lead-${lead.id}` : `lead-idx-${idx}`}
                          className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        >
                          <td
                            onClick={() => setSelectedLead(lead)}
                            className="py-3.5 px-4 font-bold text-[#0A292C] group-hover:text-[#F05323]"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span>{lead.name}</span>
                              <span className="text-[10px] font-mono font-normal text-slate-500">
                                {lead.email}
                              </span>
                              {lead.priority && lead.priority !== 'medium' && (
                                <span className="mt-1">
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider ${prioOption?.badge}`}>
                                    {prioOption?.label}
                                  </span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td onClick={() => setSelectedLead(lead)} className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-semibold">{lead.business?.company_name || '—'}</span>
                              {lead.assigned_to && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Assigned: {lead.assigned_to}
                                </span>
                              )}
                            </div>
                          </td>
                          <td onClick={() => setSelectedLead(lead)} className="py-3.5 px-4 font-mono font-bold text-teal-900">
                            {lead.estimated_value != null ? `$${lead.estimated_value.toLocaleString()}` : '—'}
                          </td>
                          <td onClick={() => setSelectedLead(lead)} className="py-3.5 px-4">
                            {followInfo ? (
                              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono border font-semibold ${followInfo.bg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${followInfo.dot}`} />
                                <span>{followInfo.label}: {followInfo.formatted}</span>
                              </span>
                            ) : lead.next_action ? (
                              <span className="text-[11px] text-slate-600 truncate max-w-[140px] block" title={lead.next_action}>
                                {lead.next_action}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-mono text-[11px]">None</span>
                            )}
                          </td>
                          <td onClick={() => setSelectedLead(lead)} className="py-3.5 px-4 text-slate-500">
                            {lead.source}
                          </td>
                          <td onClick={() => setSelectedLead(lead)} className="py-3.5 px-4 text-slate-400 font-mono">
                            {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={currentStat}
                              onChange={(e) => handleStatusChange(lead.id!, e.target.value)}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border cursor-pointer focus:outline-none ${getBadgeStyle(
                                currentStat
                              )}`}
                            >
                              {ALLOWED_STATUSES.map((s) => (
                                <option key={s.value} value={s.value} className="bg-white text-slate-800">
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {lead.next_follow_up_at && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkComplete(lead);
                                  }}
                                  className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                                  title="Mark Follow-up Complete"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedLead(lead)}
                                className="px-2.5 py-1.5 text-[11px] font-semibold text-[#F05323] hover:bg-orange-50 border border-orange-200 rounded-lg transition-colors cursor-pointer"
                              >
                                Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOLLOW-UPS WORKSPACE TAB */}
      {activeTab === 'followups' && (
        <div className="space-y-6">
          {/* Overdue Follow-ups Section */}
          <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <h3 className="text-sm font-extrabold text-rose-900 uppercase font-mono tracking-wider">
                  OVERDUE FOLLOW-UPS ({overdueList.length})
                </h3>
              </div>
              <span className="text-xs text-rose-700 font-mono">Action required immediately</span>
            </div>

            {overdueList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 font-mono bg-rose-50/40 rounded-xl border border-dashed border-rose-100">
                No overdue follow-up tasks! You are completely caught up.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {overdueList.map((lead, idx) => (
                  <FollowUpCard
                    key={lead.id ? `overdue-${lead.id}` : `overdue-idx-${idx}`}
                    lead={lead}
                    onOpenLead={() => setSelectedLead(lead)}
                    onMarkComplete={() => handleMarkComplete(lead)}
                    onReschedule={() => handleOpenRescheduleModal(lead)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Due Today Follow-ups Section */}
          <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="text-sm font-extrabold text-amber-900 uppercase font-mono tracking-wider">
                  DUE TODAY ({dueTodayList.length})
                </h3>
              </div>
              <span className="text-xs text-amber-700 font-mono">Scheduled for today</span>
            </div>

            {dueTodayList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 font-mono bg-amber-50/40 rounded-xl border border-dashed border-amber-100">
                No follow-ups scheduled for today.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dueTodayList.map((lead, idx) => (
                  <FollowUpCard
                    key={lead.id ? `duetoday-${lead.id}` : `duetoday-idx-${idx}`}
                    lead={lead}
                    onOpenLead={() => setSelectedLead(lead)}
                    onMarkComplete={() => handleMarkComplete(lead)}
                    onReschedule={() => handleOpenRescheduleModal(lead)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Follow-ups Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="text-sm font-extrabold text-slate-800 uppercase font-mono tracking-wider">
                  UPCOMING FOLLOW-UPS ({upcomingList.length})
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">Scheduled for future dates</span>
            </div>

            {upcomingList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 font-mono bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No upcoming follow-ups scheduled.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingList.map((lead, idx) => (
                  <FollowUpCard
                    key={lead.id ? `upcoming-${lead.id}` : `upcoming-idx-${idx}`}
                    lead={lead}
                    onOpenLead={() => setSelectedLead(lead)}
                    onMarkComplete={() => handleMarkComplete(lead)}
                    onReschedule={() => handleOpenRescheduleModal(lead)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LEAD DETAILS & QUICK ACTIONS DRAWER */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex justify-end">
          <div className="bg-white text-slate-900 w-full max-w-2xl h-full shadow-2xl flex flex-col animate-slideLeft overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-6 bg-[#0A292C] text-white flex items-center justify-between sticky top-0 z-10 border-b border-teal-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#F05323] rounded-xl text-white shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{selectedLead.name}</h3>
                    <select
                      value={selectedLead.status || 'new'}
                      onChange={(e) => handleStatusChange(selectedLead.id!, e.target.value)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border cursor-pointer ${getBadgeStyle(
                        selectedLead.status
                      )}`}
                    >
                      {ALLOWED_STATUSES.map((s) => (
                        <option key={s.value} value={s.value} className="bg-white text-slate-800">
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-xs font-mono text-teal-300">
                    Lead ID: {selectedLead.id?.slice(0, 8)}... | {selectedLead.source}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-teal-900/50 cursor-pointer transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1 bg-slate-50/50">
              {crmSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{crmSuccessMsg}</span>
                </div>
              )}

              {/* SALES QUICK ACTIONS TOOLBAR */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block tracking-wider">
                  Sales Quick Actions
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    onClick={() => handleQuickEmail(selectedLead)}
                    className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <span>Email Lead</span>
                  </button>

                  <button
                    onClick={() => handleQuickCall(selectedLead)}
                    className="p-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-4 h-4 text-teal-600" />
                    <span>Call Lead</span>
                  </button>

                  {selectedLead.next_follow_up_at ? (
                    <button
                      onClick={() => handleMarkComplete(selectedLead)}
                      className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Complete Task</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenRescheduleModal(selectedLead)}
                      className="p-2.5 bg-orange-50 hover:bg-orange-100 text-[#F05323] border border-orange-200 font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Schedule Task</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenRescheduleModal(selectedLead)}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>Reschedule</span>
                  </button>
                </div>
              </div>

              {/* Follow-up Active Banner */}
              {(() => {
                const info = getFollowUpInfo(selectedLead.next_follow_up_at);
                if (!info) return null;
                return (
                  <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between ${info.bg}`}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 shrink-0" />
                      <div>
                        <span className="font-bold uppercase font-mono mr-2">{info.label}:</span>
                        <span>Scheduled for {info.formatted}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMarkComplete(selectedLead)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-50 text-emerald-800 font-bold border border-emerald-300 rounded-md text-[10px] cursor-pointer"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() => handleOpenRescheduleModal(selectedLead)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-300 rounded-md text-[10px] cursor-pointer"
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Contact Information Box */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-[#0A292C] uppercase tracking-wider font-mono flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#F05323]" />
                  Contact Details
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Email</span>
                    <a href={`mailto:${selectedLead.email}`} className="font-semibold text-[#F05323] hover:underline">
                      {selectedLead.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Phone</span>
                    {selectedLead.phone ? (
                      <a href={`tel:${selectedLead.phone}`} className="font-semibold text-teal-800 hover:underline">
                        {selectedLead.phone}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Not provided</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Captured Date</span>
                    <span className="font-medium text-slate-800">
                      {selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SALES INFORMATION (CRM FIELDS FORM) */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-bold text-[#0A292C] uppercase tracking-wider font-mono flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Sales Pipeline Information
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">Editable CRM Fields</span>
                </div>

                <form onSubmit={handleSaveCrm} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Estimated Deal Value */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">
                        Estimated Deal Value ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          step="any"
                          value={crmForm.estimated_value}
                          onChange={(e) => setCrmForm({ ...crmForm, estimated_value: e.target.value })}
                          placeholder="e.g. 5000"
                          className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F05323]"
                        />
                      </div>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">
                        Deal Priority
                      </label>
                      <select
                        value={crmForm.priority}
                        onChange={(e) => setCrmForm({ ...crmForm, priority: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F05323] cursor-pointer"
                      >
                        {PRIORITY_OPTIONS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label} Priority
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Assigned To */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">
                        Assigned Rep
                      </label>
                      <input
                        type="text"
                        value={crmForm.assigned_to}
                        onChange={(e) => setCrmForm({ ...crmForm, assigned_to: e.target.value })}
                        placeholder="e.g. Sales Rep / Agent Email"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F05323]"
                      />
                    </div>

                    {/* Expected Close Date */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">
                        Expected Close Date
                      </label>
                      <input
                        type="date"
                        value={crmForm.expected_close_date}
                        onChange={(e) => setCrmForm({ ...crmForm, expected_close_date: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F05323]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Next Follow-up Date/Time */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">
                        Next Follow-up Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={crmForm.next_follow_up_at}
                        onChange={(e) => setCrmForm({ ...crmForm, next_follow_up_at: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F05323]"
                      />
                    </div>

                    {/* Next Action */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">
                        Next Planned Action
                      </label>
                      <input
                        type="text"
                        value={crmForm.next_action}
                        onChange={(e) => setCrmForm({ ...crmForm, next_action: e.target.value })}
                        placeholder="e.g. Send proposal & schedule demo call"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F05323]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingCrm}
                      className="px-4 py-2 bg-[#0A292C] hover:bg-[#071e20] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingCrm ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 text-[#F05323]" />
                          <span>Save Sales Information</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* SALES NOTES & LOG ACTIVITY FORM */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-[#0A292C] uppercase tracking-wider font-mono flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#F05323]" />
                  Add Sales Note or Log Activity
                </h4>

                <form onSubmit={handleAddNote} className="space-y-3">
                  <textarea
                    rows={2}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Type call notes, email updates, or follow-up details..."
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F05323] focus:bg-white transition-all"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                      {(['note', 'call', 'email', 'follow_up'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewActivityType(type)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-bold cursor-pointer transition-colors ${
                            newActivityType === type
                              ? 'bg-white text-[#0A292C] shadow-xs border border-slate-200'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {type.replace('_', ' ')}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={isAddingNote || !newNote.trim()}
                      className="px-4 py-2 bg-[#F05323] hover:bg-[#d84419] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isAddingNote ? (
                        <span>Logging...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Add Note</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* ACTIVITY TIMELINE */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-[#0A292C] uppercase tracking-wider font-mono flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-700" />
                    Sales Activity Timeline ({activities.length})
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">Chronological History</span>
                </div>

                {isLoadingActivities ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    <div className="w-5 h-5 border-2 border-[#F05323] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading activity timeline...
                  </div>
                ) : activities.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 font-mono">
                    No activity logs recorded yet. Add a note or update status above to start tracking.
                  </div>
                ) : (
                  <div className="relative pl-4 border-l-2 border-slate-200 space-y-4">
                    {activities.map((act, index) => (
                      <div key={act.id ? `act-${act.id}` : `act-idx-${index}`} className="relative group">
                        <div className="absolute -left-[25px] top-0 p-1 bg-white border border-slate-300 rounded-full shadow-xs">
                          {getActivityIcon(act.activity_type)}
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 bg-slate-200/80 rounded text-[9px]">
                                {act.activity_type.replace('_', ' ')}
                              </span>
                              {act.created_by && <span>by {act.created_by}</span>}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {formatRelativeTime(act.created_at)}
                            </span>
                          </div>

                          <p className="text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                            {act.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ASSOCIATED BUSINESS & AUDIT INFO */}
              {selectedLead.business ? (
                <div className="space-y-4">
                  <div className="bg-teal-50/60 rounded-xl p-4 border border-teal-200/80 space-y-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-teal-700" />
                      <h4 className="text-xs font-bold text-[#0A292C] uppercase tracking-wider font-mono">
                        Associated Business
                      </h4>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-[#0A292C] text-sm block">
                          {selectedLead.business.company_name}
                        </span>
                        <p className="text-slate-600 mt-1 leading-relaxed">
                          {selectedLead.business.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {selectedLead.business.industry && (
                          <span className="px-2.5 py-1 bg-white rounded-md border border-teal-200 text-teal-800 text-[10px] font-mono font-semibold">
                            Industry: {selectedLead.business.industry}
                          </span>
                        )}
                        {selectedLead.business.company_size && (
                          <span className="px-2.5 py-1 bg-white rounded-md border border-teal-200 text-teal-800 text-[10px] font-mono font-semibold">
                            Size: {selectedLead.business.company_size}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Associated Audit Details */}
                  {(() => {
                    const audit = getAssociatedAudit(selectedLead);
                    if (!audit) return null;

                    return (
                      <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-[#0A292C] uppercase tracking-wider font-mono flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#F05323]" />
                            Primary Business Goal
                          </h4>
                        </div>
                        <p className="text-xs font-bold text-teal-900 bg-teal-50 p-2.5 rounded-lg border border-teal-100">
                          {audit.primary_goal || 'Process Automation & Efficiency'}
                        </p>

                        {audit.opportunities && audit.opportunities.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                              Identified AI Opportunities ({audit.opportunities.length})
                            </span>
                            <div className="space-y-2">
                              {audit.opportunities.slice(0, 3).map((opp, idx) => (
                                <div key={opp.id ? `audit-opp-${opp.id}` : `audit-opp-idx-${idx}`} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-[#0A292C]">{opp.title}</span>
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                                      {opp.impact} IMPACT
                                    </span>
                                  </div>
                                  <p className="text-slate-600 text-[11px] line-clamp-2">{opp.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-3">
                          <button
                            onClick={() => setSelectedAuditForModal(audit)}
                            className="w-full py-2.5 bg-[#F05323] hover:bg-[#d84419] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <FileSearch className="w-4 h-4" />
                            <span>View Full AI Audit Report</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 text-center">
                  No linked business overview record for this lead.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RESchedule MODAL */}
      {rescheduleLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleIn border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#F05323]" />
                <h3 className="text-sm font-bold text-[#0A292C]">Reschedule Follow-up</h3>
              </div>
              <button
                onClick={() => setRescheduleLead(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Pick a new date/time for <span className="font-bold text-[#0A292C]">{rescheduleLead.name}</span>.
            </p>

            <form onSubmit={handleSaveReschedule} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">
                  Next Follow-up Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F05323]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">
                  Next Planned Action
                </label>
                <input
                  type="text"
                  value={rescheduleAction}
                  onChange={(e) => setRescheduleAction(e.target.value)}
                  placeholder="e.g. Call to discuss contract details"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F05323]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleLead(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRescheduling || !rescheduleDate}
                  className="px-4 py-2 bg-[#F05323] hover:bg-[#d84419] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isRescheduling ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm Reschedule</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Opportunity Report Modal */}
      {selectedAuditForModal && (
        <AIOpportunityReportModal
          audit={selectedAuditForModal}
          onClose={() => setSelectedAuditForModal(null)}
        />
      )}
    </div>
  );
}

// Follow-Up Card Component
interface FollowUpCardProps {
  key?: React.Key;
  lead: Lead;
  onOpenLead: () => void;
  onMarkComplete: () => void;
  onReschedule: () => void;
}

function FollowUpCard({ lead, onOpenLead, onMarkComplete, onReschedule }: FollowUpCardProps) {
  const info = getFollowUpInfo(lead.next_follow_up_at);
  const prioOption = PRIORITY_OPTIONS.find((p) => p.value === (lead.priority || 'medium'));

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-3">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4
              onClick={onOpenLead}
              className="font-bold text-[#0A292C] text-sm hover:text-[#F05323] transition-colors cursor-pointer"
            >
              {lead.name}
            </h4>
            <p className="text-xs text-slate-500 font-semibold">{lead.business?.company_name || '—'}</p>
          </div>

          <span
            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
              ALLOWED_STATUSES.find((s) => s.value === (lead.status || 'new').toLowerCase())?.bg ||
              'bg-blue-100 text-blue-800'
            }`}
          >
            {lead.status || 'new'}
          </span>
        </div>

        {info && (
          <div className={`p-2 rounded-lg border text-[10px] font-mono font-semibold flex items-center gap-1.5 ${info.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`} />
            <span>
              {info.label}: {info.formatted}
            </span>
          </div>
        )}

        {lead.next_action && (
          <p className="text-xs text-slate-700 font-normal italic bg-slate-50 p-2 rounded-lg border border-slate-100">
            "{lead.next_action}"
          </p>
        )}

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
          <span>Value: {lead.estimated_value != null ? `$${lead.estimated_value.toLocaleString()}` : 'Unset'}</span>
          {prioOption && (
            <span className={`px-1.5 py-0.5 rounded uppercase ${prioOption.badge}`}>
              {prioOption.label}
            </span>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 text-xs">
        <button
          onClick={onOpenLead}
          className="text-slate-600 hover:text-[#0A292C] font-semibold text-[11px] cursor-pointer"
        >
          Details
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onReschedule}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-[10px] transition-colors cursor-pointer"
          >
            Reschedule
          </button>
          <button
            onClick={onMarkComplete}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            <span>Complete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

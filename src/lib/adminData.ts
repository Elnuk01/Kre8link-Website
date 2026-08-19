import { supabase, isSupabaseConfigured, isJwtError } from './supabase';
import { Business, Lead, AuditResponse, AIOpportunity, ContactRequest, LeadActivity } from '../types';

// Admin Email configuration
export function getAdminEmail(): string {
  const envEmail =
    (import.meta.env.VITE_ADMIN_EMAIL as string) ||
    (import.meta.env.ADMIN_EMAIL as string) ||
    '';
  return envEmail.trim();
}

export function isAllowedAdminEmail(userEmail?: string | null): boolean {
  if (!userEmail) return false;
  const configuredAdmin = getAdminEmail();
  // If no env variable is set at all, we check if there is an authenticated user.
  // If configuredAdmin IS provided, we strictly enforce case-insensitive equality.
  if (!configuredAdmin) return true;
  return userEmail.trim().toLowerCase() === configuredAdmin.toLowerCase();
}

// ===================================================
// DASHBOARD METRICS & RECENT ACTIVITY
// ===================================================
export interface DashboardMetrics {
  totalBusinesses: number;
  totalAudits: number;
  totalOpportunities: number;
  totalLeads: number;
  totalContactRequests: number;
}

export interface RecentActivityItem {
  id: string;
  type: 'lead' | 'audit' | 'contact';
  title: string;
  subtitle: string;
  timestamp: string;
  rawDate: string;
}

export async function fetchDashboardMetrics(): Promise<{
  metrics: DashboardMetrics;
  recentActivity: RecentActivityItem[];
  error?: string;
}> {
  const defaultMetrics: DashboardMetrics = {
    totalBusinesses: 0,
    totalAudits: 0,
    totalOpportunities: 0,
    totalLeads: 0,
    totalContactRequests: 0,
  };

  if (!isSupabaseConfigured || !supabase) {
    console.warn('[Admin] Supabase client is not configured.');
    return { metrics: defaultMetrics, recentActivity: [], error: 'Database service is not configured.' };
  }

  try {
    // Verify active Supabase Auth session before running authenticated queries
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (!session) {
      return {
        metrics: defaultMetrics,
        recentActivity: [],
        error: 'Authentication session expired or missing. Please sign in to access admin data.',
      };
    }

    // 1. Fetch counts using standard GET queries with exact count
    const executeCounts = async () => {
      return await Promise.all([
        supabase.from('businesses').select('id', { count: 'exact' }),
        supabase.from('audit_responses').select('id', { count: 'exact' }),
        supabase.from('ai_opportunities').select('id', { count: 'exact' }),
        supabase.from('leads').select('id', { count: 'exact' }),
        supabase.from('contact_requests').select('id', { count: 'exact' }),
      ]);
    };

    let [busRes, auditRes, oppRes, leadRes, contactRes] = await executeCounts();

    // If any error is a JWT timing / clock skew issue (e.g. PGRST303 JWT issued at future), refresh session and retry
    const hasJwtIssue =
      isJwtError(busRes.error) ||
      isJwtError(auditRes.error) ||
      isJwtError(oppRes.error) ||
      isJwtError(leadRes.error) ||
      isJwtError(contactRes.error);

    if (hasJwtIssue) {
      console.warn('[Admin] PGRST303 JWT timing issue detected. Synchronizing auth session and retrying...');
      await new Promise((resolve) => setTimeout(resolve, 700));
      try {
        await supabase.auth.refreshSession();
      } catch (err) {
        console.warn('[Admin] Session refresh failed:', err);
      }
      [busRes, auditRes, oppRes, leadRes, contactRes] = await executeCounts();
    }

    // Inspect and log any individual query errors
    const errors: string[] = [];
    if (busRes.error) {
      console.error('[Admin] Query error on table "businesses":', busRes.error.code, busRes.error.message, busRes.error.details);
      errors.push(`businesses (${busRes.error.message || busRes.error.code})`);
    }
    if (auditRes.error) {
      console.error('[Admin] Query error on table "audit_responses":', auditRes.error.code, auditRes.error.message, auditRes.error.details);
      errors.push(`audit_responses (${auditRes.error.message || auditRes.error.code})`);
    }
    if (oppRes.error) {
      console.error('[Admin] Query error on table "ai_opportunities":', oppRes.error.code, oppRes.error.message, oppRes.error.details);
      errors.push(`ai_opportunities (${oppRes.error.message || oppRes.error.code})`);
    }
    if (leadRes.error) {
      console.error('[Admin] Query error on table "leads":', leadRes.error.code, leadRes.error.message, leadRes.error.details);
      errors.push(`leads (${leadRes.error.message || leadRes.error.code})`);
    }
    if (contactRes.error) {
      console.error('[Admin] Query error on table "contact_requests":', contactRes.error.code, contactRes.error.message, contactRes.error.details);
      errors.push(`contact_requests (${contactRes.error.message || contactRes.error.code})`);
    }

    if (errors.length > 0) {
      return {
        metrics: defaultMetrics,
        recentActivity: [],
        error: `Unable to load dashboard metrics. (${errors.join('; ')})`,
      };
    }

    const calcCount = (res: { count: number | null; data: any[] | null }) => {
      const c = res.count ?? 0;
      const d = res.data ? res.data.length : 0;
      return Math.max(c, d);
    };

    const metrics: DashboardMetrics = {
      totalBusinesses: calcCount(busRes),
      totalAudits: calcCount(auditRes),
      totalOpportunities: calcCount(oppRes),
      totalLeads: calcCount(leadRes),
      totalContactRequests: calcCount(contactRes),
    };

    console.log('[fetchDashboardMetrics] Calculated metrics:', metrics);

    // 2. Fetch Recent Items for Activity Stream
    const [recentLeadsRes, recentAuditsRes, recentContactsRes] = await Promise.all([
      supabase.from('leads').select('*, businesses(*)').order('created_at', { ascending: false }).limit(5),
      supabase.from('audit_responses').select('*, businesses(*)').order('created_at', { ascending: false }).limit(5),
      supabase.from('contact_requests').select('*').order('created_at', { ascending: false }).limit(5),
    ]);

    if (recentLeadsRes.error) {
      console.error('[Admin] Recent activity error on leads:', recentLeadsRes.error);
    }
    if (recentAuditsRes.error) {
      console.error('[Admin] Recent activity error on audit_responses:', recentAuditsRes.error);
    }
    if (recentContactsRes.error) {
      console.error('[Admin] Recent activity error on contact_requests:', recentContactsRes.error);
    }

    const recentActivity: RecentActivityItem[] = [];

    if (recentLeadsRes.data) {
      recentLeadsRes.data.forEach((item: any) => {
        const companyName = item.businesses?.company_name || 'Independent Business';
        recentActivity.push({
          id: `lead-${item.id}`,
          type: 'lead',
          title: `New Lead: ${item.name}`,
          subtitle: `${companyName} (${item.email})`,
          timestamp: formatRelativeTime(item.created_at),
          rawDate: item.created_at || new Date().toISOString(),
        });
      });
    }

    if (recentAuditsRes.data) {
      recentAuditsRes.data.forEach((item: any) => {
        const companyName = item.businesses?.company_name || 'Anonymous Audit';
        recentActivity.push({
          id: `audit-${item.id}`,
          type: 'audit',
          title: `New AI Audit: ${companyName}`,
          subtitle: `Goal: ${item.primary_goal || 'Process Automation'}`,
          timestamp: formatRelativeTime(item.created_at),
          rawDate: item.created_at || new Date().toISOString(),
        });
      });
    }

    if (recentContactsRes.data) {
      recentContactsRes.data.forEach((item: any) => {
        recentActivity.push({
          id: `contact-${item.id}`,
          type: 'contact',
          title: `New Contact Request: ${item.name}`,
          subtitle: item.company ? `${item.company} (${item.email})` : item.email,
          timestamp: formatRelativeTime(item.created_at),
          rawDate: item.created_at || new Date().toISOString(),
        });
      });
    }

    // Sort combined activity by rawDate descending
    recentActivity.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());

    return { metrics, recentActivity: recentActivity.slice(0, 10) };
  } catch (err: any) {
    console.error('[Admin] Failed to fetch dashboard metrics:', err);
    return {
      metrics: defaultMetrics,
      recentActivity: [],
      error: 'Unable to load dashboard data. An unexpected error occurred.',
    };
  }
}

// ===================================================
// LEADS DATA FLOW
// ===================================================
export async function fetchLeads(): Promise<{ leads: Lead[]; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { leads: [] };
  }

  try {
    const runQuery = async () => {
      return await supabase
        .from('leads')
        .select('*, businesses(*)')
        .order('created_at', { ascending: false });
    };

    let { data, error } = await runQuery();

    if (error && isJwtError(error)) {
      console.warn('[Admin] JWT error in fetchLeads. Retrying after brief delay...');
      await new Promise((r) => setTimeout(r, 700));
      await supabase.auth.refreshSession().catch(() => {});
      const retry = await runQuery();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;

    const formattedLeads: Lead[] = (data || []).map((row: any) => ({
      id: row.id,
      business_id: row.business_id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      source: row.source || 'AI Opportunity Scanner',
      status: row.status || 'new',
      created_at: row.created_at,
      estimated_value: row.estimated_value != null ? Number(row.estimated_value) : null,
      priority: row.priority || 'medium',
      assigned_to: row.assigned_to || null,
      expected_close_date: row.expected_close_date || null,
      next_follow_up_at: row.next_follow_up_at || null,
      next_action: row.next_action || null,
      business: row.businesses
        ? {
            id: row.businesses.id,
            company_name: row.businesses.company_name,
            description: row.businesses.description,
            industry: row.businesses.industry,
            company_size: row.businesses.company_size,
            created_at: row.businesses.created_at,
          }
        : undefined,
    }));

    return { leads: formattedLeads };
  } catch (err: any) {
    console.error('[Admin] Error fetching leads:', err);
    return { leads: [], error: err.message };
  }
}

export async function updateLeadStatus(
  id: string,
  status: string,
  previousStatus?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { success: true };

  try {
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.warn('[Admin] Lead status update warning:', error);
      return { success: false, error: error.message };
    }

    // Automatically record activity for status change
    const statusDesc = previousStatus
      ? `Status changed from '${previousStatus.toUpperCase()}' to '${status.toUpperCase()}'`
      : `Status set to '${status.toUpperCase()}'`;

    await addLeadActivity(id, 'status_change', statusDesc);

    return { success: true };
  } catch (err: any) {
    console.error('[Admin] Error updating lead status:', err);
    return { success: false, error: err.message };
  }
}

export async function updateLeadCrmFields(
  id: string,
  fields: {
    estimated_value?: number | null;
    priority?: string;
    assigned_to?: string | null;
    expected_close_date?: string | null;
    next_follow_up_at?: string | null;
    next_action?: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { success: true };

  try {
    const { error } = await supabase
      .from('leads')
      .update(fields)
      .eq('id', id);

    if (error) {
      console.warn('[Admin] Lead CRM update warning:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Admin] Error updating lead CRM fields:', err);
    return { success: false, error: err.message };
  }
}

export async function fetchLeadActivities(leadId: string): Promise<{ activities: LeadActivity[]; error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { activities: [] };

  try {
    const { data, error } = await supabase
      .from('lead_activities')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Admin] Error fetching lead activities:', error.message);
      return { activities: [] };
    }

    const activities: LeadActivity[] = (data || []).map((row: any) => ({
      id: row.id,
      lead_id: row.lead_id,
      activity_type: row.activity_type,
      description: row.description,
      created_at: row.created_at,
      created_by: row.created_by,
    }));

    return { activities };
  } catch (err: any) {
    console.warn('[Admin] Failed to fetch lead activities:', err);
    return { activities: [], error: err.message };
  }
}

export async function addLeadActivity(
  leadId: string,
  activityType: string,
  description: string,
  createdBy?: string
): Promise<{ success: boolean; activity?: LeadActivity; error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { success: true };

  try {
    let author = createdBy;
    if (!author) {
      const { data: sessionData } = await supabase.auth.getSession();
      author = sessionData.session?.user?.email || 'Admin';
    }

    const payload = {
      lead_id: leadId,
      activity_type: activityType,
      description,
      created_by: author,
    };

    const { data, error } = await supabase
      .from('lead_activities')
      .insert(payload)
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[Admin] Error inserting lead activity:', error.message);
      return { success: false, error: error.message };
    }

    const activity: LeadActivity = {
      id: data?.id || `temp-${Date.now()}`,
      lead_id: leadId,
      activity_type: activityType,
      description,
      created_at: data?.created_at || new Date().toISOString(),
      created_by: author,
    };

    return { success: true, activity };
  } catch (err: any) {
    console.warn('[Admin] Exception adding lead activity:', err);
    return { success: false, error: err.message };
  }
}

export async function markFollowUpComplete(
  leadId: string,
  currentAction?: string | null
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { success: true };

  try {
    const { error } = await supabase
      .from('leads')
      .update({ next_follow_up_at: null })
      .eq('id', leadId);

    if (error) {
      console.warn('[Admin] Error marking follow-up complete:', error);
      return { success: false, error: error.message };
    }

    const desc = currentAction
      ? `Completed follow-up task: "${currentAction}"`
      : 'Completed scheduled follow-up task';

    await addLeadActivity(leadId, 'follow_up', desc);

    return { success: true };
  } catch (err: any) {
    console.error('[Admin] Exception marking follow-up complete:', err);
    return { success: false, error: err.message };
  }
}

export async function rescheduleFollowUp(
  leadId: string,
  nextFollowUpAt: string,
  nextAction?: string | null
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { success: true };

  try {
    const { error } = await supabase
      .from('leads')
      .update({
        next_follow_up_at: nextFollowUpAt,
        next_action: nextAction !== undefined ? nextAction : null,
      })
      .eq('id', leadId);

    if (error) {
      console.warn('[Admin] Error rescheduling follow-up:', error);
      return { success: false, error: error.message };
    }

    const dateStr = new Date(nextFollowUpAt).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const desc = nextAction
      ? `Rescheduled follow-up to ${dateStr} ("${nextAction}")`
      : `Rescheduled follow-up to ${dateStr}`;

    await addLeadActivity(leadId, 'follow_up', desc);

    return { success: true };
  } catch (err: any) {
    console.error('[Admin] Exception rescheduling follow-up:', err);
    return { success: false, error: err.message };
  }
}

export async function updateLeadDealValue(
  leadId: string,
  newValue: number | null,
  previousValue?: number | null
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { success: true };

  try {
    const { error } = await supabase
      .from('leads')
      .update({ estimated_value: newValue })
      .eq('id', leadId);

    if (error) {
      console.warn('[Admin] Error updating deal value:', error);
      return { success: false, error: error.message };
    }

    const oldValFormatted = previousValue != null ? `$${previousValue.toLocaleString()}` : '$0';
    const newValFormatted = newValue != null ? `$${newValue.toLocaleString()}` : '$0';

    const desc = `Deal value updated from ${oldValFormatted} to ${newValFormatted}`;
    await addLeadActivity(leadId, 'deal_value_change', desc);

    return { success: true };
  } catch (err: any) {
    console.error('[Admin] Exception updating deal value:', err);
    return { success: false, error: err.message };
  }
}

export interface SalesMetrics {
  totalPipelineValue: number;
  wonRevenue: number;
  openOpportunitiesCount: number;
  totalLeadsCount: number;
  wonLeadsCount: number;
  conversionRate: number;
  overdueFollowUpsCount: number;
  dealsClosingThisMonthCount: number;
  stageBreakdown: {
    stage: string;
    label: string;
    count: number;
    value: number;
  }[];
}

export async function fetchSalesMetrics(): Promise<{ metrics: SalesMetrics; error?: string }> {
  const defaultMetrics: SalesMetrics = {
    totalPipelineValue: 0,
    wonRevenue: 0,
    openOpportunitiesCount: 0,
    totalLeadsCount: 0,
    wonLeadsCount: 0,
    conversionRate: 0,
    overdueFollowUpsCount: 0,
    dealsClosingThisMonthCount: 0,
    stageBreakdown: [
      { stage: 'new', label: 'NEW', count: 0, value: 0 },
      { stage: 'contacted', label: 'CONTACTED', count: 0, value: 0 },
      { stage: 'qualified', label: 'QUALIFIED', count: 0, value: 0 },
      { stage: 'proposal', label: 'PROPOSAL', count: 0, value: 0 },
      { stage: 'won', label: 'WON', count: 0, value: 0 },
      { stage: 'lost', label: 'LOST', count: 0, value: 0 },
    ],
  };

  if (!isSupabaseConfigured || !supabase) return { metrics: defaultMetrics };

  try {
    const runQuery = async () => {
      return await supabase
        .from('leads')
        .select('id, status, estimated_value, next_follow_up_at, expected_close_date');
    };

    let { data: leads, error } = await runQuery();

    if (error && isJwtError(error)) {
      console.warn('[Admin] JWT error in fetchSalesMetrics. Retrying...');
      await new Promise((r) => setTimeout(r, 700));
      await supabase.auth.refreshSession().catch(() => {});
      const retry = await runQuery();
      leads = retry.data;
      error = retry.error;
    }

    if (error) {
      console.warn('[Admin] Error fetching leads for sales metrics:', error);
      return { metrics: defaultMetrics, error: error.message };
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalPipelineValue = 0;
    let wonRevenue = 0;
    let openOpportunitiesCount = 0;
    let wonLeadsCount = 0;
    let overdueFollowUpsCount = 0;
    let dealsClosingThisMonthCount = 0;

    const breakdownMap: Record<string, { count: number; value: number }> = {
      new: { count: 0, value: 0 },
      contacted: { count: 0, value: 0 },
      qualified: { count: 0, value: 0 },
      proposal: { count: 0, value: 0 },
      won: { count: 0, value: 0 },
      lost: { count: 0, value: 0 },
    };

    (leads || []).forEach((lead) => {
      const st = (lead.status || 'new').toLowerCase();
      const val = lead.estimated_value != null ? Number(lead.estimated_value) : 0;

      if (breakdownMap[st]) {
        breakdownMap[st].count += 1;
        breakdownMap[st].value += val;
      }

      // Open pipeline stages: new, contacted, qualified, proposal
      if (['new', 'contacted', 'qualified', 'proposal'].includes(st)) {
        totalPipelineValue += val;
        openOpportunitiesCount += 1;
      } else if (st === 'won') {
        wonRevenue += val;
        wonLeadsCount += 1;
      }

      // Overdue follow-ups
      if (lead.next_follow_up_at) {
        const followUpDate = new Date(lead.next_follow_up_at);
        if (!isNaN(followUpDate.getTime()) && followUpDate < todayStart) {
          overdueFollowUpsCount += 1;
        }
      }

      // Deals closing this month
      if (lead.expected_close_date) {
        const closeDate = new Date(lead.expected_close_date);
        if (
          !isNaN(closeDate.getTime()) &&
          closeDate.getMonth() === currentMonth &&
          closeDate.getFullYear() === currentYear
        ) {
          dealsClosingThisMonthCount += 1;
        }
      }
    });

    const totalLeadsCount = leads ? leads.length : 0;
    const conversionRate = totalLeadsCount > 0 ? (wonLeadsCount / totalLeadsCount) * 100 : 0;

    const stageBreakdown = [
      { stage: 'new', label: 'NEW', ...breakdownMap.new },
      { stage: 'contacted', label: 'CONTACTED', ...breakdownMap.contacted },
      { stage: 'qualified', label: 'QUALIFIED', ...breakdownMap.qualified },
      { stage: 'proposal', label: 'PROPOSAL', ...breakdownMap.proposal },
      { stage: 'won', label: 'WON', ...breakdownMap.won },
      { stage: 'lost', label: 'LOST', ...breakdownMap.lost },
    ];

    return {
      metrics: {
        totalPipelineValue,
        wonRevenue,
        openOpportunitiesCount,
        totalLeadsCount,
        wonLeadsCount,
        conversionRate,
        overdueFollowUpsCount,
        dealsClosingThisMonthCount,
        stageBreakdown,
      },
    };
  } catch (err: any) {
    console.error('[Admin] Exception calculating sales metrics:', err);
    return { metrics: defaultMetrics, error: err.message };
  }
}

// ===================================================
// AI AUDITS FLOW
// ===================================================
export async function fetchAuditResponses(): Promise<{ audits: AuditResponse[]; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { audits: [] };
  }

  try {
    const runQuery = async () => {
      return await supabase
        .from('audit_responses')
        .select('*, businesses(*), ai_opportunities(*)')
        .order('created_at', { ascending: false });
    };

    let { data, error } = await runQuery();

    if (error && isJwtError(error)) {
      console.warn('[Admin] JWT error in fetchAuditResponses. Retrying...');
      await new Promise((r) => setTimeout(r, 700));
      await supabase.auth.refreshSession().catch(() => {});
      const retry = await runQuery();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;

    const formattedAudits: AuditResponse[] = (data || []).map((row: any) => ({
      id: row.id,
      business_id: row.business_id,
      description: row.description || row.businesses?.description || '',
      primary_goal: row.primary_goal,
      pain_points: row.pain_points || [],
      current_tools: row.current_tools || [],
      created_at: row.created_at,
      business: row.businesses
        ? {
            id: row.businesses.id,
            company_name: row.businesses.company_name,
            description: row.businesses.description,
            industry: row.businesses.industry,
            company_size: row.businesses.company_size,
            created_at: row.businesses.created_at,
          }
        : undefined,
      opportunities: (row.ai_opportunities || []).map((o: any) => ({
        id: o.id,
        audit_response_id: o.audit_response_id,
        title: o.title,
        description: o.description,
        impact: o.impact || 'HIGH',
        priority: o.priority ?? 1,
        created_at: o.created_at,
      })),
    }));

    return { audits: formattedAudits };
  } catch (err: any) {
    console.error('[Admin] Error fetching audit responses:', err);
    return { audits: [], error: err.message };
  }
}

// ===================================================
// AI OPPORTUNITIES FLOW
// ===================================================
export async function fetchAIOpportunities(): Promise<{ opportunities: AIOpportunity[]; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { opportunities: [] };
  }

  try {
    const runQuery = async () => {
      return await supabase
        .from('ai_opportunities')
        .select('*, audit_responses(*, businesses(*))')
        .order('created_at', { ascending: false });
    };

    let { data, error } = await runQuery();

    if (error && isJwtError(error)) {
      console.warn('[Admin] JWT error in fetchAIOpportunities. Retrying...');
      await new Promise((r) => setTimeout(r, 700));
      await supabase.auth.refreshSession().catch(() => {});
      const retry = await runQuery();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;

    const formattedOpps: AIOpportunity[] = (data || []).map((row: any) => {
      const audit = row.audit_responses;
      const bus = audit?.businesses;
      return {
        id: row.id,
        audit_response_id: row.audit_response_id,
        title: row.title,
        description: row.description,
        impact: row.impact || 'HIGH',
        priority: row.priority ?? 1,
        created_at: row.created_at,
        business_name: bus?.company_name || 'Anonymous Business',
        audit_response: audit
          ? {
              id: audit.id,
              business_id: audit.business_id,
              description: audit.description,
              primary_goal: audit.primary_goal,
              pain_points: audit.pain_points || [],
              current_tools: audit.current_tools || [],
              business: bus
                ? {
                    id: bus.id,
                    company_name: bus.company_name,
                    description: bus.description,
                    industry: bus.industry,
                    company_size: bus.company_size,
                  }
                : undefined,
            }
          : undefined,
      };
    });

    return { opportunities: formattedOpps };
  } catch (err: any) {
    console.error('[Admin] Error fetching opportunities:', err);
    return { opportunities: [], error: err.message };
  }
}

// ===================================================
// CONTACT REQUESTS FLOW
// ===================================================
export async function fetchContactRequests(): Promise<{ requests: ContactRequest[]; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { requests: [] };
  }

  try {
    const runQuery = async () => {
      return await supabase
        .from('contact_requests')
        .select('*')
        .order('created_at', { ascending: false });
    };

    let { data, error } = await runQuery();

    if (error && isJwtError(error)) {
      console.warn('[Admin] JWT error in fetchContactRequests. Retrying...');
      await new Promise((r) => setTimeout(r, 700));
      await supabase.auth.refreshSession().catch(() => {});
      const retry = await runQuery();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;

    const formattedRequests: ContactRequest[] = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      company: row.company,
      phone: row.phone,
      message: row.message,
      status: row.status || 'new',
      created_at: row.created_at,
    }));

    return { requests: formattedRequests };
  } catch (err: any) {
    console.error('[Admin] Error fetching contact requests:', err);
    return { requests: [], error: err.message };
  }
}

export async function updateContactRequestStatus(id: string, status: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { success: true };

  try {
    const { error } = await supabase
      .from('contact_requests')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.warn('[Admin] Contact request status update error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Admin] Error updating contact request status:', err);
    return { success: false, error: err.message };
  }
}

// Helper: Relative time formatter (e.g. "2 minutes ago", "1 hour ago", "Yesterday")
export function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins} min${mins > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 172800) return 'Yesterday';

  const days = Math.floor(diffInSeconds / 86400);
  if (days < 30) return `${days} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

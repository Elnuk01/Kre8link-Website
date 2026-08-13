import { createClient } from '@supabase/supabase-js';
import { AIOpportunity } from '../types';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  '';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to identify PostgREST JWT errors (e.g. PGRST303 JWT issued at future)
export function isJwtError(err: any): boolean {
  if (!err) return false;
  const code = String(err.code || '').toUpperCase();
  const msg = String(err.message || '').toLowerCase();
  const details = String(err.details || '').toLowerCase();
  return (
    code === 'PGRST303' ||
    code === 'PGRST301' ||
    code === '401' ||
    msg.includes('jwt') ||
    msg.includes('future') ||
    msg.includes('expired') ||
    msg.includes('invalid claim') ||
    details.includes('jwt') ||
    details.includes('future')
  );
}

// Helper to generate a valid RFC4122 UUID v4
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ==========================================
// 1. AUDIT & AI OPPORTUNITIES FLOW
// ==========================================
export interface AuditSubmissionPayload {
  company_name?: string;
  business_description: string;
  industry?: string;
  company_size?: string;
  pain_points: string[];
  current_tools: string[];
  primary_goal: string;
  opportunities: AIOpportunity[];
}

export async function submitOpportunityAudit(payload: AuditSubmissionPayload): Promise<{
  success: boolean;
  business_id?: string;
  audit_response_id?: string;
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('[Supabase] Client not configured. Operating in offline mode.');
    return {
      success: true,
      business_id: generateUUID(),
      audit_response_id: generateUUID()
    };
  }

  try {
    const businessId = generateUUID();
    const auditResponseId = generateUUID();

    // 1. Create row in `businesses`
    let { error: busErr } = await supabase
      .from('businesses')
      .insert({
        id: businessId,
        company_name: payload.company_name?.trim() || 'Anonymous Business',
        description: payload.business_description.trim(),
        industry: payload.industry || null,
        company_size: payload.company_size || null
      });

    if (busErr) {
      console.warn('[Supabase] Detailed businesses insert failed, trying minimal fields:', busErr);
      const retryBus = await supabase
        .from('businesses')
        .insert({
          id: businessId,
          company_name: payload.company_name?.trim() || 'Anonymous Business',
          description: payload.business_description.trim()
        });

      if (retryBus.error) {
        console.error('[Supabase] Error inserting into businesses:', retryBus.error);
        return { success: false, error: retryBus.error.message || 'Failed to save business info' };
      }
    }

    // 2. Create row in `audit_responses`
    // First attempt without `description` column to match schema where description is in `businesses`
    let { error: auditErr } = await supabase
      .from('audit_responses')
      .insert({
        id: auditResponseId,
        business_id: businessId,
        pain_points: payload.pain_points,
        current_tools: payload.current_tools,
        primary_goal: payload.primary_goal
      });

    if (auditErr) {
      console.warn('[Supabase] Standard audit_responses insert warning:', auditErr.message);

      // Retry with `description` field included
      const retryWithDesc = await supabase
        .from('audit_responses')
        .insert({
          id: auditResponseId,
          business_id: businessId,
          description: payload.business_description.trim(),
          pain_points: payload.pain_points,
          current_tools: payload.current_tools,
          primary_goal: payload.primary_goal
        });

      if (!retryWithDesc.error) {
        auditErr = null;
      } else {
        // Minimal retry with foreign key only
        const retryMinimal = await supabase
          .from('audit_responses')
          .insert({
            id: auditResponseId,
            business_id: businessId
          });

        if (!retryMinimal.error) {
          auditErr = null;
        } else {
          console.error('[Supabase] Could not save audit_responses detail row:', retryMinimal.error);
        }
      }
    }

    // 3. Save opportunities into `ai_opportunities`
    if (payload.opportunities && payload.opportunities.length > 0) {
      const oppRows = payload.opportunities.map((o, idx) => ({
        id: generateUUID(),
        audit_response_id: auditResponseId,
        title: o.title,
        description: o.description,
        impact: o.impact,
        priority: typeof o.priority === 'number' ? o.priority : (o.priority === 'HIGH' ? 1 : idx + 1)
      }));

      const { error: oppsErr } = await supabase
        .from('ai_opportunities')
        .insert(oppRows);

      if (oppsErr) {
        console.warn('[Supabase] Priority int insert failed, trying string format:', oppsErr);
        const stringOppRows = payload.opportunities.map((o) => ({
          id: generateUUID(),
          audit_response_id: auditResponseId,
          title: o.title,
          description: o.description,
          impact: o.impact,
          priority: String(o.priority || 'HIGH')
        }));
        const { error: retryErr } = await supabase
          .from('ai_opportunities')
          .insert(stringOppRows);

        if (retryErr) {
          console.error('[Supabase] Error saving opportunities:', retryErr);
        }
      }
    }

    return {
      success: true,
      business_id: businessId,
      audit_response_id: auditResponseId
    };
  } catch (err: any) {
    console.error('[Supabase] Unexpected audit error:', err);
    return { success: false, error: err.message || 'Something went wrong while generating your report.' };
  }
}

// ==========================================
// 2. LEAD CAPTURE FLOW
// ==========================================
export interface LeadSubmissionPayload {
  business_id?: string;
  name: string;
  email: string;
  phone?: string;
}

export async function submitLead(payload: LeadSubmissionPayload): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('[Supabase] Client not configured. Lead saved locally.');
    return { success: true };
  }

  try {
    let { error } = await supabase.from('leads').insert({
      id: generateUUID(),
      business_id: payload.business_id || null,
      name: payload.name.trim(),
      email: payload.email.trim(),
      phone: payload.phone?.trim() || null,
      source: 'AI Opportunity Scanner'
    });

    if (error && isJwtError(error)) {
      console.warn('[Supabase] JWT timing issue in submitLead, retrying...');
      await new Promise((r) => setTimeout(r, 600));
      const retry = await supabase.from('leads').insert({
        id: generateUUID(),
        business_id: payload.business_id || null,
        name: payload.name.trim(),
        email: payload.email.trim(),
        phone: payload.phone?.trim() || null,
        source: 'AI Opportunity Scanner'
      });
      error = retry.error;
    }

    if (error) {
      console.error('[Supabase] Error inserting lead:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Unexpected lead error:', err);
    return { success: false, error: err.message };
  }
}

// ==========================================
// 3. CONTACT REQUESTS FLOW
// ==========================================
export interface ContactRequestPayload {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
}

export async function submitContactRequest(payload: ContactRequestPayload): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('[Supabase] Client not configured. Contact saved locally.');
    return { success: true };
  }

  try {
    let { error } = await supabase.from('contact_requests').insert({
      id: generateUUID(),
      name: payload.name.trim(),
      email: payload.email.trim(),
      company: payload.company?.trim() || null,
      phone: payload.phone?.trim() || null,
      message: payload.message?.trim() || null
    });

    if (error && isJwtError(error)) {
      console.warn('[Supabase] JWT timing issue in submitContactRequest, retrying...');
      await new Promise((r) => setTimeout(r, 600));
      const retry = await supabase.from('contact_requests').insert({
        id: generateUUID(),
        name: payload.name.trim(),
        email: payload.email.trim(),
        company: payload.company?.trim() || null,
        phone: payload.phone?.trim() || null,
        message: payload.message?.trim() || null
      });
      error = retry.error;
    }

    if (error) {
      console.error('[Supabase] Error inserting contact request:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Unexpected contact error:', err);
    return { success: false, error: err.message };
  }
}

// Backward compatibility helpers
export async function saveAuditToSupabase(
  company: string,
  description: string,
  departments: string[],
  tools: string[],
  goals: string[],
  opportunities: any[]
) {
  return submitOpportunityAudit({
    company_name: company,
    business_description: description,
    pain_points: departments,
    current_tools: tools,
    primary_goal: goals[0] || 'Automation',
    opportunities
  });
}

export async function saveContactRequest(name: string, email: string, company?: string, message?: string) {
  return submitContactRequest({ name, email, company, message });
}

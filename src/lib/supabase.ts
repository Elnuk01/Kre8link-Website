import { createClient } from '@supabase/supabase-js';
import { AIOpportunity } from '../types';

const cleanEnvVar = (val: string | undefined): string => {
  if (!val || typeof val !== 'string') return '';
  return val.trim().replace(/^["']|["']$/g, '');
};

const supabaseUrl = cleanEnvVar(
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL
);

const supabaseAnonKey = cleanEnvVar(
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const isPlaceholderUrl = (url: string): boolean => {
  if (!url) return true;
  const lower = url.toLowerCase();
  return (
    lower.includes('your-project.supabase.co') ||
    lower.includes('your-supabase-url') ||
    lower === 'https://' ||
    lower === 'http://'
  );
};

const isPlaceholderKey = (key: string): boolean => {
  if (!key) return true;
  const lower = key.toLowerCase();
  return (
    lower.includes('your-anon-key') ||
    lower.includes('your-publishable-key') ||
    lower === 'placeholder'
  );
};

const hasValidUrl = Boolean(supabaseUrl && !isPlaceholderUrl(supabaseUrl));
const hasValidKey = Boolean(supabaseAnonKey && !isPlaceholderKey(supabaseAnonKey));

export const isSupabaseConfigured = Boolean(hasValidUrl && hasValidKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// SAFE diagnostic reporting (never exposes key or URL values)
console.log(`[Supabase Diagnostic] SUPABASE URL PRESENT: ${hasValidUrl}`);
console.log(`[Supabase Diagnostic] SUPABASE ANON KEY PRESENT: ${hasValidKey}`);
console.log(`[Supabase Diagnostic] SUPABASE CONFIGURED: ${isSupabaseConfigured}`);

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

// Safe diagnostic logging helper (never logs tokens, passwords or secrets)
function logInsertDiagnostic(tableName: string, error: any) {
  const isSuccess = !error;
  const errorCode = error?.code || 'NONE';
  const errorMessage = error?.message || 'NONE';
  const errorDetails = error?.details || 'NONE';

  console.log(
    `[Supabase INSERT] Table: "${tableName}" | Success: ${isSuccess} | Code: "${errorCode}" | Message: "${errorMessage}" | Details: "${errorDetails}"`
  );
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
    console.error('[Supabase Diagnostic] Client not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.');
    return {
      success: false,
      error: 'Supabase database is not configured. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env variables.'
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

    logInsertDiagnostic('businesses', busErr);

    if (busErr) {
      console.warn('[Supabase] Detailed businesses insert failed, retrying minimal fields:', busErr.message);
      const retryBus = await supabase
        .from('businesses')
        .insert({
          id: businessId,
          company_name: payload.company_name?.trim() || 'Anonymous Business',
          description: payload.business_description.trim()
        });

      logInsertDiagnostic('businesses (retry)', retryBus.error);

      if (retryBus.error) {
        console.error('[Supabase] Error inserting into businesses:', retryBus.error);
        return {
          success: false,
          error: `Failed to save business info: ${retryBus.error.message || retryBus.error.code}`
        };
      }
    }

    // 2. Create row in `audit_responses`
    let { error: auditErr } = await supabase
      .from('audit_responses')
      .insert({
        id: auditResponseId,
        business_id: businessId,
        pain_points: payload.pain_points,
        current_tools: payload.current_tools,
        primary_goal: payload.primary_goal
      });

    logInsertDiagnostic('audit_responses', auditErr);

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

      logInsertDiagnostic('audit_responses (retry with desc)', retryWithDesc.error);

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

        logInsertDiagnostic('audit_responses (minimal retry)', retryMinimal.error);

        if (!retryMinimal.error) {
          auditErr = null;
        } else {
          console.error('[Supabase] Could not save audit_responses row:', retryMinimal.error);
          return {
            success: false,
            error: `Failed to save audit response: ${retryMinimal.error.message || retryMinimal.error.code}`
          };
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

      logInsertDiagnostic('ai_opportunities', oppsErr);

      if (oppsErr) {
        console.warn('[Supabase] Priority int insert failed, trying string format:', oppsErr.message);
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

        logInsertDiagnostic('ai_opportunities (string priority retry)', retryErr);

        if (retryErr) {
          console.error('[Supabase] Error saving opportunities:', retryErr);
          return {
            success: false,
            error: `Failed to save AI opportunities: ${retryErr.message || retryErr.code}`
          };
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
    return { success: false, error: err.message || 'AI opportunity scan could not be completed.' };
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
    console.error('[Supabase Diagnostic] Client not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.');
    return {
      success: false,
      error: 'Supabase database is not configured. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env variables.'
    };
  }

  try {
    let { error } = await supabase
      .from('leads')
      .insert({
        id: generateUUID(),
        business_id: payload.business_id || null,
        name: payload.name.trim(),
        email: payload.email.trim(),
        phone: payload.phone?.trim() || null,
        source: 'AI Opportunity Scanner'
      });

    logInsertDiagnostic('leads', error);

    if (error && (error.code === 'PGRST204' || isJwtError(error))) {
      if (isJwtError(error)) {
        console.warn('[Supabase] JWT timing issue in submitLead, retrying...');
        await new Promise((r) => setTimeout(r, 600));
      } else {
        console.warn('[Supabase] Column schema mismatch in leads, retrying minimal fields...');
      }

      const retry = await supabase
        .from('leads')
        .insert({
          business_id: payload.business_id || null,
          name: payload.name.trim(),
          email: payload.email.trim(),
          phone: payload.phone?.trim() || null
        });

      error = retry.error;
      logInsertDiagnostic('leads (retry)', error);
    }

    if (error) {
      console.error('[Supabase] Error inserting lead:', error);
      return { success: false, error: error.message || error.code || 'Unable to save lead contact details' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Unexpected lead error:', err);
    return { success: false, error: err.message || 'Unable to save lead contact details' };
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
    console.error('[Supabase Diagnostic] Client not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.');
    return {
      success: false,
      error: 'Supabase database is not configured. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env variables.'
    };
  }

  try {
    let { error } = await supabase
      .from('contact_requests')
      .insert({
        id: generateUUID(),
        name: payload.name.trim(),
        email: payload.email.trim(),
        company: payload.company?.trim() || null,
        phone: payload.phone?.trim() || null,
        message: payload.message?.trim() || null
      });

    logInsertDiagnostic('contact_requests', error);

    if (error && (error.code === 'PGRST204' || isJwtError(error))) {
      if (isJwtError(error)) {
        console.warn('[Supabase] JWT timing issue in submitContactRequest, retrying...');
        await new Promise((r) => setTimeout(r, 600));
      } else {
        console.warn('[Supabase] Column schema mismatch in contact_requests, retrying minimal fields...');
      }

      const retry = await supabase
        .from('contact_requests')
        .insert({
          name: payload.name.trim(),
          email: payload.email.trim(),
          phone: payload.phone?.trim() || null,
          message: payload.message?.trim() || null
        });

      error = retry.error;
      logInsertDiagnostic('contact_requests (retry)', error);
    }

    if (error) {
      console.error('[Supabase] Error inserting contact request:', error);
      return { success: false, error: error.message || error.code || 'Unable to save contact request' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Unexpected contact error:', err);
    return { success: false, error: err.message || 'Unable to save contact request' };
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

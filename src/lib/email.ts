import { supabase, isSupabaseConfigured } from './supabase';
import { AIOpportunity } from '../types';

export interface OpportunityEmailPayload {
  name: string;
  email: string;
  phone?: string | null;
  businessName: string;
  opportunities: AIOpportunity[];
}

export interface LeadEmailPayload {
  name: string;
  email: string;
  phone?: string | null;
  company: string;
}

export interface ContactEmailPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
}

/**
 * 1. AI Opportunity Scanner / Audit Email Invocation
 * Dispatches internal notification to admin@kre8link.com & customer confirmation to the lead.
 */
export async function sendOpportunityEmailNotification(payload: OpportunityEmailPayload): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('[send-email] Supabase client is not configured; skipping email invocation.');
      return { success: false, error: 'Supabase client not configured' };
    }

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'opportunity',
        name: payload.name.trim(),
        email: payload.email.trim(),
        phone: payload.phone?.trim() || undefined,
        businessName: payload.businessName.trim(),
        opportunities: payload.opportunities || [],
      },
    });

    if (error) {
      console.warn('[send-email] Supabase Edge Function `send-email` opportunity notification warning:', error);
      return { success: false, error: error.message || 'Edge function error' };
    }

    console.log('[send-email] Opportunity email notification successfully triggered:', data);
    return { success: true };
  } catch (err: any) {
    console.error('[send-email] Unexpected error invoking send-email for opportunity:', err);
    return { success: false, error: err?.message || 'Email dispatch failed' };
  }
}

/**
 * 2. Lead Capture Email Invocation
 * Dispatches internal notification to admin@kre8link.com & customer confirmation to the lead.
 */
export async function sendLeadEmailNotification(payload: LeadEmailPayload): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('[send-email] Supabase client is not configured; skipping email invocation.');
      return { success: false, error: 'Supabase client not configured' };
    }

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'lead',
        name: payload.name.trim(),
        email: payload.email.trim(),
        phone: payload.phone?.trim() || undefined,
        company: payload.company.trim(),
      },
    });

    if (error) {
      console.warn('[send-email] Supabase Edge Function `send-email` lead notification warning:', error);
      return { success: false, error: error.message || 'Edge function error' };
    }

    console.log('[send-email] Lead email notification successfully triggered:', data);
    return { success: true };
  } catch (err: any) {
    console.error('[send-email] Unexpected error invoking send-email for lead:', err);
    return { success: false, error: err?.message || 'Email dispatch failed' };
  }
}

/**
 * 3. General Consultation / Contact Form Email Invocation
 * Dispatches internal notification to admin@kre8link.com & customer confirmation to the sender.
 */
export async function sendContactEmailNotification(payload: ContactEmailPayload): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('[send-email] Supabase client is not configured; skipping email invocation.');
      return { success: false, error: 'Supabase client not configured' };
    }

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'contact',
        name: payload.name.trim(),
        email: payload.email.trim(),
        phone: payload.phone?.trim() || undefined,
        company: payload.company?.trim() || undefined,
        message: payload.message?.trim() || undefined,
      },
    });

    if (error) {
      console.warn('[send-email] Supabase Edge Function `send-email` contact notification warning:', error);
      return { success: false, error: error.message || 'Edge function error' };
    }

    console.log('[send-email] Contact email notification successfully triggered:', data);
    return { success: true };
  } catch (err: any) {
    console.error('[send-email] Unexpected error invoking send-email for contact:', err);
    return { success: false, error: err?.message || 'Email dispatch failed' };
  }
}

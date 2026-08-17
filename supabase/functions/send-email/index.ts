// Supabase Edge Function: send-email
// Outbound transactional email delivery via Resend for Kre8Link

declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SendEmailDirectRequest {
  to?: string | string[];
  subject?: string;
  html?: string;
  reply_to?: string;
}

interface OpportunityPayload {
  type: 'opportunity';
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  company?: string;
  opportunities?: Array<{
    title: string;
    description: string;
    impact?: string;
    priority?: string;
  }>;
}

interface LeadPayload {
  type: 'lead';
  name: string;
  email: string;
  phone?: string;
  company?: string;
  businessName?: string;
}

interface ContactPayload {
  type: 'contact';
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
}

type EdgeFunctionPayload = SendEmailDirectRequest | OpportunityPayload | LeadPayload | ContactPayload;

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendViaResend(
  apiKey: string,
  to: string | string[],
  subject: string,
  html: string,
  replyTo?: string
) {
  const recipientList = Array.isArray(to) ? to : [to];
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Kre8Link <admin@kre8link.com>',
      to: recipientList,
      subject,
      html,
      reply_to: replyTo || 'admin@kre8link.com',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Resend delivery failed');
  }
  return data;
}

Deno.serve(async (req: Request) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('[send-email Edge Function] RESEND_API_KEY secret is not set in Supabase');
      return new Response(
        JSON.stringify({
          error: 'Email service configuration missing. Please set RESEND_API_KEY secret in Supabase.',
          success: false,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: EdgeFunctionPayload = await req.json();

    // 1. Handle type: "opportunity"
    if ('type' in payload && payload.type === 'opportunity') {
      const oppPayload = payload as OpportunityPayload;
      const companyName = oppPayload.businessName || oppPayload.company || 'Business Lead';
      const oppCount = oppPayload.opportunities?.length || 0;

      // Admin Email
      const adminSubject = `New AI Opportunity Lead – ${companyName}`;
      const oppsListHtml = (oppPayload.opportunities && oppPayload.opportunities.length > 0)
        ? oppPayload.opportunities.map((opp, i) => `
            <li style="margin-bottom: 8px; font-size: 13px;">
              <strong>${i + 1}. ${escapeHtml(opp.title)}</strong> 
              <span style="color: #0d9488; font-weight: bold;">[${escapeHtml(opp.impact || 'HIGH')} IMPACT]</span><br/>
              <span style="color: #475569;">${escapeHtml(opp.description || '')}</span>
            </li>
          `).join('')
        : '<li style="color: #64748b;">No specific opportunities attached.</li>';

      const adminHtml = `
        <div style="font-family: sans-serif; padding: 24px; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="background: #0A292C; padding: 16px 20px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Kre8Link &bull; New AI Opportunity Lead</h2>
          </div>
          <p><strong>Name:</strong> ${escapeHtml(oppPayload.name)}</p>
          <p><strong>Email:</strong> <a href="mailto:${escapeHtml(oppPayload.email)}">${escapeHtml(oppPayload.email)}</a></p>
          <p><strong>Phone:</strong> ${escapeHtml(oppPayload.phone || 'Not provided')}</p>
          <p><strong>Company:</strong> ${escapeHtml(companyName)}</p>
          <p><strong>Identified Opportunities:</strong> ${oppCount}</p>
          <h3 style="font-size: 14px; margin-top: 20px;">AI Opportunity Highlights:</h3>
          <ol style="padding-left: 20px;">${oppsListHtml}</ol>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <a href="https://kre8link.com/admin" style="background: #0A292C; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: bold;">Open Admin Dashboard</a>
          </div>
        </div>
      `;

      // Customer Confirmation Email
      const customerSubject = 'Your Kre8Link AI Opportunity Report';
      const customerHtml = `
        <div style="font-family: sans-serif; padding: 24px; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="background: #0A292C; padding: 16px 20px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Kre8Link &bull; AI Opportunity Report</h2>
          </div>
          <p>Hello <strong>${escapeHtml(oppPayload.name)}</strong>,</p>
          <p>Thank you for completing the AI Opportunity Scan for <strong>${escapeHtml(companyName)}</strong>.</p>
          <p>Your AI Opportunity Report has been generated. A Kre8Link AI consultant will review your identified opportunities and reach out to explore high-impact automation and integration roadmaps for your business.</p>
          <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #475569;">
            <strong>Kre8Link Team</strong><br/>
            AI Transformation &amp; Automation Systems<br/>
            <a href="https://kre8link.com" style="color: #F05323; text-decoration: none;">https://kre8link.com</a><br/>
            admin@kre8link.com
          </div>
        </div>
      `;

      await Promise.allSettled([
        sendViaResend(resendApiKey, 'admin@kre8link.com', adminSubject, adminHtml, oppPayload.email),
        sendViaResend(resendApiKey, oppPayload.email, customerSubject, customerHtml, 'admin@kre8link.com'),
      ]);

      return new Response(
        JSON.stringify({ success: true, message: 'Opportunity notifications dispatched' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Handle type: "lead"
    if ('type' in payload && payload.type === 'lead') {
      const leadPayload = payload as LeadPayload;
      const companyName = leadPayload.company || leadPayload.businessName || 'Business Lead';

      // Admin Email
      const adminSubject = `New Kre8Link Lead – ${escapeHtml(leadPayload.name)} (${companyName})`;
      const adminHtml = `
        <div style="font-family: sans-serif; padding: 24px; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="background: #0A292C; padding: 16px 20px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Kre8Link &bull; New Lead Captured</h2>
          </div>
          <p><strong>Name:</strong> ${escapeHtml(leadPayload.name)}</p>
          <p><strong>Email:</strong> <a href="mailto:${escapeHtml(leadPayload.email)}">${escapeHtml(leadPayload.email)}</a></p>
          <p><strong>Phone:</strong> ${escapeHtml(leadPayload.phone || 'Not provided')}</p>
          <p><strong>Company:</strong> ${escapeHtml(companyName)}</p>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <a href="https://kre8link.com/admin" style="background: #0A292C; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: bold;">Open Admin Dashboard</a>
          </div>
        </div>
      `;

      // Customer Confirmation Email
      const customerSubject = 'Your Kre8Link AI Opportunity Report';
      const customerHtml = `
        <div style="font-family: sans-serif; padding: 24px; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="background: #0A292C; padding: 16px 20px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Kre8Link &bull; AI Opportunity Report</h2>
          </div>
          <p>Hello <strong>${escapeHtml(leadPayload.name)}</strong>,</p>
          <p>Thank you for submitting your details for <strong>${escapeHtml(companyName)}</strong>.</p>
          <p>Your AI Opportunity Report has been generated. A Kre8Link consultant will review your opportunities and follow up with tailored guidance.</p>
          <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #475569;">
            <strong>Kre8Link Team</strong><br/>
            AI Transformation &amp; Automation Systems<br/>
            <a href="https://kre8link.com" style="color: #F05323; text-decoration: none;">https://kre8link.com</a><br/>
            admin@kre8link.com
          </div>
        </div>
      `;

      await Promise.allSettled([
        sendViaResend(resendApiKey, 'admin@kre8link.com', adminSubject, adminHtml, leadPayload.email),
        sendViaResend(resendApiKey, leadPayload.email, customerSubject, customerHtml, 'admin@kre8link.com'),
      ]);

      return new Response(
        JSON.stringify({ success: true, message: 'Lead notifications dispatched' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Handle type: "contact"
    if ('type' in payload && payload.type === 'contact') {
      const contactPayload = payload as ContactPayload;

      // Admin Email
      const adminSubject = `New Kre8Link Consultation Request – ${escapeHtml(contactPayload.name)}`;
      const adminHtml = `
        <div style="font-family: sans-serif; padding: 24px; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="background: #0A292C; padding: 16px 20px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Kre8Link &bull; New Consultation Request</h2>
          </div>
          <p><strong>Name:</strong> ${escapeHtml(contactPayload.name)}</p>
          <p><strong>Email:</strong> <a href="mailto:${escapeHtml(contactPayload.email)}">${escapeHtml(contactPayload.email)}</a></p>
          <p><strong>Phone:</strong> ${escapeHtml(contactPayload.phone || 'Not provided')}</p>
          <p><strong>Company:</strong> ${escapeHtml(contactPayload.company || 'Not specified')}</p>
          <div style="background: #f8fafc; padding: 12px; border-radius: 6px; margin-top: 12px; border-left: 3px solid #0A292C;">
            <strong>Message:</strong><br/>
            ${escapeHtml(contactPayload.message || 'No message provided').replace(/\\n/g, '<br/>')}
          </div>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <a href="https://kre8link.com/admin" style="background: #0A292C; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: bold;">Open Admin Dashboard</a>
          </div>
        </div>
      `;

      // Customer Confirmation Email
      const customerSubject = 'We Received Your Kre8Link Request';
      const customerHtml = `
        <div style="font-family: sans-serif; padding: 24px; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="background: #0A292C; padding: 16px 20px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Kre8Link &bull; Request Received</h2>
          </div>
          <p>Hello <strong>${escapeHtml(contactPayload.name)}</strong>,</p>
          <p>Thank you for reaching out to Kre8Link. Your consultation request was successfully received and our team will get back to you shortly.</p>
          <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #475569;">
            <strong>Kre8Link Team</strong><br/>
            AI Transformation &amp; Automation Systems<br/>
            <a href="https://kre8link.com" style="color: #F05323; text-decoration: none;">https://kre8link.com</a><br/>
            admin@kre8link.com
          </div>
        </div>
      `;

      await Promise.allSettled([
        sendViaResend(resendApiKey, 'admin@kre8link.com', adminSubject, adminHtml, contactPayload.email),
        sendViaResend(resendApiKey, contactPayload.email, customerSubject, customerHtml, 'admin@kre8link.com'),
      ]);

      return new Response(
        JSON.stringify({ success: true, message: 'Contact notifications dispatched' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Handle Direct Email: { to, subject, html, reply_to }
    const direct = payload as SendEmailDirectRequest;
    if (!direct.to || !direct.subject || !direct.html) {
      return new Response(
        JSON.stringify({ error: 'Missing required email fields: to, subject, html or invalid payload type', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resendData = await sendViaResend(
      resendApiKey,
      direct.to,
      direct.subject,
      direct.html,
      direct.reply_to
    );

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[send-email Edge Function] Unhandled error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error', success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

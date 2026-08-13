-- Kre8link Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up all required tables.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Businesses Table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  industry TEXT,
  description TEXT NOT NULL,
  company_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  source TEXT DEFAULT 'AI Opportunity Scanner',
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add CRM fields if table already exists
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimated_value NUMERIC;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS expected_close_date DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_action TEXT;

-- 3. Lead Activities Table (Sales Timeline)
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL, -- 'created', 'note', 'status_change', 'follow_up', 'email', 'call'
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

-- 4. Audit Responses Table
CREATE TABLE IF NOT EXISTS audit_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  description TEXT,
  primary_goal TEXT,
  pain_points TEXT[],
  current_tools TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. AI Opportunities Table
CREATE TABLE IF NOT EXISTS ai_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_response_id UUID REFERENCES audit_responses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact TEXT,
  priority INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Contact Requests Table
CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add status column if table already exists
ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';

-- Enable RLS (Row Level Security) - allow anonymous insert for audit scanner
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

-- Allow public insert policies
CREATE POLICY "Allow public insert to businesses" ON businesses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to audit_responses" ON audit_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to ai_opportunities" ON ai_opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to contact_requests" ON contact_requests FOR INSERT WITH CHECK (true);

-- Allow authenticated admin SELECT policies
CREATE POLICY "Allow authenticated admin select on businesses" ON businesses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated admin select on leads" ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated admin select on audit_responses" ON audit_responses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated admin select on ai_opportunities" ON ai_opportunities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated admin select on contact_requests" ON contact_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated admin select on lead_activities" ON lead_activities FOR SELECT TO authenticated USING (true);

-- Allow authenticated admin UPDATE & INSERT policies
CREATE POLICY "Allow authenticated admin update on leads" ON leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated admin update on contact_requests" ON contact_requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated admin insert on lead_activities" ON lead_activities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated admin update on lead_activities" ON lead_activities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

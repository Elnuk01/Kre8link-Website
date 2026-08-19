export interface Business {
  id?: string;
  company_name: string;
  industry?: string;
  description: string;
  company_size?: string;
  created_at?: string;
}

export interface Lead {
  id?: string;
  business_id?: string;
  name: string;
  email: string;
  phone?: string;
  source?: string;
  status?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost' | string;
  created_at?: string;
  // CRM fields
  estimated_value?: number | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent' | string;
  assigned_to?: string | null;
  expected_close_date?: string | null;
  next_follow_up_at?: string | null;
  next_action?: string | null;
  // Joined or resolved business info
  business?: Business;
}

export interface LeadActivity {
  id?: string;
  lead_id: string;
  activity_type: 'created' | 'note' | 'status_change' | 'follow_up' | 'email' | 'call' | string;
  description: string;
  created_at?: string;
  created_by?: string | null;
}

export interface AuditResponse {
  id?: string;
  business_id?: string;
  description?: string;
  primary_goal?: string;
  pain_points?: string[];
  current_tools?: string[];
  created_at?: string;
  // Joined business info & opportunities
  business?: Business;
  opportunities?: AIOpportunity[];
}

export interface AIOpportunity {
  id?: string;
  audit_response_id?: string;
  title: string;
  description: string;
  impact: 'HIGH' | 'MEDIUM' | 'CRITICAL' | string;
  estimatedHoursSaved?: string;
  suggestedTech?: string[];
  priority?: 'HIGH' | 'MEDIUM' | 'LOW' | number | string;
  created_at?: string;
  // Joined info
  business_name?: string;
  audit_response?: AuditResponse;
}

export interface ContactRequest {
  id?: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
  status?: 'new' | 'read' | 'responded' | string;
  created_at?: string;
}

export interface ScannerInput {
  description: string;
  industry?: string;
  departments: string[];
  tools: string[];
  goals: string[];
}

export interface SolutionItem {
  id: string;
  category: string;
  tagline: string;
  description: string;
  examples: string[];
  ctaText: string;
  iconName: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  type: 'Case Study' | 'Prototype' | 'Internal System' | 'Concept';
  problem: string;
  solution: string;
  technologies: string[];
  impactBadge: string;
}

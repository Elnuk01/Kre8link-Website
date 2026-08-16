import { AIOpportunity, ScannerInput } from '../types';

export function calculateOpportunities(input: ScannerInput): AIOpportunity[] {
  const { departments, tools, goals, industry } = input;
  const opps: AIOpportunity[] = [];

  // Industry-specific smart matching
  if (industry) {
    const indLower = industry.toLowerCase();
    if (indLower.includes('logistics') || indLower.includes('supply chain') || indLower.includes('transport')) {
      opps.push({
        title: 'Intelligent Dispatch & Order Tracking AI',
        description: 'Automate shipment tracking updates, proof-of-delivery ingestion, and proactive driver/customer dispatch notifications.',
        impact: 'HIGH',
        priority: 'HIGH',
        estimatedHoursSaved: '16–24 hrs/week',
        suggestedTech: ['Tracking Webhooks', 'Automated SMS/WhatsApp', 'Route Optimizer']
      });
    } else if (indLower.includes('e-commerce') || indLower.includes('retail')) {
      opps.push({
        title: 'Omnichannel Order & Inventory Assistant',
        description: 'Synchronize inventory levels, automate return/exchange workflows, and handle post-purchase inquiries autonomously.',
        impact: 'HIGH',
        priority: 'HIGH',
        estimatedHoursSaved: '14–20 hrs/week',
        suggestedTech: ['Storefront API', 'Inventory Connector', 'Return Assistant']
      });
    } else if (indLower.includes('healthcare') || indLower.includes('medical') || indLower.includes('clinic')) {
      opps.push({
        title: 'Automated Patient Intake & Appointment Assistant',
        description: 'Streamline patient pre-registration, automated appointment reminders, intake form parsing, and reschedule handling.',
        impact: 'HIGH',
        priority: 'HIGH',
        estimatedHoursSaved: '15–20 hrs/week',
        suggestedTech: ['HIPAA-Ready Gateways', 'Calendar Sync', 'Intake Parser']
      });
    } else if (indLower.includes('real estate') || indLower.includes('property')) {
      opps.push({
        title: 'Property Inquiry & Showing Qualifier',
        description: 'Instantly respond to tenant and buyer inquiries, pre-qualify showing requests, and schedule property viewings 24/7.',
        impact: 'HIGH',
        priority: 'HIGH',
        estimatedHoursSaved: '12–18 hrs/week',
        suggestedTech: ['Listing Bot', 'Calendar Booker', 'Lead Pipeline']
      });
    } else if (indLower.includes('finance') || indLower.includes('fintech') || indLower.includes('accounting')) {
      opps.push({
        title: 'Automated Invoicing & Reconciliation Assistant',
        description: 'Extract invoice data from PDFs/emails, perform automatic 3-way matching, and notify team of payment discrepancies.',
        impact: 'HIGH',
        priority: 'HIGH',
        estimatedHoursSaved: '14–20 hrs/week',
        suggestedTech: ['Document AI', 'Bank Feeds', 'Reconciliation Rules']
      });
    }
  }

  // 1. Customer Service
  if (
    departments.includes('Customer service') ||
    goals.includes('Improve customer service') ||
    tools.includes('WhatsApp')
  ) {
    opps.push({
      title: 'AI Customer Service Agent',
      description: 'Automate customer enquiries, FAQ responses, qualification and routing across WhatsApp and web channels.',
      impact: 'HIGH',
      priority: 'HIGH',
      estimatedHoursSaved: '15–22 hrs/week',
      suggestedTech: ['WhatsApp API', 'Conversational AI', 'CRM Routing']
    });
  }

  // 2. Sales
  if (
    departments.includes('Sales') ||
    goals.includes('Increase sales') ||
    tools.includes('CRM')
  ) {
    opps.push({
      title: 'AI Lead Qualification & Follow-up',
      description: 'Automatically qualify incoming leads, follow up with prospects and route high-intent leads to the sales team.',
      impact: 'HIGH',
      priority: 'HIGH',
      estimatedHoursSaved: '12–18 hrs/week',
      suggestedTech: ['CRM Webhooks', 'Automated Sequences', 'Calendar Sync']
    });
  }

  // 3. Operations
  if (
    departments.includes('Operations') ||
    goals.includes('Reduce costs') ||
    goals.includes('Save time') ||
    goals.includes('Scale operations')
  ) {
    opps.push({
      title: 'Business Process Automation',
      description: 'Automate repetitive operational tasks, notifications, data movement and workflow triggers.',
      impact: 'HIGH',
      priority: 'HIGH',
      estimatedHoursSaved: '18–25 hrs/week',
      suggestedTech: ['Workflow Engine', 'API Gateway', 'Database Triggers']
    });
  }

  // 4. Reporting
  if (
    departments.includes('Reporting') ||
    goals.includes('Understand data') ||
    tools.includes('Excel') ||
    tools.includes('Google Sheets')
  ) {
    opps.push({
      title: 'Automated Business Intelligence',
      description: 'Automatically collect operational information and generate management reports and insights.',
      impact: 'MEDIUM',
      priority: 'MEDIUM',
      estimatedHoursSaved: '10–14 hrs/week',
      suggestedTech: ['Data Pipeline', 'Executive Summarizer', 'Dashboard']
    });
  }

  // 5. Finance
  if (
    departments.includes('Finance') ||
    tools.includes('Accounting software')
  ) {
    opps.push({
      title: 'Financial Operations Intelligence',
      description: 'Automate financial reporting, payment monitoring and business performance analysis.',
      impact: 'HIGH',
      priority: 'HIGH',
      estimatedHoursSaved: '12–16 hrs/week',
      suggestedTech: ['Accounting Connector', 'Reconciliation AI', 'Alert Gateway']
    });
  }

  // 6. Marketing
  if (departments.includes('Marketing')) {
    opps.push({
      title: 'AI Marketing & Campaign Orchestration',
      description: 'Automate lead lead-magnet distribution, personalized campaign messaging, and response monitoring.',
      impact: 'MEDIUM',
      priority: 'MEDIUM',
      estimatedHoursSaved: '8–12 hrs/week',
      suggestedTech: ['Marketing Webhooks', 'Content AI', 'Social API']
    });
  }

  // Fallback if selections yield fewer than 3 opportunities
  if (opps.length < 3) {
    opps.push({
      title: 'Internal AI Knowledge Base & Assistant',
      description: 'Transform company manuals, SOPs, and internal guidelines into a private, searchable AI assistant for staff.',
      impact: 'MEDIUM',
      priority: 'MEDIUM',
      estimatedHoursSaved: '8–12 hrs/week',
      suggestedTech: ['Document AI', 'Vector Search', 'Role Access']
    });
  }

  return opps.slice(0, 4);
}


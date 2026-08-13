import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "Kre8link API", timestamp: new Date().toISOString() });
  });

  // AI Opportunity Audit API route
  app.post("/api/audit", async (req, res) => {
    try {
      const { description, departments = [], tools = [], goals = [] } = req.body;

      if (!description) {
        return res.status(400).json({ error: "Business description is required" });
      }

      // Check if Gemini API Key is available for enhanced reasoning
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const prompt = `You are a senior AI Transformation Architect at Kre8link.
Analyze this business and generate 4 high-impact AI/Automation opportunities.

Business Description: "${description}"
Target Departments/Time Sinks: ${departments.join(", ") || "General Operations"}
Current Tools: ${tools.join(", ") || "Standard software"}
Primary Goals: ${goals.join(", ") || "Efficiency and growth"}

Respond ONLY with valid JSON in this exact structure:
{
  "opportunities": [
    {
      "title": "Short descriptive title",
      "impact": "HIGH" or "MEDIUM",
      "description": "2-sentence concrete explanation of how Kre8link can build this AI/automation system.",
      "estimatedHoursSaved": "e.g. 15-20 hrs/week",
      "suggestedTech": ["WhatsApp API", "n8n", "OpenAI", etc]
    }
  ],
  "summary": "1-2 sentence executive summary of the business's automation readiness."
}`;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json"
            }
          });

          if (response.text) {
            const parsed = JSON.parse(response.text);
            return res.json({
              success: true,
              source: "gemini-ai",
              ...parsed
            });
          }
        } catch (aiErr) {
          console.warn("Gemini API call failed, falling back to rule engine:", aiErr);
        }
      }

      // Rule-based fallback system if Gemini is unavailable
      const opportunities = [
        {
          title: "Customer Enquiry & Qualification Automation",
          impact: "HIGH",
          description: `Deploy a Kre8link AI Agent to handle inbound enquiries across ${tools.includes("WhatsApp") ? "WhatsApp and " : ""}email. Automatically qualify leads and sync with CRM.`,
          estimatedHoursSaved: "12-18 hrs/week",
          suggestedTech: ["AI Customer Agent", "WhatsApp API", "CRM Sync"]
        },
        {
          title: "Automated Lead Follow-up & Recovery System",
          impact: "HIGH",
          description: `Eliminate manual follow-ups. Build an automated lead nurturing pipeline that engages prospects and schedules sales meetings automatically.`,
          estimatedHoursSaved: "10-15 hrs/week",
          suggestedTech: ["Lead Nurturing Workflow", "Calendar Integration", "SMS/Email API"]
        },
        {
          title: "Unified Business Intelligence & Reporting",
          impact: "MEDIUM",
          description: `Consolidate data trapped in ${tools.includes("Excel") || tools.includes("Google Sheets") ? "spreadsheets" : "siloed systems"} into an automated daily executive report and dashboard.`,
          estimatedHoursSaved: "8-12 hrs/week",
          suggestedTech: ["Supabase Data Pipeline", "Automated AI Summary", "Slack/Email Dispatch"]
        },
        {
          title: "Cross-System Workflow Automation",
          impact: "HIGH",
          description: `Connect ${tools.slice(0, 3).join(", ") || "disparate tools"} with intelligent trigger-action pipelines so your team stops copying and pasting data.`,
          estimatedHoursSaved: "15-25 hrs/week",
          suggestedTech: ["n8n / Make Engine", "Webhook Gateway", "Data Transformation"]
        }
      ];

      return res.json({
        success: true,
        source: "rule-engine",
        opportunities,
        summary: `Kre8link identified key bottlenecks in your ${departments.join(" & ") || "operational"} workflows that can be transformed into autonomous background systems.`
      });
    } catch (err: any) {
      console.error("Audit API Error:", err);
      return res.status(500).json({ error: "Failed to generate AI opportunities." });
    }
  });

  // Contact / Audit submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, company, message, auditData } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
      }

      console.log("Received Kre8link Contact Submission:", { name, email, company, message, auditData });

      return res.json({
        success: true,
        message: "Thank you. Your consultation request has been received. Kre8link will review your business bottlenecks and reach out within 24 hours."
      });
    } catch (err) {
      console.error("Contact API Error:", err);
      return res.status(500).json({ error: "Failed to process request." });
    }
  });

  // Vite development middleware vs Static Production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`[Kre8link] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

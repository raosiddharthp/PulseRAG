import { GoogleGenAI, Type } from '@google/genai';
import { ClassifyResult } from '../shared/types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_GUIDANCE = `You are the intent classifier for PulseRAG, an enterprise query federation system.
Given a natural language query, determine which connectors are needed:
- crm: deal stage, pipeline value, close dates, account risk flags (Salesforce)
- erp: inventory, fulfilment, SKU stock levels, reorder thresholds (SAP)
- ticketing: open support tickets, SLA status, account friction/issues (Jira)

Signals like "issues", "friction", "problems affecting an account" typically indicate ticketing is relevant, even if not named explicitly.

Worked example 1 (table, high sensitivity): "Which of our at-risk deals this quarter have fulfilment issues that could affect close?" — asks about specific named accounts, individually actionable, time-critical, best shown as a row-per-account comparison. connectors: [crm, erp, ticketing], format: table, sensitivity: high.

Worked example 2 (chart, medium sensitivity): "How is our Q2 pipeline tracking against target by deal stage?" — asks for an aggregate summary across all deals grouped by stage, best shown as a trend/comparison visualization, not a per-account breakdown. connectors: [crm], format: chart, sensitivity: medium.

Worked example 3 (cards, high sensitivity): "How many open P1 tickets do we have and which accounts are at SLA breach risk?" — asks about multiple distinct entities (accounts) each needing an individual status summary, best shown as one card per account rather than a dense table. connectors: [ticketing], format: cards, sensitivity: high.

Worked example 4 (prose, low sensitivity): "What is the status of the Acme Corp account?" — asks about a single entity, a short explanatory answer is sufficient, no structured comparison needed. connectors: [crm, ticketing], format: prose, sensitivity: low.

Rule of thumb: format is "table" for multi-account comparisons with several fields per account, "chart" for aggregate trends/summaries, "cards" for a status check across several distinct entities, "prose" for a single-entity or single-fact answer. Sensitivity is high only when the query is about specific, named accounts requiring an immediate decision. Aggregate, summary, or trend queries across many records are medium, even if they mention deals or stages.`;

export async function classifyIntent(query: string): Promise<ClassifyResult> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: `${SYSTEM_GUIDANCE}\n\nQuery: "${query}"`,
    config: {
      temperature: 0,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          connectors: {
            type: Type.ARRAY,
            items: { type: Type.STRING, enum: ['crm', 'erp', 'ticketing'] },
          },
          format: {
            type: Type.STRING,
            enum: ['table', 'chart', 'cards', 'prose'],
          },
          sensitivity: {
            type: Type.STRING,
            enum: ['high', 'medium', 'low'],
          },
        },
        required: ['connectors', 'format', 'sensitivity'],
      },
    },
  });

  return JSON.parse(response.text ?? '{}') as ClassifyResult;
}

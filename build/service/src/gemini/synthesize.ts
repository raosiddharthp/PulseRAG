import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    format: { type: Type.STRING, enum: ['table', 'chart', 'cards', 'prose'] },
    table: {
      type: Type.OBJECT,
      nullable: true,
      properties: {
        columns: { type: Type.ARRAY, items: { type: Type.STRING } },
        rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      },
    },
    chart: {
      type: Type.OBJECT,
      nullable: true,
      properties: {
        label: { type: Type.STRING },
        series: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } },
            required: ['name', 'value'],
          },
        },
      },
    },
    cards: {
      type: Type.ARRAY,
      nullable: true,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          status: { type: Type.STRING, enum: ['high', 'med', 'low', 'none'] },
        },
        required: ['title', 'subtitle', 'status'],
      },
    },
    prose: { type: Type.STRING, nullable: true },
  },
  required: ['format'],
};

export async function synthesize(query: string, format: string, connectorData: Record<string, any>) {
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: `Query: "${query}"\n\nRequired output format: ${format}\n\nConnector data:\n${JSON.stringify(connectorData, null, 2)}\n\nSynthesise a grounded answer joining these sources. Populate ONLY the field matching the required format (table, chart, cards, or prose) — leave the other three null. For "table": include every account/item present, even healthy ones, as rows. For "chart": aggregate into named series with numeric values, using each deal's current value regardless of its close date — do not filter or zero out deals based on quarter, timing, or close date unless the query explicitly asks about a specific time window. Include EVERY distinct category/stage present in the connector data as its own series entry — do not omit any. For "cards": one card per entity with a status of high/med/low/none. For "prose": a single explanatory sentence, no structured data.`,
    config: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema,
    },
  });

  return JSON.parse(response.text ?? '{}');
}

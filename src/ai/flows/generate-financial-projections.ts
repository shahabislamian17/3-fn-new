'use server';
/**
 * @fileOverview Generates 3-year cash flow and P&L projections for project owners.
 *
 * - generateFinancialProjections - A function that generates the financial projections.
 * - GenerateFinancialProjectionsInput - The input type for the generateFinancialProjections function.
 * - GenerateFinancialProjectionsOutput - The return type for the generateFinancialProjections function.
 */

import { z } from 'zod';

const GenerateFinancialProjectionsInputSchema = z.object({
  industry: z.string().describe('The industry of the project.'),
  country: z.string().describe('The country of the project.'),
  currency: z.string().describe('The currency of the project.'),
  projectDescription: z.string().describe('A detailed description of the project, including its business model and objectives.'),
  historicalRevenue: z.number().optional().describe('The historical revenue of the project (if any).'),
  headcount: z.number().describe('The headcount of the project.'),
  plannedCapex: z.number().describe('The planned capital expenditure of the project.'),
  grossMarginAssumptions: z.number().describe('The gross margin assumptions of the project (as a percentage).'),
  pricingModel: z.string().describe('The pricing model of the project (e.g., subscription, one-time purchase).'),
  customerAcquisitionCost: z.number().describe('The customer acquisition cost (CAC) of the project.'),
  retentionMetrics: z.number().optional().describe('The retention metrics of the project (e.g., monthly churn rate as a percentage, if SaaS).'),
  seasonalityFlags: z.string().describe('The seasonality flags of the project (e.g., "High in Q4", "Low in summer").'),
  taxes: z.number().describe('The applicable corporate tax rate (as a percentage).'),
  financingCosts: z.number().describe('The financing costs or interest expenses.'),
});
export type GenerateFinancialProjectionsInput = z.infer<typeof GenerateFinancialProjectionsInputSchema>;

const ProjectionYearSchema = z.object({
  year: z.number(),
  revenue: z.number(),
  cogs: z.number(),
  grossMargin: z.number(),
  opex: z.number(),
  ebitda: z.number(),
});

const CashflowQuarterSchema = z.object({
  year: z.number(),
  quarter: z.string(), // "Q1", "Q2", "Q3", "Q4"
  receipts: z.number(),
  payments: z.number(),
  netCashflow: z.number(),
});

const GenerateFinancialProjectionsOutputSchema = z.object({
  projections: z.array(ProjectionYearSchema).describe('A 3-year annual P&L projection (revenues, COGS, gross margin, OpEx, EBITDA).'),
  cashflowForecast: z.array(CashflowQuarterSchema).describe('A 3-year quarterly cashflow forecast (receipts, payments, net cashflow).'),
  breakEvenAnalysis: z.string().describe('The break-even analysis (month & revenue).'),
  repaymentSchedule: z.string().describe('For royalty models, a projected monthly repayment schedule and the date when the investment multiple is expected to be reached under baseline, fast, and slow scenarios.'),
  equityValuationPath: z.string().describe('For equity models, projected exit valuation scenarios (baseline, high, low) and the implied ROI for investors.'),
  sensitivityAnalysis: z.string().describe('A summary of sensitivity analysis: +/- 20% scenarios for revenue & margin.'),
  assumptions: z.array(z.string()).describe('A list of key assumptions made for transparency.'),
});
export type GenerateFinancialProjectionsOutput = z.infer<typeof GenerateFinancialProjectionsOutputSchema>;

/**
 * Generates financial projections using FREE Google AI Studio API
 */
export async function generateFinancialProjections(input: GenerateFinancialProjectionsInput): Promise<GenerateFinancialProjectionsOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Please get a free API key from https://aistudio.google.com/app/apikey');
  }

  try {
    const prompt = `You are an expert financial modeler for a crowdfunding platform. Your task is to generate a realistic 3-year financial projection based on the provided project details.

Your output MUST be a valid JSON object that adheres to the specified output schema.

**Project Details:**
- **Industry:** ${input.industry}
- **Country:** ${input.country}
- **Currency:** ${input.currency}
- **Description:** ${input.projectDescription}
- **Historical Revenue (annual):** ${input.historicalRevenue || 'None'}
- **Team Size (Headcount):** ${input.headcount}
- **Planned Capital Expenditure:** ${input.plannedCapex}
- **Gross Margin Assumption:** ${input.grossMarginAssumptions}%
- **Pricing Model:** ${input.pricingModel}
- **Customer Acquisition Cost (CAC):** ${input.customerAcquisitionCost}
- **Retention Metrics (e.g., churn):** ${input.retentionMetrics || 'Not specified'}%
- **Seasonality:** ${input.seasonalityFlags}
- **Tax Rate:** ${input.taxes}%
- **Financing Costs:** ${input.financingCosts}

**Instructions:**

1. **3-Year P&L Projections (Annual):**
   - Create an array of 3 objects, one for each year (year: 1, 2, 3).
   - Project revenue growth based on industry, CAC, retention, and market trends. Be realistic. For a new company, Year 1 should show modest revenue, with growth accelerating in Years 2 and 3.
   - Calculate Cost of Goods Sold (COGS) based on the gross margin assumption.
   - Calculate Gross Margin (Revenue - COGS).
   - Estimate Operating Expenses (OpEx). Consider headcount (salaries), marketing (related to CAC), R&D, and G&A. OpEx should grow as the company scales.
   - Calculate EBITDA (Gross Margin - OpEx).

2. **3-Year Cashflow Forecast (Quarterly):**
   - Create an array of 12 objects, one for each quarter over the 3 years (year: 1-3, quarter: "Q1", "Q2", "Q3", "Q4").
   - Estimate quarterly cash receipts (primarily from revenue).
   - Estimate quarterly cash payments (COGS, OpEx, Capex, Taxes, Financing Costs).
   - Calculate the net cash flow for each quarter.

3. **Break-Even Analysis:**
   - Provide a short text analysis estimating the month and revenue level at which the project is expected to become profitable (EBITDA positive).

4. **Repayment Schedule (for Royalty Models):**
   - Generate a projected monthly repayment schedule based on the projected monthly revenues.
   - Use the formula: Payment_t = royalty_rate * revenue_t.
   - Accumulate these payments until the total investment multiple is reached.
   - Estimate the month when the investment multiple will be reached under three scenarios: baseline, fast (+20% revenue), and slow (-20% revenue).
   - If not a royalty model, state "Not applicable for equity model".

5. **Equity Valuation Path (for Equity Models):**
   - Project exit valuation scenarios for Year 3 (baseline, high, low) based on industry multiples.
   - Calculate the implied Return on Investment (ROI) for investors based on these scenarios. If not an equity model, state "Not applicable for royalty model".

6. **Sensitivity Analysis:**
   - Provide a brief text summary describing how a +/- 20% change in revenue and gross margin would impact the final year's EBITDA.

7. **Assumptions:**
   - List the key assumptions you made to generate the model (e.g., "Revenue growth is projected at X% in Y1, Y% in Y2... based on market trends.", "OpEx is estimated as a percentage of revenue plus fixed costs for salaries."). This is critical for transparency.

**IMPORTANT:** You MUST return ONLY valid JSON that matches this exact schema:
{
  "projections": [
    {"year": 1, "revenue": number, "cogs": number, "grossMargin": number, "opex": number, "ebitda": number},
    {"year": 2, "revenue": number, "cogs": number, "grossMargin": number, "opex": number, "ebitda": number},
    {"year": 3, "revenue": number, "cogs": number, "grossMargin": number, "opex": number, "ebitda": number}
  ],
  "cashflowForecast": [
    {"year": 1, "quarter": "Q1", "receipts": number, "payments": number, "netCashflow": number},
    ... (12 quarters total)
  ],
  "breakEvenAnalysis": "string",
  "repaymentSchedule": "string",
  "equityValuationPath": "string",
  "sensitivityAnalysis": "string",
  "assumptions": ["string", ...]
}

Generate the projections now. Return ONLY the JSON, no markdown, no code blocks.`;

    // Try to find an available model
    let availableModel: string | null = null;
    try {
      const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
      const listResponse = await fetch(listUrl);
      if (listResponse.ok) {
        const listData = await listResponse.json();
        const models = listData.models || [];
        for (const model of models) {
          const supportedMethods = model.supportedGenerationMethods || [];
          if (supportedMethods.includes('generateContent')) {
            const modelName = model.name.replace(/^models\//, '');
            if (modelName.includes('pro')) {
              availableModel = modelName; // Use pro for complex financial modeling
              break;
            }
          }
        }
        // If no pro model found, try flash
        if (!availableModel) {
          for (const model of models) {
            const supportedMethods = model.supportedGenerationMethods || [];
            if (supportedMethods.includes('generateContent')) {
              const modelName = model.name.replace(/^models\//, '');
              if (modelName.includes('flash')) {
                availableModel = modelName;
                break;
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not list models, will try common model names:', e);
    }

    const modelsToTry = availableModel
      ? [availableModel, 'gemini-1.5-pro', 'gemini-1.5-flash']
      : ['gemini-1.5-pro', 'gemini-1.5-flash'];
    const uniqueModels = [...new Set(modelsToTry)];

    let lastError: Error | null = null;
    for (const modelName of uniqueModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          if (modelName === uniqueModels[uniqueModels.length - 1]) {
            throw new Error(`API returned ${response.status}: ${errorText}`);
          }
          console.warn(`Model ${modelName} failed (${response.status}), trying next...`);
          lastError = new Error(`API returned ${response.status}: ${errorText}`);
          continue;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error('No text in API response');
        }

        let jsonText = text.trim();
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(jsonText);
        const validated = GenerateFinancialProjectionsOutputSchema.parse(parsed);
        return validated;
      } catch (error: any) {
        lastError = error;
        if (modelName === uniqueModels[uniqueModels.length - 1]) {
          throw error;
        }
        console.warn(`Model ${modelName} failed, trying next...`, error.message);
        continue;
      }
    }

    throw lastError || new Error('All models failed');
  } catch (error: any) {
    console.error('Error in generateFinancialProjections:', error);
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid response format from AI: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      );
    }
    throw new Error(
      `Failed to generate financial projections: ${error.message || 'Unknown error'}. ` +
      `Please check your GEMINI_API_KEY environment variable.`
    );
  }
}

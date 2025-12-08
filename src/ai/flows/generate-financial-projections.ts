'use server';
/**
 * @fileOverview Generates 3-year cash flow and P&L projections for project owners.
 *
 * - generateFinancialProjections - A function that generates the financial projections.
 * - GenerateFinancialProjectionsInput - The input type for the generateFinancialProjections function.
 * - GenerateFinancialProjectionsOutput - The return type for the generateFinancialProjections function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

export async function generateFinancialProjections(input: GenerateFinancialProjectionsInput): Promise<GenerateFinancialProjectionsOutput> {
  return generateFinancialProjectionsFlow(input);
}

const generateFinancialProjectionsPrompt = ai.definePrompt({
  name: 'generateFinancialProjectionsPrompt',
  input: {schema: GenerateFinancialProjectionsInputSchema},
  output: {schema: GenerateFinancialProjectionsOutputSchema},
  prompt: `You are an expert financial modeler for a crowdfunding platform. Your task is to generate a realistic 3-year financial projection based on the provided project details.

  Your output MUST be a valid JSON object that adheres to the specified output schema.

  **Project Details:**
  - **Industry:** {{{industry}}}
  - **Country:** {{{country}}}
  - **Currency:** {{{currency}}}
  - **Description:** {{{projectDescription}}}
  - **Historical Revenue (annual):** {{{historicalRevenue}}}
  - **Team Size (Headcount):** {{{headcount}}}
  - **Planned Capital Expenditure:** {{{plannedCapex}}}
  - **Gross Margin Assumption:** {{{grossMarginAssumptions}}}%
  - **Pricing Model:** {{{pricingModel}}}
  - **Customer Acquisition Cost (CAC):** {{{customerAcquisitionCost}}}
  - **Retention Metrics (e.g., churn):** {{{retentionMetrics}}}%
  - **Seasonality:** {{{seasonalityFlags}}}
  - **Tax Rate:** {{{taxes}}}%
  - **Financing Costs:** {{{financingCosts}}}

  **Instructions:**

  1.  **3-Year P&L Projections (Annual):**
      - Create an array of 3 objects, one for each year.
      - Project revenue growth based on industry, CAC, retention, and market trends. Be realistic. For a new company, Year 1 should show modest revenue, with growth accelerating in Years 2 and 3.
      - Calculate Cost of Goods Sold (COGS) based on the gross margin assumption.
      - Calculate Gross Margin (Revenue - COGS).
      - Estimate Operating Expenses (OpEx). Consider headcount (salaries), marketing (related to CAC), R&D, and G&A. OpEx should grow as the company scales.
      - Calculate EBITDA (Gross Margin - OpEx).

  2.  **3-Year Cashflow Forecast (Quarterly):**
      - Create an array of 12 objects, one for each quarter over the 3 years.
      - Estimate quarterly cash receipts (primarily from revenue).
      - Estimate quarterly cash payments (COGS, OpEx, Capex, Taxes, Financing Costs).
      - Calculate the net cash flow for each quarter.

  3.  **Break-Even Analysis:**
      - Provide a short text analysis estimating the month and revenue level at which the project is expected to become profitable (EBITDA positive).

  4.  **Repayment Schedule (for Royalty Models):**
      - Generate a projected monthly repayment schedule based on the projected monthly revenues.
      - Use the formula: Payment_t = royalty_rate * revenue_t.
      - Accumulate these payments until the total investment multiple is reached.
      - Estimate the month when the investment multiple will be reached under three scenarios: baseline, fast (+20% revenue), and slow (-20% revenue).
      - If not a royalty model, state "Not applicable for equity model".

  5.  **Equity Valuation Path (for Equity Models):**
      - Project exit valuation scenarios for Year 3 (baseline, high, low) based on industry multiples.
      - Calculate the implied Return on Investment (ROI) for investors based on these scenarios. If not an equity model, state "Not applicable for royalty model".

  6.  **Sensitivity Analysis:**
      - Provide a brief text summary describing how a +/- 20% change in revenue and gross margin would impact the final year's EBITDA.

  7.  **Assumptions:**
      - List the key assumptions you made to generate the model (e.g., "Revenue growth is projected at X% in Y1, Y% in Y2... based on market trends.", "OpEx is estimated as a percentage of revenue plus fixed costs for salaries."). This is critical for transparency.

  Generate the projections now.`,
});

const generateFinancialProjectionsFlow = ai.defineFlow(
  {
    name: 'generateFinancialProjectionsFlow',
    inputSchema: GenerateFinancialProjectionsInputSchema,
    outputSchema: GenerateFinancialProjectionsOutputSchema,
  },
  async input => {
    const {output} = await generateFinancialProjectionsPrompt(input);
    return output!;
  }
);

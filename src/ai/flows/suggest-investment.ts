'use server';

/**
 * @fileOverview AI agent to provide investment analysis for a potential investor.
 *
 * - suggestInvestment - Provides a risk score and personalized investment scenario.
 * - SuggestInvestmentInput - The input type for the suggestInvestment function.
 * - SuggestInvestmentOutput - The return type for the suggestInvestment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialProjectionSchema = z.object({
  month: z.string(),
  revenue: z.number(),
  ebitda: z.number(),
});

const SuggestInvestmentInputSchema = z.object({
  projectType: z.enum(['Equity', 'Royalty']).describe('The funding type of the project.'),
  projectDescription: z.string().describe('A detailed description of the project.'),
  sector: z.string().describe('The sector of the project.'),
  region: z.string().describe('The geographical region of the project.'),
  valuation: z.number().optional().describe('The pre-money valuation of the company (for equity projects).'),
  equityOffered: z.number().optional().describe('The percentage of equity offered for the total target amount (for equity projects).'),
  royaltyRate: z.number().optional().describe('The percentage of revenue shared with investors (for royalty projects).'),
  repaymentMultiple: z.number().optional().describe('The investment multiple to be paid back to royalty investors.'),
  investmentAmount: z.number().describe('The amount the investor is considering investing.'),
  targetAmount: z.number().describe('The total funding target for the campaign.'),
  currency: z.string().describe('The currency of the project.'),
  projectFinancials: z.array(FinancialProjectionSchema).optional().describe('The financial projections for the project.'),
});
export type SuggestInvestmentInput = z.infer<typeof SuggestInvestmentInputSchema>;

const SuggestInvestmentOutputSchema = z.object({
  riskScore: z.enum(['Low', 'Medium', 'High']).describe('A simplified risk score (Low, Medium, High).'),
  riskReasoning: z.string().describe('A brief explanation for the assigned risk score, considering sector, region, and business model.'),
  investmentScenario: z.string().describe('A personalized sentence illustrating the potential return. For Equity: "An investment of $X would secure approximately Y% ownership." For Royalty: "An investment of $X could potentially return $Y over a projected payback period of Z months."'),
  disclaimer: z.string().describe('A standard legal disclaimer stating that this is not financial advice and is for illustrative purposes only.'),
});
export type SuggestInvestmentOutput = z.infer<typeof SuggestInvestmentOutputSchema>;


export async function suggestInvestment(
  input: SuggestInvestmentInput
): Promise<SuggestInvestmentOutput> {
  return suggestInvestmentFlow(input);
}


const suggestInvestmentPrompt = ai.definePrompt({
  name: 'suggestInvestmentPrompt',
  input: {schema: SuggestInvestmentInputSchema},
  output: {schema: SuggestInvestmentOutputSchema},
  prompt: `You are a financial analyst providing illustrative information to a potential investor on a crowdfunding platform.
  Your tone should be neutral and informative. You must not give financial advice. The currency for all financial values is {{{currency}}}.

  **Project Details:**
  - Type: {{{projectType}}}
  - Sector: {{{sector}}}
  - Region: {{{region}}}
  - Description: {{{projectDescription}}}
  - Funding Target: {{{targetAmount}}}
  - Proposed Investment: {{{investmentAmount}}}
  - Financial Projections: {{{json projectFinancials}}}

  **Instructions:**

  1.  **Risk Score:**
      - Assess the project based on the provided data (sector, region, description, financials).
      - Assign a simple risk score: "Low", "Medium", or "High".
      - Provide a brief, high-level reasoning for the score. For example, a tech startup in a competitive market might be "High" risk, while a real estate project with existing tenants might be "Low".

  2.  **Investment Scenario:**
      - Based on the project type, create a single, clear sentence.
      - **For Equity projects:** Calculate the approximate ownership percentage for the proposed investment. The formula is: ({{{investmentAmount}}} / {{{valuation}}}) * 100. Phrase it like: "An investment of $... would secure approximately ...% ownership."
      - **For Royalty projects:** Calculate the total potential return based on the repayment multiple. The formula is: {{{investmentAmount}}} * {{{repaymentMultiple}}}. Then, estimate the payback period in months based on the projected average monthly revenue from the provided financials and the royalty rate. Phrase it like: "An investment of $... could potentially return a total of $... over a projected payback period of ... months."

  3.  **Disclaimer:**
      - ALWAYS include the following disclaimer: "This information is for illustrative purposes only and does not constitute financial advice. All investments carry risk, and you should conduct your own due diligence."

  Generate the analysis now.`,
});


const suggestInvestmentFlow = ai.defineFlow(
  {
    name: 'suggestInvestmentFlow',
    inputSchema: SuggestInvestmentInputSchema,
    outputSchema: SuggestInvestmentOutputSchema,
  },
  async input => {
    const {output} = await suggestInvestmentPrompt(input);
    return output!;
  }
);

'use server';

/**
 * @fileOverview AI agent to provide investment analysis for a potential investor.
 *
 * - suggestInvestment - Provides a risk score and personalized investment scenario.
 * - SuggestInvestmentInput - The input type for the suggestInvestment function.
 * - SuggestInvestmentOutput - The return type for the suggestInvestment function.
 */

import { z } from 'zod';

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

/**
 * Suggests investment analysis using FREE Google AI Studio API
 */
export async function suggestInvestment(
  input: SuggestInvestmentInput
): Promise<SuggestInvestmentOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Please get a free API key from https://aistudio.google.com/app/apikey');
  }

  try {
    const financialsJson = input.projectFinancials ? JSON.stringify(input.projectFinancials) : 'None provided';
    
    const prompt = `You are a financial analyst providing illustrative information to a potential investor on a crowdfunding platform.
Your tone should be neutral and informative. You must not give financial advice. The currency for all financial values is ${input.currency}.

**Project Details:**
- Type: ${input.projectType}
- Sector: ${input.sector}
- Region: ${input.region}
- Description: ${input.projectDescription}
- Funding Target: ${input.targetAmount}
- Proposed Investment: ${input.investmentAmount}
- Valuation: ${input.valuation || 'Not specified'}
- Equity Offered: ${input.equityOffered || 'Not specified'}%
- Royalty Rate: ${input.royaltyRate || 'Not specified'}%
- Repayment Multiple: ${input.repaymentMultiple || 'Not specified'}x
- Financial Projections: ${financialsJson}

**Instructions:**

1. **Risk Score:**
   - Assess the project based on the provided data (sector, region, description, financials).
   - Assign a simple risk score: "Low", "Medium", or "High".
   - Provide a brief, high-level reasoning for the score. For example, a tech startup in a competitive market might be "High" risk, while a real estate project with existing tenants might be "Low".

2. **Investment Scenario:**
   - Based on the project type, create a single, clear sentence.
   - **For Equity projects:** Calculate the approximate ownership percentage for the proposed investment. The formula is: (${input.investmentAmount} / ${input.valuation || input.targetAmount}) * 100. Phrase it like: "An investment of ${input.currency}${input.investmentAmount} would secure approximately ...% ownership."
   - **For Royalty projects:** Calculate the total potential return based on the repayment multiple. The formula is: ${input.investmentAmount} * ${input.repaymentMultiple || 2}. Then, estimate the payback period in months based on the projected average monthly revenue from the provided financials and the royalty rate. Phrase it like: "An investment of ${input.currency}${input.investmentAmount} could potentially return a total of ${input.currency}... over a projected payback period of ... months."

3. **Disclaimer:**
   - ALWAYS include the following disclaimer: "This information is for illustrative purposes only and does not constitute financial advice. All investments carry risk, and you should conduct your own due diligence."

**IMPORTANT:** You MUST return ONLY valid JSON that matches this exact schema:
{
  "riskScore": "Low" | "Medium" | "High",
  "riskReasoning": "string",
  "investmentScenario": "string",
  "disclaimer": "string"
}

Generate the analysis now. Return ONLY the JSON, no markdown, no code blocks.`;

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
            if (modelName.includes('flash')) {
              availableModel = modelName;
              break;
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not list models, will try common model names:', e);
    }

    const modelsToTry = availableModel
      ? [availableModel, 'gemini-1.5-flash', 'gemini-1.5-pro']
      : ['gemini-1.5-flash', 'gemini-1.5-pro'];
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
        const validated = SuggestInvestmentOutputSchema.parse(parsed);
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
    console.error('Error in suggestInvestment:', error);
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid response format from AI: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      );
    }
    throw new Error(
      `Failed to suggest investment: ${error.message || 'Unknown error'}. ` +
      `Please check your GEMINI_API_KEY environment variable.`
    );
  }
}

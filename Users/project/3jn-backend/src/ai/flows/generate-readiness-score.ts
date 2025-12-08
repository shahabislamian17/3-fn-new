
'use server';
/**
 * @fileOverview AI agent to assess a project's investment readiness.
 *
 * - generateReadinessScore - Analyzes a project and returns competitiveness and success scores.
 * - GenerateReadinessScoreInput - The input type for the generateReadinessScore function.
 * - GenerateReadinessScoreOutput - The return type for the generateReadinessScore function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateReadinessScoreInputSchema = z.object({
  sector: z.string().describe('The sector or category of the project.'),
  location: z.string().describe('The geographical location of the project.'),
  stage: z.string().describe('The current stage of the project (e.g., Seed, Growth).'),
  fundingType: z.enum(['Equity', 'Royalty']).describe('The project\'s funding model.'),
  targetAmount: z.number().describe('The funding target amount.'),
  valuation: z.number().optional().describe('The pre-money valuation of the project (for equity).'),
  description: z.string().describe('The detailed summary of the project, including its mission and product.'),
  competitors: z.string().optional().describe('A list of known competitors.'),
  differentiator: z.string().optional().describe('The project\'s main unique selling proposition or differentiator.'),
});
export type GenerateReadinessScoreInput = z.infer<typeof GenerateReadinessScoreInputSchema>;

const GenerateReadinessScoreOutputSchema = z.object({
  competitivenessScore: z.number().min(0).max(10).describe('A score from 0 to 10 for market competitiveness.'),
  successScore: z.number().min(0).max(10).describe('A score from 0 to 10 for prospect of success.'),
  summary: z.string().describe('A 50-100 word justification for the scores.'),
  improvementPlan: z.array(z.string()).describe('A tailored, actionable improvement plan based on the scores.'),
});
export type GenerateReadinessScoreOutput = z.infer<typeof GenerateReadinessScoreOutputSchema>;

export async function generateReadinessScore(input: GenerateReadinessScoreInput): Promise<GenerateReadinessScoreOutput> {
  return generateReadinessScoreFlow(input);
}

const generateReadinessScorePrompt = ai.definePrompt({
  name: 'generateReadinessScorePrompt',
  input: { schema: GenerateReadinessScoreInputSchema },
  output: { schema: GenerateReadinessScoreOutputSchema },
  prompt: `You are an expert investment analyst specializing in early-stage startups and crowdfunding campaigns.
  Your task is to provide an AI-assessed "Investment Readiness" score.

  **Project Details:**
  - Sector: {{{sector}}}
  - Location: {{{location}}}
  - Stage: {{{stage}}}
  - Funding Model: {{{fundingType}}}
  - Funding Target: {{{targetAmount}}}
  - Valuation: {{{valuation}}}
  - Description: {{{description}}}
  - Known Competitors: {{{competitors}}}
  - Main Differentiator: {{{differentiator}}}

  **Instructions:**

  1.  **Assess Competitiveness (0-10):**
      - **High (8-10):** Niche market, strong differentiator, clear IP or cost advantage, few direct competitors.
      - **Moderate (5-7):** Competitive market but with a solid unique selling proposition. Some established players exist.
      - **Low (0-4):** Saturated market, unclear differentiator, many dominant competitors.

  2.  **Assess Prospect of Success (0-10):**
      - **High (8-10):** Experienced team (implied), realistic funding goal for the stage, strong problem-solution fit, scalable business model.
      - **Moderate (5-7):** Ambitious but plausible goals. Business model is sound but may face execution challenges. Funding ask is reasonable.
      - **Low (0-4):** Unclear business model, unrealistic funding target for the stage, significant execution risks, or weak problem-solution fit.

  3.  **Write Justification Summary (50-100 words):**
      - Provide a concise summary explaining the reasoning behind your two scores.

  4.  **Generate AI Improvement Plan:**
      - Based on the **lowest** of the two scores, generate a tailored improvement plan.
      - If the lowest score is **Weak (0-4)**, provide a detailed 5-step turnaround plan.
      - If the lowest score is **Moderate (5-7)**, provide a 3-step optimization plan.
      - If both scores are **Strong (8-10)**, provide a 2-step scaling or acceleration plan.
      - Each step in the plan must be a clear, actionable recommendation.

  Generate the readiness assessment now.`,
});

const generateReadinessScoreFlow = ai.defineFlow(
  {
    name: 'generateReadinessScoreFlow',
    inputSchema: GenerateReadinessScoreInputSchema,
    outputSchema: GenerateReadinessScoreOutputSchema,
  },
  async (input) => {
    const { output } = await generateReadinessScorePrompt(input);
    return output!;
  }
);

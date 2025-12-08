
'use server';
/**
 * @fileOverview AI agent to discover profitable and high-potential niches.
 *
 * - discoverNiches - Identifies top 5 niches based on sector and location.
 * - DiscoverNichesInput - The input type for the discoverNiches function.
 * - DiscoverNichesOutput - The return type for the discoverNiches function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DiscoverNichesInputSchema = z.object({
  sector: z.string().describe('The broad industry or sector of interest.'),
  location: z.string().describe('The geographical market (e.g., city, country).'),
  targetAudience: z.string().optional().describe('The desired target audience (e.g., "millennials", "small businesses", "families").'),
  businessModel: z.string().optional().describe('Preferred business model (e.g., B2B, D2C, SaaS).'),
  capitalAvailable: z.number().optional().describe('The available starting capital.'),
});
export type DiscoverNichesInput = z.infer<typeof DiscoverNichesInputSchema>;

const NicheIdeaSchema = z.object({
    nicheName: z.string().describe('The name of the specific niche idea.'),
    competitivenessScore: z.number().min(0).max(10).describe('A 0-10 score for market competitiveness (lower is better).'),
    successProspectScore: z.number().min(0).max(10).describe('A 0-10 score for the prospect of success.'),
    marketGap: z.string().describe('A brief summary of the market opportunity or gap.'),
    targetAudience: z.string().describe('The specific target audience for this niche.'),
    entryBarrier: z.string().describe('The primary barrier to entry (e.g., "High capital", "Technical expertise", "Regulatory hurdles").'),
    revenueModel: z.string().describe('A suggested revenue model (e.g., "Subscription", "Pay-per-use", "Freemium").'),
});

const DiscoverNichesOutputSchema = z.object({
  niches: z.array(NicheIdeaSchema).length(5).describe('An array of 5 ranked niche ideas.'),
});
export type DiscoverNichesOutput = z.infer<typeof DiscoverNichesOutputSchema>;

export async function discoverNiches(input: DiscoverNichesInput): Promise<DiscoverNichesOutput> {
  return discoverNichesFlow(input);
}

const discoverNichesPrompt = ai.definePrompt({
  name: 'discoverNichesPrompt',
  input: { schema: DiscoverNichesInputSchema },
  output: { schema: DiscoverNichesOutputSchema },
  prompt: `You are a market research analyst and venture capital scout. Your goal is to identify the top 5 most profitable and high-potential niches within a given sector and location.

  **User Inputs:**
  - Sector/Industry: {{{sector}}}
  - Location: {{{location}}}
  - Target Audience: {{{targetAudience}}}
  - Business Model: {{{businessModel}}}
  - Capital Available: {{{capitalAvailable}}}

  **Instructions:**

  1.  Based on the user's inputs and your knowledge of global and local market trends, identify 5 specific, underserved, or emerging niches.
  2.  For each niche, provide the following:
      - **nicheName:** A clear, descriptive name for the niche.
      - **competitivenessScore (0-10):** How competitive is this niche? 0 is a blue ocean, 10 is a red ocean.
      - **successProspectScore (0-10):** What is the potential for success? Consider demand, scalability, and profitability. 10 is highest potential.
      - **marketGap:** A one-sentence summary of why this niche is a good opportunity right now.
      - **targetAudience:** A description of the ideal customer for this niche.
      - **entryBarrier:** The main barrier to entry (e.g., "High capital", "Technical expertise", "Regulatory hurdles").
      - **revenueModel:** The most suitable revenue model for this niche (e.g., "Subscription", "Commission-based").
  3.  Rank the niches in the final array from best to worst, with the top-ranked (most promising) niche at index 0. The ranking should be a balance of high success prospect and low competitiveness.

  Generate the 5 niche recommendations now.`,
});

const discoverNichesFlow = ai.defineFlow(
  {
    name: 'discoverNichesFlow',
    inputSchema: DiscoverNichesInputSchema,
    outputSchema: DiscoverNichesOutputSchema,
  },
  async (input) => {
    const { output } = await discoverNichesPrompt(input);
    return output!;
  }
);

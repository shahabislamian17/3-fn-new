'use server';
/**
 * @fileOverview AI agent to suggest optimal platform fees.
 *
 * - suggestPlatformFees - Analyzes market data to recommend fair and competitive fees.
 * - SuggestPlatformFeesInput - The input type for the suggestPlatformFees function.
 * - SuggestPlatformFeesOutput - The return type for the suggestPlatformFees function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestPlatformFeesInputSchema = z.object({
  currentOwnerFee: z.number().describe('The current success fee for project owners (e.g., 5).'),
  currentInvestorFee: z.number().describe('The current transaction fee for investors (e.g., 2).'),
  marketAnalysis: z.object({
    competitorOwnerFees: z.array(z.number()).describe("A list of competitor owner success fees (e.g., [4.5, 5, 6])."),
    competitorInvestorFees: z.array(z.number()).describe("A list of competitor investor transaction fees (e.g., [1.5, 2, 2.5])."),
    platformGrowthRate: z.number().describe("The platform's month-over-month user growth rate (e.g., 15 for 15%)."),
    averageCampaignSuccessRate: z.number().describe("The average campaign funding success rate (e.g., 88 for 88%)."),
  }),
});
export type SuggestPlatformFeesInput = z.infer<typeof SuggestPlatformFeesInputSchema>;

const SuggestPlatformFeesOutputSchema = z.object({
  suggestedOwnerFee: z.number().describe('The AI-suggested success fee for owners.'),
  suggestedInvestorFee: z.number().describe('The AI-suggested transaction fee for investors.'),
  reasoning: z.string().describe('A detailed explanation for the fee recommendations, considering market position, growth, and competitiveness.'),
});
export type SuggestPlatformFeesOutput = z.infer<typeof SuggestPlatformFeesOutputSchema>;

export async function suggestPlatformFees(input: SuggestPlatformFeesInput): Promise<SuggestPlatformFeesOutput> {
  return suggestPlatformFeesFlow(input);
}

const suggestPlatformFeesPrompt = ai.definePrompt({
  name: 'suggestPlatformFeesPrompt',
  input: { schema: SuggestPlatformFeesInputSchema },
  output: { schema: SuggestPlatformFeesOutputSchema },
  prompt: `You are a platform strategist for a crowdfunding company. Your goal is to recommend optimal platform fees to ensure competitiveness, profitability, and growth.

  **Current Platform State:**
  - Current Owner Success Fee: {{{currentOwnerFee}}}%
  - Current Investor Transaction Fee: {{{currentInvestorFee}}}%
  - User Growth (MoM): {{{marketAnalysis.platformGrowthRate}}}%
  - Campaign Success Rate: {{{marketAnalysis.averageCampaignSuccessRate}}}%

  **Market Analysis:**
  - Competitor Owner Fees: {{json marketAnalysis.competitorOwnerFees}}
  - Competitor Investor Fees: {{json marketAnalysis.competitorInvestorFees}}

  **Instructions:**

  1.  **Analyze the Data:** Compare our current fees and platform health against the competitor data.
  2.  **Formulate a Strategy:**
      - If our growth is strong and success rate is high, we might have room to slightly increase fees to boost revenue.
      - If our fees are higher than competitors and growth is slowing, we should consider lowering them to become more attractive.
      - If we are in the middle of the pack, suggest maintaining the fees or a minor adjustment, and explain why.
  3.  **Provide Recommendations:** Suggest a new owner success fee and investor transaction fee. The values can be the same as the current ones if no change is needed.
  4.  **Justify Your Reasoning:** Provide a clear, concise rationale for your suggestions. Explain the trade-offs (e.g., "Lowering the investor fee might attract more investors, increasing overall volume despite the lower margin.").

  Generate your fee recommendation now.`,
});

const suggestPlatformFeesFlow = ai.defineFlow(
  {
    name: 'suggestPlatformFeesFlow',
    inputSchema: SuggestPlatformFeesInputSchema,
    outputSchema: SuggestPlatformFeesOutputSchema,
  },
  async (input) => {
    const { output } = await suggestPlatformFeesPrompt(input);
    return output!;
  }
);

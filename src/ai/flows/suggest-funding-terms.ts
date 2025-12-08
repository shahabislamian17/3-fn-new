'use server';

/**
 * @fileOverview AI agent to suggest funding terms for a project based on location and sector benchmarks.
 *
 * - suggestFundingTerms - A function that suggests funding terms (ask, equity percentage, or royalty terms).
 * - SuggestFundingTermsInput - The input type for the suggestFundingTerms function.
 * - SuggestFundingTermsOutput - The return type for the suggestFundingTerms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFundingTermsInputSchema = z.object({
  location: z
    .string()
    .describe('The location of the project (e.g., country, region).'),
  sector: z.string().describe('The sector of the project (e.g., technology, healthcare).'),
  projectDescription: z.string().describe('A description of the project.'),
});
export type SuggestFundingTermsInput = z.infer<typeof SuggestFundingTermsInputSchema>;

const SuggestFundingTermsOutputSchema = z.object({
  fundingAsk: z
    .string()
    .describe('Suggested funding ask amount (e.g., $100,000).'),
  equityPercentage: z
    .string()
    .describe('Suggested equity percentage to offer (e.g., 10%).'),
  royaltyTerms: z
    .string()
    .describe('Suggested royalty terms (e.g., 5% of revenue until 2x investment multiple).'),
  reasoning: z.string().describe('The reasoning behind the suggested terms.'),
});
export type SuggestFundingTermsOutput = z.infer<typeof SuggestFundingTermsOutputSchema>;

export async function suggestFundingTerms(
  input: SuggestFundingTermsInput
): Promise<SuggestFundingTermsOutput> {
  return suggestFundingTermsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFundingTermsPrompt',
  input: {schema: SuggestFundingTermsInputSchema},
  output: {schema: SuggestFundingTermsOutputSchema},
  prompt: `You are an expert in crowdfunding investment terms.

  Based on the project's location ({{
    location
  }}), sector ({{
    sector
  }}), and project description ({{{projectDescription}}}), suggest appropriate funding terms for the project owner, including the funding ask, equity percentage, and royalty terms.

  Also, provide a brief explanation for your suggestions.

  Output the information in the requested JSON format.
  `,
});

const suggestFundingTermsFlow = ai.defineFlow(
  {
    name: 'suggestFundingTermsFlow',
    inputSchema: SuggestFundingTermsInputSchema,
    outputSchema: SuggestFundingTermsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

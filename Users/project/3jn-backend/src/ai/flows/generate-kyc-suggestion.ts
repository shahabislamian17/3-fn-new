
'use server';

/**
 * @fileOverview AI agent to provide a suggestion for a user KYC verification request.
 *
 * - generateKycSuggestion - Provides a risk profile and verification recommendation.
 * - GenerateKycSuggestionInput - The input type for the generateKycSuggestion function.
 * - GenerateKycSuggestionOutput - The return type for the generateKycSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateKycSuggestionInputSchema = z.object({
  userName: z.string().describe('The name of the user.'),
  country: z.string().describe('The user\'s country of residence.'),
  sourceOfFunds: z.string().describe('The user\'s stated source of funds.'),
  riskAppetite: z.enum(['low', 'medium', 'high']).describe('The user\'s stated risk appetite.'),
});
export type GenerateKycSuggestionInput = z.infer<typeof GenerateKycSuggestionInputSchema>;

const GenerateKycSuggestionOutputSchema = z.object({
  recommendation: z.enum(['Verify', 'Flag']).describe('The AI-powered recommendation for the KYC decision.'),
  riskProfile: z.enum(['Low', 'Medium', 'High']).describe('A simplified risk profile for the user.'),
  reasoning: z.string().describe('A brief explanation for the recommendation, highlighting any potential flags.'),
});
export type GenerateKycSuggestionOutput = z.infer<typeof GenerateKycSuggestionOutputSchema>;


export async function generateKycSuggestion(
  input: GenerateKycSuggestionInput
): Promise<GenerateKycSuggestionOutput> {
  return generateKycSuggestionFlow(input);
}


const generateKycSuggestionPrompt = ai.definePrompt({
  name: 'generateKycSuggestionPrompt',
  input: {schema: GenerateKycSuggestionInputSchema},
  output: {schema: GenerateKycSuggestionOutputSchema},
  prompt: `You are a KYC/AML compliance analyst. Your job is to review a new user's profile and provide a risk assessment and verification recommendation.

  **User Details:**
  - Name: {{{userName}}}
  - Country: {{{country}}}
  - Stated Source of Funds: {{{sourceOfFunds}}}
  - Risk Appetite: {{{riskAppetite}}}

  **Instructions:**

  1.  **Assess Risk Profile:**
      - **Low:** Standard profile, clear source of funds (e.g., employment), from a low-risk country.
      - **Medium:** Vague source of funds (e.g., "investment"), from a country with moderate corruption risk.
      - **High:** Source of funds is unusual or high-risk (e.g., "crypto trading"), from a high-risk jurisdiction, or there are potential mismatches.

  2.  **Make a Recommendation:**
      - **Verify:** If the risk profile is Low.
      - **Flag:** If the risk profile is Medium or High, or if any detail warrants a manual human review.

  3.  **Provide Reasoning:** Write a short (1-2 sentences) justification for your decision, noting any specific flags. For example, "Flag for review due to vague source of funds and user being from a high-risk jurisdiction."

  Generate the analysis now.`,
});


const generateKycSuggestionFlow = ai.defineFlow(
  {
    name: 'generateKycSuggestionFlow',
    inputSchema: GenerateKycSuggestionInputSchema,
    outputSchema: GenerateKycSuggestionOutputSchema,
  },
  async input => {
    const {output} = await generateKycSuggestionPrompt(input);
    return output!;
  }
);

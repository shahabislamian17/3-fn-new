'use server';

/**
 * @fileOverview AI-powered campaign pitch generator for project owners.
 *
 * - generateCampaignPitch - Generates a short public pitch and a long-form project description for a campaign.
 * - GenerateCampaignPitchInput - The input type for the generateCampaignPitch function.
 * - GenerateCampaignPitchOutput - The return type for the generateCampaignPitch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCampaignPitchInputSchema = z.object({
  industry: z.string().describe('The industry of the project.'),
  country: z.string().describe('The country where the project is based.'),
  projectDescription: z.string().describe('A detailed description of the project.'),
  tone: z.enum(['persuasive', 'neutral', 'conservative']).default('persuasive').describe('The tone of the pitch.'),
});
export type GenerateCampaignPitchInput = z.infer<typeof GenerateCampaignPitchInputSchema>;

const GenerateCampaignPitchOutputSchema = z.object({
  shortPitch: z.string().describe('A short, public-facing pitch for the campaign (a one-sentence hook + a 60-120 word paragraph).'),
  longPitch: z.string().describe('A long-form, detailed project description for investors, structured with clear headings for the narrative, benefits, and risks, and including a disclaimer.'),
});
export type GenerateCampaignPitchOutput = z.infer<typeof GenerateCampaignPitchOutputSchema>;

export async function generateCampaignPitch(input: GenerateCampaignPitchInput): Promise<GenerateCampaignPitchOutput> {
  return generateCampaignPitchFlow(input);
}

const generateCampaignPitchPrompt = ai.definePrompt({
  name: 'generateCampaignPitchPrompt',
  input: {schema: GenerateCampaignPitchInputSchema},
  output: {schema: GenerateCampaignPitchOutputSchema},
  prompt: `You are an expert marketing copywriter specializing in crowdfunding campaigns.

  Given the following project details, generate a compelling short public pitch and a detailed long-form project description.
  The tone for both should be {{{tone}}}.

  **Project Details:**
  - **Industry:** {{{industry}}}
  - **Country:** {{{country}}}
  - **Project Description:** {{{projectDescription}}}

  **Instructions:**

  1.  **Short Pitch:**
      - Start with a powerful one-sentence hook.
      - Follow with a concise paragraph (60-120 words) that grabs attention and summarizes the core value proposition.

  2.  **Long-Form Pitch:**
      - **Project Narrative:** Create a compelling story about the project. What is the problem, and how does this project solve it?
      - **Benefits:** Clearly outline the key benefits for investors and the market.
      - **Risk Summary:** Provide a balanced overview of potential risks.
      - **Disclaimer:** At the end, you MUST include the following legal disclaimer as a separate paragraph: "Disclaimer: This content is for marketing purposes. All investments carry risk, and projections are not guarantees of future performance. Please conduct your own due diligence."
      - Ensure the language is compliance-friendly. The final output for the long pitch should be a single string with paragraphs separated by newlines.

  Output the results in the requested JSON format.
  `,
});

const generateCampaignPitchFlow = ai.defineFlow(
  {
    name: 'generateCampaignPitchFlow',
    inputSchema: GenerateCampaignPitchInputSchema,
    outputSchema: GenerateCampaignPitchOutputSchema,
  },
  async input => {
    const {output} = await generateCampaignPitchPrompt(input);
    return output!;
  }
);

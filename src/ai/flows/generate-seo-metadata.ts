
'use server';
/**
 * @fileOverview AI agent to generate SEO-optimized metadata for project pages.
 *
 * - generateSeoMetadata - A function that creates a meta title, description, and keywords.
 * - GenerateSeoMetadataInput - The input type for the function.
 * - GenerateSeoMetadataOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateSeoMetadataInputSchema,
  GenerateSeoMetadataOutputSchema,
  type GenerateSeoMetadataInput,
  type GenerateSeoMetadataOutput,
} from '@/lib/schemas/seo';

export type { GenerateSeoMetadataInput, GenerateSeoMetadataOutput };

export async function generateSeoMetadata(input: GenerateSeoMetadataInput): Promise<GenerateSeoMetadataOutput> {
  return generateSeoMetadataFlow(input);
}

const generateSeoMetadataPrompt = ai.definePrompt({
  name: 'generateSeoMetadataPrompt',
  input: { schema: GenerateSeoMetadataInputSchema },
  output: { schema: GenerateSeoMetadataOutputSchema },
  system: `You are an SEO expert for a crowdfunding platform named "3JN Fund". Generate highly optimized SEO and social media metadata for the following project.

  **Instructions:**
  1.  **meta_title:** Create a compelling title under 60 characters. It should include the project name and high-traffic keywords. Example: "Invest in EcoDrone: AgriTech Equity Deal in USA".
  2.  **meta_description:** Write a persuasive meta description under 160 characters. It should summarize the project and include a strong call-to-action.
  3.  **keywords:** Provide a comma-separated list of 5-7 relevant SEO keywords, including long-tail keywords. Example: "agritech investment, equity crowdfunding, drone technology, sustainable farming, startup investing".
  4.  **og_title:** Create a slightly more descriptive title for Open Graph (Facebook, LinkedIn).
  5.  **og_description:** Write a shareable description for Open Graph.
  6.  **twitter_title:** Create a concise and punchy title suitable for Twitter.
  7.  **twitter_description:** Write a concise and engaging description for Twitter sharing.

  Generate the SEO metadata now.`,
  prompt: `
  **Project Details:**
  - Title: {{{title}}}
  - Category: {{{category}}}
  - Country: {{{country}}}
  - Funding Type: {{{fundingType}}}
  - Summary: {{{summary}}}
  `,
});

const generateSeoMetadataFlow = ai.defineFlow(
  {
    name: 'generateSeoMetadataFlow',
    inputSchema: GenerateSeoMetadataInputSchema,
    outputSchema: GenerateSeoMetadataOutputSchema,
  },
  async (input) => {
    const { output } = await generateSeoMetadataPrompt(input);
    return output!;
  }
);

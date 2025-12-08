
'use server';
/**
 * @fileOverview AI agent to generate SEO-optimized metadata for project pages.
 *
 * - generateSeoMetadata - A function that creates a meta title, description, and keywords.
 * - GenerateSeoMetadataInput - The input type for the function.
 * - GenerateSeoMetadataOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';


export const GenerateSeoMetadataInputSchema = z.object({
  title: z.string().describe('The project title.'),
  category: z.string().describe('The project category (e.g., "FinTech", "Agriculture").'),
  country: z.string().describe('The country where the project is based.'),
  fundingType: z.enum(['Equity', 'Royalty']).describe('The funding model of the project.'),
  summary: z.string().describe('A short summary of the project.'),
});
export type GenerateSeoMetadataInput = z.infer<typeof GenerateSeoMetadataInputSchema>;

export const GenerateSeoMetadataOutputSchema = z.object({
  meta_title: z.string().max(60).describe('A compelling, SEO-optimized title, max 60 characters, with keywords front-loaded.'),
  meta_description: z.string().max(160).describe('A compelling, SEO-optimized meta description, max 160 characters, focused on click-through rate.'),
  keywords: z.string().describe('A comma-separated list of 5-7 relevant SEO keywords, including long-tail keywords.'),
  og_title: z.string().describe('A catchy title for social sharing on Open Graph (e.g., Facebook, LinkedIn).'),
  og_description: z.string().describe('A compelling description for Open Graph social sharing.'),
  twitter_title: z.string().describe('A concise and engaging title for Twitter.'),
  twitter_description: z.string().describe('A concise and engaging description for Twitter sharing.'),
});
export type GenerateSeoMetadataOutput = z.infer<typeof GenerateSeoMetadataOutputSchema>;


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

import { z } from 'zod';

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

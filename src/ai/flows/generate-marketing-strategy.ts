
'use server';
/**
 * @fileOverview AI agent to generate a marketing and implementation strategy for a funded campaign.
 *
 * - generateMarketingStrategy - A function that creates the marketing plan.
 * - GenerateMarketingStrategyInput - The input type for the function.
 * - GenerateMarketingStrategyOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const GenerateMarketingStrategyInputSchema = z.object({
  campaign_title: z.string(),
  short_description: z.string(),
  location: z.string(),
  target_amount: z.number(),
  audience_profile: z.string().optional(),
  assets: z.object({
      deck_url: z.string().optional(),
      video_url: z.string().optional(),
      social_links: z.array(z.string()).optional(),
  }).optional(),
  budget_estimate: z.number().optional(),
});

export type GenerateMarketingStrategyInput = z.infer<typeof GenerateMarketingStrategyInputSchema>;

export const GenerateMarketingStrategyOutputSchema = z.object({
  campaign_name: z.string(),
  goals: z.array(z.object({ metric: z.string(), value: z.union([z.string(), z.number()]) })),
  audiences: z.array(z.object({ name: z.string(), profile: z.string() })),
  creative_concepts: z.array(z.object({ title: z.string(), visual_direction: z.string() })),
  channel_mix: z.array(z.object({ channel: z.string(), budget_usd: z.number(), objective: z.string() })),
  "30_day_plan": z.array(z.object({ day: z.number(), action: z.string() })),
  ad_copy: z.array(z.object({ platform: z.string(), variant: z.string(), headline: z.string(), body: z.string() })),
  email_sequence: z.array(z.object({ day: z.number(), subject: z.string(), body: z.string() })),
  assumptions: z.array(z.string()),
  confidence_score: z.number().min(0).max(1),
});


export type GenerateMarketingStrategyOutput = z.infer<typeof GenerateMarketingStrategyOutputSchema>;

export async function generateMarketingStrategy(input: GenerateMarketingStrategyInput): Promise<GenerateMarketingStrategyOutput> {
  return generateMarketingStrategyFlow(input);
}

const generateMarketingStrategyPrompt = ai.definePrompt({
  name: 'generateMarketingStrategyPrompt',
  input: { schema: GenerateMarketingStrategyInputSchema },
  output: { schema: GenerateMarketingStrategyOutputSchema },
  system: `You are a senior growth marketer for early-stage impact ventures. Produce a concise marketing campaign for a crowdfunding launch that includes campaign goals, target audiences, hero creative concepts, channel mix, a 30-day launch plan, key messages, sample copy for ads (3 variants), and sample email sequence (3 emails). Output JSON only.`,
  prompt: `
    Campaign Title: {{{campaign_title}}}
    Short Description: {{{short_description}}}
    Location: {{{location}}}
    Target Amount: {{{target_amount}}}
    Audience Profile: {{{audience_profile}}}
    Assets: {{{json assets}}}
    Budget Estimate: {{{budget_estimate}}}
  `,
});

const generateMarketingStrategyFlow = ai.defineFlow(
  {
    name: 'generateMarketingStrategyFlow',
    inputSchema: GenerateMarketingStrategyInputSchema,
    outputSchema: GenerateMarketingStrategyOutputSchema,
  },
  async (input) => {
    const { output } = await generateMarketingStrategyPrompt(input);
    return output!;
  }
);

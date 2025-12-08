
'use server';
/**
 * @fileOverview AI agent to generate draft legal documents for a funded campaign.
 *
 * - generateLegalDocument - A function that creates a draft legal agreement.
 * - GenerateLegalDocumentInput - The input type for the function.
 * - GenerateLegalDocumentOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InvestorInfoSchema = z.object({
    name: z.string(),
    email: z.string(),
    investment_amount: z.number(),
    investor_type: z.string(),
});

export const GenerateLegalDocumentInputSchema = z.object({
  campaign_title: z.string(),
  fundingType: z.enum(['Equity', 'Royalty']),
  owner_name: z.string(),
  owner_company: z.string(),
  jurisdiction: z.string(),
  targetAmount: z.number(),
  investorList: z.array(InvestorInfoSchema),
  specialTerms: z.object({
    royalty_rate: z.number().optional(),
    repayment_multiple: z.number().optional(),
    valuation: z.number().optional(),
    equity_percentage: z.number().optional(),
  }),
});

export type GenerateLegalDocumentInput = z.infer<typeof GenerateLegalDocumentInputSchema>;

export const GenerateLegalDocumentOutputSchema = z.object({
    doc_type: z.string().describe("E.g., 'subscription_agreement' or 'revenue_note'"),
    placeholders: z.record(z.string()).describe("A map of placeholder keys to their values."),
    html: z.string().describe("The full legal agreement in simple, clean HTML format."),
    summary: z.string().describe("A short, 3-sentence summary of the key terms for non-lawyers."),
    variables: z.record(z.any()).describe("Key variables extracted or defined, like signing deadlines."),
});

export type GenerateLegalDocumentOutput = z.infer<typeof GenerateLegalDocumentOutputSchema>;

export async function generateLegalDocument(input: GenerateLegalDocumentInput): Promise<GenerateLegalDocumentOutput> {
  return generateLegalDocumentFlow(input);
}

const generateLegalDocumentPrompt = ai.definePrompt({
  name: 'generateLegalDocumentPrompt',
  input: { schema: GenerateLegalDocumentInputSchema },
  output: { schema: GenerateLegalDocumentOutputSchema },
  system: `You are a commercial lawyer that drafts investor subscription agreements and revenue-share notes for crowdfunding platforms. Generate a draft legal agreement in HTML format (simple, clear, and containing placeholders) and return JSON with keys: { "doc_type", "placeholders", "html", "summary", "variables" }`,
  prompt: `
  Campaign: {{{campaign_title}}}
  FundingType: {{{fundingType}}}
  CampaignOwner: {{{owner_name}}}, {{{owner_company}}}
  Jurisdiction: {{{jurisdiction}}}
  TargetAmount: {{{targetAmount}}}
  InvestorList: {{{json investorList}}}
  SpecialTerms: {{{json specialTerms}}}
  `,
});

const generateLegalDocumentFlow = ai.defineFlow(
  {
    name: 'generateLegalDocumentFlow',
    inputSchema: GenerateLegalDocumentInputSchema,
    outputSchema: GenerateLegalDocumentOutputSchema,
  },
  async (input) => {
    const { output } = await generateLegalDocumentPrompt(input);
    return output!;
  }
);

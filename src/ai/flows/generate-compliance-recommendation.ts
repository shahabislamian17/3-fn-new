
'use server';
/**
 * @fileOverview AI agent to assess a funded project's compliance status and recommend fund release.
 *
 * - generateComplianceRecommendation - A function that aggregates compliance data and provides a release recommendation.
 * - GenerateComplianceRecommendationInput - The input type for the function.
 * - GenerateComplianceRecommendationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const OwnerComplianceSchema = z.object({
  user_id: z.string(),
  kyb_status: z.enum(['not_submitted', 'submitted', 'in_review', 'approved', 'rejected', 'requires_more_info']),
  bank_verified: z.boolean(),
  beneficial_owner_count: z.number().int(),
  beneficial_owners_verified: z.number().int(),
});

const HighRiskInvestorSchema = z.object({
  id: z.string(),
  amount: z.number(),
  flags: z.array(z.string()),
});

const InvestorsSummarySchema = z.object({
  total_investors: z.number().int(),
  verified_investors_count: z.number().int(),
  unverified_investors_count: z.number().int(),
  high_risk_investor_ids: z.array(HighRiskInvestorSchema).describe('A list of investors flagged for high risk (e.g., PEP, sanctions).'),
  largest_unverified_investment: z.number(),
});

const ProviderFlagsSchema = z.object({
  kyc_provider_flags: z.array(z.string()).optional(),
  aml_flags: z.array(z.string()).optional(),
});

const PolicySchema = z.object({
  require_all_investors_verified: z.boolean(),
  max_ai_risk_score_for_auto_release: z.number(),
  max_single_unverified_amount: z.number(),
});

const GenerateComplianceRecommendationInputSchema = z.object({
  project: z.object({
    id: z.string(),
    title: z.string(),
    funding_type: z.enum(['equity', 'royalty']),
    target_amount: z.number(),
    raised_amount: z.number(),
    country: z.string(),
    category: z.string(),
  }),
  owner: OwnerComplianceSchema,
  investors_summary: InvestorsSummarySchema,
  provider_flags: ProviderFlagsSchema,
  policy: PolicySchema,
  instructions: z.string(),
});
export type GenerateComplianceRecommendationInput = z.infer<typeof GenerateComplianceRecommendationInputSchema>;

const SuggestedActionSchema = z.object({
    priority: z.number().describe("The priority of the action (1 is highest)."),
    action: z.string().describe("The type of action to take (e.g., 'request_documents', 'perform_edd')."),
    target: z.string().describe("The target of the action (e.g., 'top_50_unverified', 'INV_1,INV_2', 'owner')."),
    details: z.string().describe("A human-readable description of the suggested action."),
});

const GenerateComplianceRecommendationOutputSchema = z.object({
  ai_risk_score: z.number().min(0).max(100).describe('A risk score from 0 to 100, where higher is riskier.'),
  ai_recommendation: z.enum(['auto_release', 'manual_review', 'block']).describe('The AI-powered recommendation for fund release.'),
  reasoning: z.string().describe('A 50-200 word explanation for the recommendation and score.'),
  suggested_actions: z.array(SuggestedActionSchema).describe("A list of concrete, actionable steps for a compliance officer."),
});
export type GenerateComplianceRecommendationOutput = z.infer<typeof GenerateComplianceRecommendationOutputSchema>;

export async function generateComplianceRecommendation(input: GenerateComplianceRecommendationInput): Promise<GenerateComplianceRecommendationOutput> {
  return generateComplianceRecommendationFlow(input);
}

const generateComplianceRecommendationPrompt = ai.definePrompt({
  name: 'generateComplianceRecommendationPrompt',
  input: { schema: GenerateComplianceRecommendationInputSchema },
  output: { schema: GenerateComplianceRecommendationOutputSchema },
  system: "You are a compliance analyst assistant. Your job is to read structured input about a fundraising campaign, its owner KYB status, and investor KYC/AML coverage. Produce an objective AI risk score (0-100), a clear recommendation (auto_release | manual_review | block), a concise reasoning (50-200 words), and prioritized suggested actions. Format your answer strictly as JSON following the schema below. Do NOT include extra commentary outside the JSON.",
  prompt: `
  **Payload:**
  \`\`\`json
  {{{json .}}}
  \`\`\`
  
  **Instructions:**
  Given the structured inputs above, return a JSON object with:
  - ai_risk_score: A numerical risk score from 0 to 100.
  - ai_recommendation: Your recommendation ('auto_release', 'manual_review', or 'block').
  - reasoning: A 50-200 word summary explaining your decision.
  - suggested_actions: A list of clear, actionable steps for a compliance officer if manual review is needed.

  **Analysis Factors:**
  - **Owner Risk:** If owner KYB is not 'approved' or beneficial owner verification is incomplete, risk increases significantly.
  - **Investor Risk:** A high percentage of unverified investors or any high-risk (PEP/Sanctions) investors are major red flags. The size of the largest unverified investment relative to the total and policy is critical.
  - **Policy Context:** Your recommendation should consider the platform's policy settings (e.g., 'max_ai_risk_score_for_auto_release', 'max_single_unverified_amount').

  **Risk Score Guidance:**
  - **Low (0-40):** Owner approved, >95% of investors verified, no major flags, passes policy checks.
  - **Medium (41-70):** Minor owner issues, 80-95% of investors verified, or a few low-risk flags. Warrants human review.
  - **High (71-100):** Owner not approved, <80% of investors verified, significant high-risk flags, policy breaches.
  
  {{{instructions}}}

  Generate the compliance assessment now.
  `,
});


const generateComplianceRecommendationFlow = ai.defineFlow(
  {
    name: 'generateComplianceRecommendationFlow',
    inputSchema: GenerateComplianceRecommendationInputSchema,
    outputSchema: GenerateComplianceRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await generateComplianceRecommendationPrompt(input);
    return output!;
  }
);

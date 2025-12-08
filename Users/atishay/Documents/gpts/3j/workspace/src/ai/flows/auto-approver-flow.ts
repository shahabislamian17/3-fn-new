'use server';
/**
 * @fileOverview A deterministic AI agent to automatically approve or reject platform actions.
 *
 * - autoApprover - A function that decides whether to approve, reject, or escalate an action.
 * - AutoApproverInputSchema - The input type for the function.
 * - AutoApproverOutputSchema - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const AutoApproverInputSchema = z.object({
  type: z.enum(['project', 'investment', 'payout', 'kyc', 'fallback_kyc', 'document', 'upgrade']),
  user: z.object({
    id: z.string(),
    role: z.string(),
    riskScore: z.number(),
    riskTier: z.enum(['low', 'medium', 'high']),
    riskFlags: z.array(z.string()),
    kycStatus: z.enum(['pending', 'passed', 'failed', 'not_started']),
    fallbackKycStatus: z.enum(['required', 'pending', 'approved', 'rejected', 'not_required']),
    payoutBlocked: z.boolean(),
    countryRiskTier: z.enum(['tier1', 'tier2', 'tier3']),
  }),
  entity: z.object({
    id: z.string(),
    fields: z.record(z.any()),
  }),
});
export type AutoApproverInput = z.infer<typeof AutoApproverInputSchema>;

export const AutoApproverOutputSchema = z.object({
  decision: z.enum(['approve', 'reject', 'escalate']),
  reason: z.string(),
  requiresManualReview: z.boolean(),
});
export type AutoApproverOutput = z.infer<typeof AutoApproverOutputSchema>;

export async function autoApprover(input: AutoApproverInput): Promise<AutoApproverOutput> {
  return autoApproverFlow(input);
}

const autoApproverFlow = ai.defineFlow(
  {
    name: 'autoApproverFlow',
    inputSchema: AutoApproverInputSchema,
    outputSchema: AutoApproverOutputSchema,
  },
  async (input) => {
    const { user, entity, type } = input;

    // Rule 2: Reject automatically if any red flags are present
    if (user.riskTier === 'high' || user.riskScore >= 60 || user.riskFlags.length > 0 || user.kycStatus === 'failed') {
      let reason = 'High risk score or red flags.';
      if (user.kycStatus === 'failed') reason = 'User KYC status is failed.';
      if (user.riskTier === 'high') reason = 'User risk tier is high.';
      
      return {
        decision: 'reject',
        reason: reason,
        requiresManualReview: false,
      };
    }

    // Rule for payouts
    if (type === 'payout' && user.payoutBlocked) {
        return {
            decision: 'reject',
            reason: 'Payouts are blocked for this user.',
            requiresManualReview: true,
        };
    }

    // Rule 1: Approve automatically if all green-light conditions are met
    const allGreen =
      (user.riskTier === 'low' || user.riskTier === 'medium') &&
      user.riskFlags.length === 0 &&
      user.riskScore < 60 &&
      user.kycStatus === 'passed' &&
      (user.fallbackKycStatus === 'approved' || user.fallbackKycStatus === 'not_required') &&
      (type !== 'payout' || !user.payoutBlocked);

    if (allGreen) {
      return {
        decision: 'approve',
        reason: 'All automated checks passed.',
        requiresManualReview: false,
      };
    }

    // Rule 3: Escalate for human review if uncertain
    let escalationReason = 'Mixed signals require human review.';
    if (user.fallbackKycStatus === 'pending') {
        escalationReason = 'Fallback KYC is pending review.';
    } else if (user.kycStatus === 'pending') {
        escalationReason = 'KYC status is pending.';
    }

    return {
      decision: 'escalate',
      reason: escalationReason,
      requiresManualReview: true,
    };
  }
);

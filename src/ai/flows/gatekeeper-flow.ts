'use server';
/**
 * @fileOverview A gatekeeper flow to enforce KYC rules for critical actions.
 *
 * - gatekeeper - A function that checks if a user can perform an action based on their KYC status.
 * - GatekeeperInput - The input type for the gatekeeper function.
 * - GatekeeperOutput - The return type for the gatekeeper function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const GatekeeperInputSchema = z.object({
  country: z.string().describe('ISO-2 country code'),
  stripeSupported: z.boolean(),
  plaidSupported: z.boolean(),
  kycStatus: z.enum(['pending', 'failed', 'passed', 'not_started']),
  userRole: z.enum(['investor', 'owner']),
  bankDocumentUploaded: z.boolean(),
  proofOfAddressUploaded: z.boolean(),
  manualReviewApproved: z.boolean(),
  action: z.enum(['publish_project', 'invest', 'payout', 'withdraw']),
});
export type GatekeeperInput = z.infer<typeof GatekeeperInputSchema>;

export const GatekeeperOutputSchema = z.object({
  allowed: z.boolean(),
  mode: z.enum(['normal', 'fallback']),
  reason: z.string(),
  requiredAction: z.string(),
});
export type GatekeeperOutput = z.infer<typeof GatekeeperOutputSchema>;

export async function gatekeeper(input: GatekeeperInput): Promise<GatekeeperOutput> {
  return gatekeeperFlow(input);
}

const gatekeeperFlow = ai.defineFlow(
  {
    name: 'gatekeeperFlow',
    inputSchema: GatekeeperInputSchema,
    outputSchema: GatekeeperOutputSchema,
  },
  async (input) => {
    const {
      stripeSupported,
      plaidSupported,
      kycStatus,
      userRole,
      bankDocumentUploaded,
      proofOfAddressUploaded,
      manualReviewApproved,
      action,
    } = input;

    const mode: 'normal' | 'fallback' = (stripeSupported && plaidSupported) ? 'normal' : 'fallback';

    // Rule 1 & 2 are handled by the 'mode' variable.

    // Rule 3: Investing
    if (action === 'invest') {
      if (userRole !== 'investor') {
        return {
          allowed: false,
          mode: mode as 'normal' | 'fallback',
          reason: 'Invalid user role for action.',
          requiredAction: 'User must be an investor to invest.',
        };
      }
      if (kycStatus !== 'passed') {
        return {
          allowed: false,
          mode: mode as 'normal' | 'fallback',
          reason: 'KYC not passed',
          requiredAction: 'Complete and pass identity verification before investing.',
        };
      }
      // If KYC passed, investment is allowed in both modes.
      return {
        allowed: true,
        mode: mode as 'normal' | 'fallback',
        reason: mode === 'fallback' ? 'Stripe/Plaid not supported but KYC passed' : 'KYC passed',
        requiredAction: mode === 'fallback' ? 'No payout allowed until bank verification and manual review are completed' : 'Proceed',
      };
    }

    // Rule 4: Publishing a project
    if (action === 'publish_project') {
       if (userRole !== 'owner') {
        return {
          allowed: false,
          mode: mode as 'normal' | 'fallback',
          reason: 'Invalid user role for action.',
          requiredAction: 'User must be a project owner to publish.',
        };
      }
      if (kycStatus !== 'passed') {
        return {
          allowed: false,
          mode: mode as 'normal' | 'fallback',
          reason: 'KYC not passed',
          requiredAction: 'Complete and pass identity verification before publishing.',
        };
      }
      return {
        allowed: true,
        mode: mode as 'normal' | 'fallback',
        reason: 'KYC passed',
        requiredAction: 'Proceed with project submission.',
      };
    }

    // Rule 5 & 6: Payouts/Withdrawals
    if (action === 'payout' || action === 'withdraw') {
      if (mode === 'normal') {
        return {
          allowed: true,
          mode: 'normal' as const,
          reason: 'Stripe handles full verification',
          requiredAction: 'Proceed with Stripe Connect onboarding',
        };
      }
      
      // Fallback mode payout rules
      const conditionsMet = 
        kycStatus === 'passed' &&
        bankDocumentUploaded &&
        proofOfAddressUploaded &&
        manualReviewApproved;

      if (!conditionsMet) {
        return {
          allowed: false,
          mode: 'fallback' as const,
          reason: 'Enhanced verification required before payout',
          requiredAction: 'Upload bank statement, upload proof of address, and wait for manual approval',
        };
      }
      
      // Conditions met in fallback mode
      return {
        allowed: true,
        mode: 'fallback' as const,
        reason: 'All verification requirements met',
        requiredAction: 'Proceed with manual payout processing',
      };
    }
    
    // Default case
    return {
      allowed: true,
      mode: mode as 'normal' | 'fallback',
      reason: 'Action allowed under current conditions.',
      requiredAction: 'Proceed',
    };
  }
);

// backend/src/lib/ai-auto-approval.ts
import { AutoApprovalInput, AutoApprovalDecision } from "../types/auto-approval";
import { autoApprover, AutoApproverInputSchema } from "@/ai/flows/auto-approver-flow";

/**
 * In production, this calls the deterministic autoApprover Genkit flow
 * using the strict auto-approval system prompt you defined.
 */
export async function callAutoApprovalEngine(
  input: AutoApprovalInput
): Promise<AutoApprovalDecision> {
  // Validate input against the Zod schema from the Genkit flow
  const validatedInput = AutoApproverInputSchema.parse(input);
  return autoApprover(validatedInput);
}
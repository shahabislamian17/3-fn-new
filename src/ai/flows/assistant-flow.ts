'use server';
/**
 * @fileOverview A general-purpose AI assistant for the crowdfunding platform.
 *
 * - chatAssistant - A function that handles conversational interactions.
 * - ChatAssistantInput - The input type for the chatAssistant function.
 * - ChatAssistantOutput - The return type for the chatAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatAssistantInputSchema = z.object({
  userRole: z.string().describe('The role of the user (e.g., Investor, ProjectOwner).'),
  history: z.array(MessageSchema).describe('The conversation history.'),
  language: z.string().optional().describe('The user\'s preferred language (e.g., "en", "fr", "es").'),
});
export type ChatAssistantInput = z.infer<typeof ChatAssistantInputSchema>;

const ChatAssistantOutputSchema = z.object({
  message: z.string().describe('The AI-generated response.'),
});
export type ChatAssistantOutput = z.infer<typeof ChatAssistantOutputSchema>;

export async function chatAssistant(input: ChatAssistantInput): Promise<ChatAssistantOutput> {
  return chatAssistantFlow(input);
}

const chatAssistantPrompt = ai.definePrompt({
  name: 'chatAssistantPrompt',
  input: { schema: ChatAssistantInputSchema },
  output: { schema: ChatAssistantOutputSchema },
  prompt: `You are an expert assistant for 3JN CrowdFunding, a crowdfunding investment platform.
  Your goal is to provide helpful, concise, and friendly advice to users.

  Your response should be formatted as a single string.
  {{#if language}}Your response MUST be in the following language: {{{language}}}.{{/if}}

  The user you are talking to has the role: {{{userRole}}}. Tailor your response to their perspective.

  **Platform Overview:**
  - The platform connects entrepreneurs (Project Owners) with investors.
  - Two funding models are offered: Equity (investors get company shares) and Royalty (investors get a percentage of revenue).
  - The platform uses AI to help owners create pitches and financial models, and to help investors analyze opportunities.
  - All financial transactions are handled securely.

  **If the user is a Project Owner:**
  - Guide them on creating effective campaigns.
  - Explain the difference between Equity and Royalty funding.
  - Advise on how to use the AI content generation tools.
  - Answer questions about the dashboard, fees, and the approval process.

  **If the user is an Investor:**
  - Help them find projects that match their interests.
  - Explain how to use the AI analysis tools.
  - Answer questions about their portfolio, ROI, and transaction history.
  - Clarify the risks involved in startup investing.

  **Conversation History:**
  {{#each history}}
  **{{role}}:** {{{content}}}
  {{/each}}

  Based on this history, provide the next response as the model. Do not repeat previous answers. Be helpful and clear.
  `,
});

const chatAssistantFlow = ai.defineFlow(
  {
    name: 'chatAssistantFlow',
    inputSchema: ChatAssistantInputSchema,
    outputSchema: ChatAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await chatAssistantPrompt(input);
    return {
        message: output!.message
    };
  }
);

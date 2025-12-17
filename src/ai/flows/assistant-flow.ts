'use server';
/**
 * @fileOverview A general-purpose AI assistant for the crowdfunding platform.
 *
 * - chatAssistant - A function that handles conversational interactions.
 * - ChatAssistantInput - The input type for the chatAssistant function.
 * - ChatAssistantOutput - The return type for the chatAssistant function.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

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

// Initialize Google Generative AI (FREE - uses Google AI Studio API key)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function chatAssistant(input: ChatAssistantInput): Promise<ChatAssistantOutput> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set. Please get a free API key from https://aistudio.google.com/app/apikey');
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    // Build conversation history for Gemini
    const conversationHistory = input.history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Build the system instruction
    const systemInstruction = `You are an expert assistant for 3JN CrowdFunding, a crowdfunding investment platform.
Your goal is to provide helpful, concise, and friendly advice to users.

${input.language ? `Your response MUST be in the following language: ${input.language}.` : ''}

The user you are talking to has the role: ${input.userRole}. Tailor your response to their perspective.

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

Based on the conversation history, provide the next response as the model. Do not repeat previous answers. Be helpful and clear.`;

    // For Gemini, we need to structure the conversation properly
    const chat = model.startChat({
      history: conversationHistory.slice(0, -1), // All but the last message
      systemInstruction: systemInstruction,
    });

    // Get the last user message
    const lastMessage = input.history[input.history.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      throw new Error('Last message must be from user');
    }

    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;
    const text = response.text();

    return {
      message: text,
    };
  } catch (error: any) {
    console.error('Chat assistant error:', error);
    
    if (error.message?.includes('API_KEY')) {
      throw new Error(
        'Invalid or missing GEMINI_API_KEY. Please get a free API key from https://aistudio.google.com/app/apikey'
      );
    }

    throw new Error(
      `Failed to get chat response: ${error.message || 'Unknown error'}. ` +
      `Please check your GEMINI_API_KEY environment variable.`
    );
  }
}

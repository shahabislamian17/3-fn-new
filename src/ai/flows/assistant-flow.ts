'use server';
/**
 * @fileOverview A general-purpose AI assistant for the crowdfunding platform.
 *
 * - chatAssistant - A function that handles conversational interactions.
 * - ChatAssistantInput - The input type for the chatAssistant function.
 * - ChatAssistantOutput - The return type for the chatAssistant function.
 */

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

/**
 * Chat assistant using FREE Google AI Studio API (direct REST API)
 */
export async function chatAssistant(input: ChatAssistantInput): Promise<ChatAssistantOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Please get a free API key from https://aistudio.google.com/app/apikey');
  }

  try {
    // Validate that we have at least one message and the last one is from the user
    if (input.history.length === 0) {
      throw new Error('History cannot be empty. Please provide at least one user message.');
    }

    const lastMessage = input.history[input.history.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      throw new Error('Last message must be from user. Please ensure the conversation history ends with a user message.');
    }

    // Build conversation history for Gemini API
    // Remove any leading model messages - API requires history to start with user
    let conversationHistory = input.history.slice(0, -1); // All but the last message
    
    // Skip leading model messages
    let startIndex = 0;
    while (startIndex < conversationHistory.length && conversationHistory[startIndex].role === 'model') {
      startIndex++;
    }
    conversationHistory = conversationHistory.slice(startIndex);

    // Ensure proper alternation (user, model, user, model, ...)
    const validatedHistory: Array<{ role: string; content: string }> = [];
    for (const msg of conversationHistory) {
      if (validatedHistory.length === 0) {
        // First message must be from user
        if (msg.role === 'user') {
          validatedHistory.push(msg);
        }
      } else {
        // Subsequent messages must alternate
        const lastMsg = validatedHistory[validatedHistory.length - 1];
        if (lastMsg.role !== msg.role) {
          validatedHistory.push(msg);
        }
      }
    }

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

    // Build the contents array for the API
    // Include system instruction in the first user message (v1 API doesn't support separate systemInstruction field)
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // If this is the first message, include system instruction
    // Otherwise, prepend it to the first user message in history
    if (validatedHistory.length > 0) {
      // Add validated history, but prepend system instruction to the first user message
      for (let i = 0; i < validatedHistory.length; i++) {
        const msg = validatedHistory[i];
        const messageText = i === 0 && msg.role === 'user'
          ? `${systemInstruction}\n\nUser: ${msg.content}`
          : msg.content;
        
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: messageText }],
        });
      }
    }

    // Add the current user message
    const currentUserMessage = validatedHistory.length === 0
      ? `${systemInstruction}\n\nUser: ${lastMessage.content}`
      : lastMessage.content;

    contents.push({
      role: 'user',
      parts: [{ text: currentUserMessage }],
    });

    // Try to find an available model
    let availableModel: string | null = null;
    try {
      const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
      const listResponse = await fetch(listUrl);
      if (listResponse.ok) {
        const listData = await listResponse.json();
        const models = listData.models || [];
        for (const model of models) {
          const supportedMethods = model.supportedGenerationMethods || [];
          if (supportedMethods.includes('generateContent')) {
            const modelName = model.name.replace(/^models\//, '');
            if (modelName.includes('flash')) {
              availableModel = modelName;
              break;
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not list models, will try common model names:', e);
    }

    const modelsToTry = availableModel
      ? [availableModel, 'gemini-1.5-flash', 'gemini-1.5-pro']
      : ['gemini-1.5-flash', 'gemini-1.5-pro'];
    const uniqueModels = [...new Set(modelsToTry)];

    let lastError: Error | null = null;
    for (const modelName of uniqueModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: contents,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          if (modelName === uniqueModels[uniqueModels.length - 1]) {
            throw new Error(`API returned ${response.status}: ${errorText}`);
          }
          console.warn(`Model ${modelName} failed (${response.status}), trying next...`);
          lastError = new Error(`API returned ${response.status}: ${errorText}`);
          continue;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error('No text in API response');
        }

        return { message: text };
      } catch (error: any) {
        lastError = error;
        if (modelName === uniqueModels[uniqueModels.length - 1]) {
          throw error;
        }
        console.warn(`Model ${modelName} failed, trying next...`, error.message);
        continue;
      }
    }

    throw lastError || new Error('All models failed');
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

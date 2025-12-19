'use server';

/**
 * @fileOverview AI agent to suggest funding terms for a project based on location and sector benchmarks.
 *
 * - suggestFundingTerms - A function that suggests funding terms (ask, equity percentage, or royalty terms).
 * - SuggestFundingTermsInput - The input type for the suggestFundingTerms function.
 * - SuggestFundingTermsOutput - The return type for the suggestFundingTerms function.
 */

import { z } from 'zod';

const SuggestFundingTermsInputSchema = z.object({
  location: z
    .string()
    .describe('The location of the project (e.g., country, region).'),
  sector: z.string().describe('The sector of the project (e.g., technology, healthcare).'),
  projectDescription: z.string().describe('A description of the project.'),
});
export type SuggestFundingTermsInput = z.infer<typeof SuggestFundingTermsInputSchema>;

const SuggestFundingTermsOutputSchema = z.object({
  fundingAsk: z
    .string()
    .describe('Suggested funding ask amount (e.g., $100,000).'),
  equityPercentage: z
    .string()
    .describe('Suggested equity percentage to offer (e.g., 10%).'),
  royaltyTerms: z
    .string()
    .describe('Suggested royalty terms (e.g., 5% of revenue until 2x investment multiple).'),
  reasoning: z.string().describe('The reasoning behind the suggested terms.'),
});
export type SuggestFundingTermsOutput = z.infer<typeof SuggestFundingTermsOutputSchema>;

/**
 * Suggests funding terms using FREE Google AI Studio API
 */
export async function suggestFundingTerms(
  input: SuggestFundingTermsInput
): Promise<SuggestFundingTermsOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Please get a free API key from https://aistudio.google.com/app/apikey');
  }

  try {
    const prompt = `You are an expert in crowdfunding investment terms.

Based on the project's location (${input.location}), sector (${input.sector}), and project description (${input.projectDescription}), suggest appropriate funding terms for the project owner, including the funding ask, equity percentage, and royalty terms.

Also, provide a brief explanation for your suggestions.

**IMPORTANT:** You MUST return ONLY valid JSON that matches this exact schema:
{
  "fundingAsk": "string (e.g., $100,000)",
  "equityPercentage": "string (e.g., 10%)",
  "royaltyTerms": "string (e.g., 5% of revenue until 2x investment multiple)",
  "reasoning": "string (brief explanation)"
}

Output the information in the requested JSON format. Return ONLY the JSON, no markdown, no code blocks.`;

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
            contents: [{ parts: [{ text: prompt }] }],
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

        let jsonText = text.trim();
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(jsonText);
        const validated = SuggestFundingTermsOutputSchema.parse(parsed);
        return validated;
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
    console.error('Error in suggestFundingTerms:', error);
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid response format from AI: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      );
    }
    throw new Error(
      `Failed to suggest funding terms: ${error.message || 'Unknown error'}. ` +
      `Please check your GEMINI_API_KEY environment variable.`
    );
  }
}

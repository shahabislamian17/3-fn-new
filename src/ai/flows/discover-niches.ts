
'use server';
/**
 * @fileOverview AI agent to discover profitable and high-potential niches.
 *
 * - discoverNiches - Identifies top 5 niches based on sector and location.
 * - DiscoverNichesInput - The input type for the discoverNiches function.
 * - DiscoverNichesOutput - The return type for the discoverNiches function.
 */

import { z } from 'zod';

const DiscoverNichesInputSchema = z.object({
  sector: z.string().describe('The broad industry or sector of interest.'),
  location: z.string().describe('The geographical market (e.g., city, country).'),
  targetAudience: z.string().optional().describe('The desired target audience (e.g., "millennials", "small businesses", "families").'),
  businessModel: z.string().optional().describe('Preferred business model (e.g., B2B, D2C, SaaS).'),
  capitalAvailable: z.number().optional().describe('The available starting capital.'),
});
export type DiscoverNichesInput = z.infer<typeof DiscoverNichesInputSchema>;

const NicheIdeaSchema = z.object({
    nicheName: z.string().describe('The name of the specific niche idea.'),
    competitivenessScore: z.number().min(0).max(10).describe('A 0-10 score for market competitiveness (lower is better).'),
    successProspectScore: z.number().min(0).max(10).describe('A 0-10 score for the prospect of success.'),
    marketGap: z.string().describe('A brief summary of the market opportunity or gap.'),
    targetAudience: z.string().describe('The specific target audience for this niche.'),
    entryBarrier: z.string().describe('The primary barrier to entry (e.g., "High capital", "Technical expertise", "Regulatory hurdles").'),
    revenueModel: z.string().describe('A suggested revenue model (e.g., "Subscription", "Pay-per-use", "Freemium").'),
});

const DiscoverNichesOutputSchema = z.object({
  niches: z.array(NicheIdeaSchema).length(5).describe('An array of 5 ranked niche ideas.'),
});
export type DiscoverNichesOutput = z.infer<typeof DiscoverNichesOutputSchema>;

/**
 * Discovers profitable niches based on user input
 * Uses FREE Google AI Studio API (no billing required)
 * Uses REST API directly to ensure v1 endpoint compatibility
 */
export async function discoverNiches(input: DiscoverNichesInput): Promise<DiscoverNichesOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Please get a free API key from https://aistudio.google.com/app/apikey');
  }

  try {
    // Build the prompt from user inputs
    const prompt = `You are a market research analyst and venture capital scout. Your goal is to identify the top 5 most profitable and high-potential niches within a given sector and location.

**User Inputs:**
- Sector/Industry: ${input.sector}
- Location: ${input.location}
${input.targetAudience ? `- Target Audience: ${input.targetAudience}` : ''}
${input.businessModel ? `- Business Model: ${input.businessModel}` : ''}
${input.capitalAvailable ? `- Capital Available: ${input.capitalAvailable}` : ''}

**Instructions:**

1. Based on the user's inputs and your knowledge of global and local market trends, identify 5 specific, underserved, or emerging niches.
2. For each niche, provide the following:
   - **nicheName:** A clear, descriptive name for the niche.
   - **competitivenessScore (0-10):** How competitive is this niche? 0 is a blue ocean, 10 is a red ocean.
   - **successProspectScore (0-10):** What is the potential for success? Consider demand, scalability, and profitability. 10 is highest potential.
   - **marketGap:** A one-sentence summary of why this niche is a good opportunity right now.
   - **targetAudience:** A description of the ideal customer for this niche.
   - **entryBarrier:** The main barrier to entry (e.g., "High capital", "Technical expertise", "Regulatory hurdles").
   - **revenueModel:** The most suitable revenue model for this niche (e.g., "Subscription", "Commission-based").
3. Rank the niches in the final array from best to worst, with the top-ranked (most promising) niche at index 0. The ranking should be a balance of high success prospect and low competitiveness.

**IMPORTANT:** You MUST return ONLY valid JSON that matches this exact schema:
{
  "niches": [
    {
      "nicheName": "string",
      "competitivenessScore": number (0-10),
      "successProspectScore": number (0-10),
      "marketGap": "string",
      "targetAudience": "string",
      "entryBarrier": "string",
      "revenueModel": "string"
    }
  ]
}

Generate the 5 niche recommendations now. Return ONLY the JSON, no markdown, no code blocks.`;

    // First, list available models to find one that works
    let availableModel: string | null = null;
    
    try {
      const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
      const listResponse = await fetch(listUrl);
      
      if (listResponse.ok) {
        const listData = await listResponse.json();
        const models = listData.models || [];
        
        console.log(`Found ${models.length} available models`);
        
        // Find a model that supports generateContent
        for (const model of models) {
          const supportedMethods = model.supportedGenerationMethods || [];
          if (supportedMethods.includes('generateContent')) {
            // Extract model name (remove 'models/' prefix if present)
            const modelName = model.name.replace(/^models\//, '');
            availableModel = modelName;
            console.log(`✅ Found available model: ${modelName}`);
            break;
          }
        }
        
        if (!availableModel && models.length > 0) {
          console.warn('No models found with generateContent support. Available models:', 
            models.map((m: any) => m.name).join(', '));
        }
      } else {
        const errorText = await listResponse.text();
        console.warn(`Could not list models (${listResponse.status}):`, errorText);
      }
    } catch (e: any) {
      console.warn('Could not list models, will try common model names:', e.message);
    }

    // Try available model first, then fallback to v1-compatible models only
    // Note: gemini-pro is NOT available in v1 API, only in v1beta (which we're not using)
    const modelsToTry = availableModel 
      ? [availableModel, 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest']
      : ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'];
    
    // Remove duplicates
    const uniqueModels = [...new Set(modelsToTry)];
    
    let lastError: Error | null = null;

    for (const modelName of uniqueModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          // If this is the last model, throw immediately
          if (modelName === uniqueModels[uniqueModels.length - 1]) {
            throw new Error(`API returned ${response.status}: ${errorText}`);
          }
          // Otherwise, try next model
          console.warn(`Model ${modelName} failed (${response.status}), trying next...`);
          lastError = new Error(`API returned ${response.status}: ${errorText}`);
          continue;
        }

        const data = await response.json();
        
        // Extract text from response
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error('No text in API response');
        }

        // Parse JSON from response (remove markdown code blocks if present)
        let jsonText = text.trim();
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        // Parse and validate with Zod
        const parsed = JSON.parse(jsonText);
        const validated = DiscoverNichesOutputSchema.parse(parsed);

        return validated;
      } catch (error: any) {
        lastError = error;
        // If this is the last model, don't continue
        if (modelName === uniqueModels[uniqueModels.length - 1]) {
          throw error;
        }
        // Otherwise, try next model
        console.warn(`Model ${modelName} failed, trying next...`, error.message);
        continue;
      }
    }

    // Should never reach here, but TypeScript needs it
    throw lastError || new Error('All models failed');
  } catch (error: any) {
    console.error('Error in discoverNiches:', error);
    
    // Provide helpful error messages
    if (error.message?.includes('API_KEY')) {
      throw new Error(
        'Invalid or missing GEMINI_API_KEY. Please get a free API key from https://aistudio.google.com/app/apikey'
      );
    }
    
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid response format from AI: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      );
    }

    throw new Error(
      `Failed to discover niches: ${error.message || 'Unknown error'}. ` +
      `Please check your GEMINI_API_KEY environment variable.`
    );
  }
}

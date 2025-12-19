'use server';
/**
 * @fileOverview AI agent to assess a project's investment readiness.
 *
 * - generateReadinessScore - Analyzes a project and returns competitiveness and success scores.
 * - GenerateReadinessScoreInput - The input type for the generateReadinessScore function.
 * - GenerateReadinessScoreOutput - The return type for the generateReadinessScore function.
 */

import { z } from 'zod';

const GenerateReadinessScoreInputSchema = z.object({
  sector: z.string().describe('The sector or category of the project.'),
  location: z.string().describe('The geographical location of the project.'),
  stage: z.string().describe('The current stage of the project (e.g., Seed, Growth).'),
  fundingType: z.enum(['Equity', 'Royalty']).describe('The project\'s funding model.'),
  targetAmount: z.number().describe('The funding target amount.'),
  valuation: z.number().optional().describe('The pre-money valuation of the project (for equity).'),
  description: z.string().describe('The detailed summary of the project, including its mission and product.'),
  competitors: z.string().optional().describe('A list of known competitors.'),
  differentiator: z.string().optional().describe('The project\'s main unique selling proposition or differentiator.'),
});
export type GenerateReadinessScoreInput = z.infer<typeof GenerateReadinessScoreInputSchema>;

const GenerateReadinessScoreOutputSchema = z.object({
  competitivenessScore: z.number().min(0).max(10).describe('A score from 0 to 10 for market competitiveness.'),
  successScore: z.number().min(0).max(10).describe('A score from 0 to 10 for prospect of success.'),
  summary: z.string().describe('A 50-100 word justification for the scores.'),
  improvementPlan: z.array(z.string()).describe('A tailored, actionable improvement plan based on the scores.'),
});
export type GenerateReadinessScoreOutput = z.infer<typeof GenerateReadinessScoreOutputSchema>;

/**
 * Generates investment readiness score using FREE Google AI Studio API
 */
export async function generateReadinessScore(input: GenerateReadinessScoreInput): Promise<GenerateReadinessScoreOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Please get a free API key from https://aistudio.google.com/app/apikey');
  }

  try {
    const prompt = `You are an expert investment analyst specializing in early-stage startups and crowdfunding campaigns.
Your task is to provide an AI-assessed "Investment Readiness" score.

**Project Details:**
- Sector: ${input.sector}
- Location: ${input.location}
- Stage: ${input.stage}
- Funding Model: ${input.fundingType}
- Funding Target: ${input.targetAmount}
- Valuation: ${input.valuation || 'Not specified'}
- Description: ${input.description}
- Known Competitors: ${input.competitors || 'Not specified'}
- Main Differentiator: ${input.differentiator || 'Not specified'}

**Instructions:**

1. **Assess Competitiveness (0-10):**
   - **High (8-10):** Niche market, strong differentiator, clear IP or cost advantage, few direct competitors.
   - **Moderate (5-7):** Competitive market but with a solid unique selling proposition. Some established players exist.
   - **Low (0-4):** Saturated market, unclear differentiator, many dominant competitors.

2. **Assess Prospect of Success (0-10):**
   - **High (8-10):** Experienced team (implied), realistic funding goal for the stage, strong problem-solution fit, scalable business model.
   - **Moderate (5-7):** Ambitious but plausible goals. Business model is sound but may face execution challenges. Funding ask is reasonable.
   - **Low (0-4):** Unclear business model, unrealistic funding target for the stage, significant execution risks, or weak problem-solution fit.

3. **Write Justification Summary (50-100 words):**
   - Provide a concise summary explaining the reasoning behind your two scores.

4. **Generate AI Improvement Plan:**
   - Based on the **lowest** of the two scores, generate a tailored improvement plan.
   - If the lowest score is **Weak (0-4)**, provide a detailed 5-step turnaround plan.
   - If the lowest score is **Moderate (5-7)**, provide a 3-step optimization plan.
   - If both scores are **Strong (8-10)**, provide a 2-step scaling or acceleration plan.
   - Each step in the plan must be a clear, actionable recommendation.

**IMPORTANT:** You MUST return ONLY valid JSON that matches this exact schema:
{
  "competitivenessScore": number (0-10),
  "successScore": number (0-10),
  "summary": "string (50-100 words)",
  "improvementPlan": ["string", "string", ...]
}

Generate the readiness assessment now. Return ONLY the JSON, no markdown, no code blocks.`;

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
        const validated = GenerateReadinessScoreOutputSchema.parse(parsed);
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
    console.error('Error in generateReadinessScore:', error);
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid response format from AI: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      );
    }
    throw new Error(
      `Failed to generate readiness score: ${error.message || 'Unknown error'}. ` +
      `Please check your GEMINI_API_KEY environment variable.`
    );
  }
}

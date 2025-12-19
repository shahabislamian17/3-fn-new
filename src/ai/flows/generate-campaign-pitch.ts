'use server';

/**
 * @fileOverview AI-powered campaign pitch generator for project owners.
 *
 * - generateCampaignPitch - Generates a short public pitch and a long-form project description for a campaign.
 * - GenerateCampaignPitchInput - The input type for the generateCampaignPitch function.
 * - GenerateCampaignPitchOutput - The return type for the generateCampaignPitch function.
 */

import { z } from 'zod';

const GenerateCampaignPitchInputSchema = z.object({
  industry: z.string().describe('The industry of the project.'),
  country: z.string().describe('The country where the project is based.'),
  projectDescription: z.string().describe('A detailed description of the project.'),
  tone: z.enum(['persuasive', 'neutral', 'conservative']).default('persuasive').describe('The tone of the pitch.'),
});
export type GenerateCampaignPitchInput = z.infer<typeof GenerateCampaignPitchInputSchema>;

const GenerateCampaignPitchOutputSchema = z.object({
  shortPitch: z.string().describe('A short, public-facing pitch for the campaign (a one-sentence hook + a 60-120 word paragraph).'),
  longPitch: z.string().describe('A long-form, detailed project description for investors, structured with clear headings for the narrative, benefits, and risks, and including a disclaimer.'),
});
export type GenerateCampaignPitchOutput = z.infer<typeof GenerateCampaignPitchOutputSchema>;

/**
 * Generates campaign pitch using FREE Google AI Studio API
 */
export async function generateCampaignPitch(input: GenerateCampaignPitchInput): Promise<GenerateCampaignPitchOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Please get a free API key from https://aistudio.google.com/app/apikey');
  }

  try {
    const prompt = `You are an expert marketing copywriter specializing in crowdfunding campaigns.

Given the following project details, generate a compelling short public pitch and a detailed long-form project description.
The tone for both should be ${input.tone}.

**Project Details:**
- **Industry:** ${input.industry}
- **Country:** ${input.country}
- **Project Description:** ${input.projectDescription}

**Instructions:**

1. **Short Pitch:**
   - Start with a powerful one-sentence hook.
   - Follow with a concise paragraph (60-120 words) that grabs attention and summarizes the core value proposition.

2. **Long-Form Pitch:**
   - **Project Narrative:** Create a compelling story about the project. What is the problem, and how does this project solve it?
   - **Benefits:** Clearly outline the key benefits for investors and the market.
   - **Risk Summary:** Provide a balanced overview of potential risks.
   - **Disclaimer:** At the end, you MUST include the following legal disclaimer as a separate paragraph: "Disclaimer: This content is for marketing purposes. All investments carry risk, and projections are not guarantees of future performance. Please conduct your own due diligence."
   - Ensure the language is compliance-friendly. The final output for the long pitch should be a single string with paragraphs separated by newlines.

**IMPORTANT:** You MUST return ONLY valid JSON that matches this exact schema:
{
  "shortPitch": "string (one-sentence hook + 60-120 word paragraph)",
  "longPitch": "string (long-form description with narrative, benefits, risks, and disclaimer, paragraphs separated by \\n)"
}

Output the results in the requested JSON format. Return ONLY the JSON, no markdown, no code blocks.`;

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
        const validated = GenerateCampaignPitchOutputSchema.parse(parsed);
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
    console.error('Error in generateCampaignPitch:', error);
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid response format from AI: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      );
    }
    throw new Error(
      `Failed to generate campaign pitch: ${error.message || 'Unknown error'}. ` +
      `Please check your GEMINI_API_KEY environment variable.`
    );
  }
}

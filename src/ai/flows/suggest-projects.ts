'use server';

/**
 * @fileOverview AI agent to suggest new investment opportunities to an investor based on their portfolio.
 *
 * - suggestProjects - Suggests projects based on an investor's profile and available projects.
 * - SuggestProjectsInput - The input type for the suggestProjects function.
 * - SuggestProjectsOutput - The return type for the suggestProjects function.
 */

import { z } from 'zod';

const ProjectInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  type: z.enum(['Equity', 'Royalty']),
  location: z.string(),
  shortDescription: z.string(),
});

const InvestorProfileSchema = z.object({
  riskAppetite: z.enum(['low', 'medium', 'high']).optional(),
  preferredInvestmentTypes: z.array(z.enum(['Equity', 'Royalty'])).optional(),
  preferredCategories: z.array(z.string()).optional().describe("A list of the investor's preferred project categories."),
  preferredCountries: z.array(z.string()).optional().describe("A list of the investor's preferred countries."),
  portfolio: z.array(ProjectInfoSchema).describe("A list of projects the investor has already invested in."),
});

const SuggestProjectsInputSchema = z.object({
  investorProfile: InvestorProfileSchema,
  availableProjects: z.array(ProjectInfoSchema).describe("A list of available projects to choose from for recommendations."),
});

export type SuggestProjectsInput = z.infer<typeof SuggestProjectsInputSchema>;

const SuggestedProjectSchema = z.object({
    projectId: z.string().describe("The ID of the suggested project."),
    reasoning: z.string().describe("A brief, compelling reason why this project is a good fit for the investor (1-2 sentences)."),
    matchScore: z.number().min(0).max(100).describe("The match score (0-100) for this recommendation.")
});

const SuggestProjectsOutputSchema = z.object({
  suggestions: z.array(SuggestedProjectSchema).describe("An array of up to 3 suggested projects."),
});
export type SuggestProjectsOutput = z.infer<typeof SuggestProjectsOutputSchema>;

/**
 * Suggests projects using FREE Google AI Studio API
 */
export async function suggestProjects(
  input: SuggestProjectsInput
): Promise<SuggestProjectsOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Please get a free API key from https://aistudio.google.com/app/apikey');
  }

  try {
    // Filter out projects the investor is already in
    const portfolioProjectIds = new Set(input.investorProfile.portfolio.map(p => p.id));
    const filteredAvailableProjects = input.availableProjects.filter(p => !portfolioProjectIds.has(p.id));

    if (filteredAvailableProjects.length === 0) {
        return { suggestions: [] };
    }

    const prompt = `You are an expert investment analyst for a crowdfunding platform. Your task is to recommend new projects to an investor based on their profile and past investment behavior, calculating a match score for each.

**Investor Profile:**
- **Risk Appetite:** ${input.investorProfile.riskAppetite || 'Not specified'}
- **Preferred Investment Types:** ${JSON.stringify(input.investorProfile.preferredInvestmentTypes || [])}
- **Preferred Categories:** ${JSON.stringify(input.investorProfile.preferredCategories || [])}
- **Preferred Countries:** ${JSON.stringify(input.investorProfile.preferredCountries || [])}
- **Existing Portfolio:** ${JSON.stringify(input.investorProfile.portfolio)}

**Available Projects for Recommendation:**
${JSON.stringify(filteredAvailableProjects)}

**Instructions:**
1. Analyze the investor's profile: their explicit preferences (countries, categories, types) and their implicit interests from their existing portfolio.
2. For each available project, calculate a match score based on this weighted formula:
   - **Location Match (25%):** Does the project's country match the investor's preferred countries? (1 if match or no preference, 0 otherwise).
   - **Category Match (25%):** Does the project's category match their preferred categories OR categories in their portfolio? (1 if match or no preference, 0 otherwise).
   - **Funding Type Match (20%):** Does the funding type match their preference? (1 if match or no preference, 0 otherwise).
   - **Ticket Size / Stage Match (15%):** (Implied) Is the project's stage and typical investment size a good fit? (Subjective 0-1 score).
   - **Risk Match (15%):** Does the project type (e.g., early-stage Equity) align with their risk appetite? (Subjective 0-1 score).
   - **Final Score = (location_match * 0.25) + (category_match * 0.25) + (funding_type_match * 0.20) + (ticket_size_match * 0.15) + (risk_match * 0.15)**
   The final score should be a number between 0 and 100.
3. From the list of available projects, select up to 3 with the highest match scores (must be over 75).
4. For each recommendation, provide a short, personalized reasoning (1-2 sentences) explaining why it's a good fit. For example, "Because you're interested in AgriTech in Nigeria, you might like..." or "This fits your preference for high-growth Equity investments."
5. Do NOT suggest projects that the investor has already invested in.

**IMPORTANT:** You MUST return ONLY valid JSON that matches this exact schema:
{
  "suggestions": [
    {
      "projectId": "string",
      "reasoning": "string (1-2 sentences)",
      "matchScore": number (0-100)
    }
  ]
}

Generate the recommendations now. Return ONLY the JSON, no markdown, no code blocks.`;

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
        const validated = SuggestProjectsOutputSchema.parse(parsed);
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
    console.error('Error in suggestProjects:', error);
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid response format from AI: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      );
    }
    throw new Error(
      `Failed to suggest projects: ${error.message || 'Unknown error'}. ` +
      `Please check your GEMINI_API_KEY environment variable.`
    );
  }
}

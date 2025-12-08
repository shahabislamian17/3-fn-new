

'use server';

/**
 * @fileOverview AI agent to suggest new investment opportunities to an investor based on their portfolio.
 *
 * - suggestProjects - Suggests projects based on an investor's profile and available projects.
 * - SuggestProjectsInput - The input type for the suggestProjects function.
 * - SuggestProjectsOutput - The return type for the suggestProjects function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

export async function suggestProjects(
  input: SuggestProjectsInput
): Promise<SuggestProjectsOutput> {
  return suggestProjectsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestProjectsPrompt',
  input: {schema: SuggestProjectsInputSchema},
  output: {schema: SuggestProjectsOutputSchema},
  prompt: `You are an expert investment analyst for a crowdfunding platform. Your task is to recommend new projects to an investor based on their profile and past investment behavior, calculating a match score for each.

**Investor Profile:**
- **Risk Appetite:** {{investorProfile.riskAppetite}}
- **Preferred Investment Types:** {{json investorProfile.preferredInvestmentTypes}}
- **Preferred Categories:** {{json investorProfile.preferredCategories}}
- **Preferred Countries:** {{json investorProfile.preferredCountries}}
- **Existing Portfolio:** {{json investorProfile.portfolio}}

**Available Projects for Recommendation:**
{{json availableProjects}}

**Instructions:**
1.  Analyze the investor's profile: their explicit preferences (countries, categories, types) and their implicit interests from their existing portfolio.
2.  For each available project, calculate a match score based on this weighted formula:
    - **Location Match (25%):** Does the project's country match the investor's preferred countries? (1 if match or no preference, 0 otherwise).
    - **Category Match (25%):** Does the project's category match their preferred categories OR categories in their portfolio? (1 if match or no preference, 0 otherwise).
    - **Funding Type Match (20%):** Does the funding type match their preference? (1 if match or no preference, 0 otherwise).
    - **Ticket Size / Stage Match (15%):** (Implied) Is the project's stage and typical investment size a good fit? (Subjective 0-1 score).
    - **Risk Match (15%):** Does the project type (e.g., early-stage Equity) align with their risk appetite? (Subjective 0-1 score).
    - **Final Score = (location_match * 0.25) + (category_match * 0.25) + (funding_type_match * 0.20) + (ticket_size_match * 0.15) + (risk_match * 0.15)**
    The final score should be a number between 0 and 100.
3.  From the list of available projects, select up to 3 with the highest match scores (must be over 75).
4.  For each recommendation, provide a short, personalized reasoning (1-2 sentences) explaining why it's a good fit. For example, "Because you're interested in AgriTech in Nigeria, you might like..." or "This fits your preference for high-growth Equity investments."
5.  Do NOT suggest projects that the investor has already invested in.
6.  Ensure your output is a valid JSON object matching the requested schema.
`,
});

const suggestProjectsFlow = ai.defineFlow(
  {
    name: 'suggestProjectsFlow',
    inputSchema: SuggestProjectsInputSchema,
    outputSchema: SuggestProjectsOutputSchema,
  },
  async input => {
    // Filter out projects the investor is already in
    const portfolioProjectIds = new Set(input.investorProfile.portfolio.map(p => p.id));
    const filteredAvailableProjects = input.availableProjects.filter(p => !portfolioProjectIds.has(p.id));

    if (filteredAvailableProjects.length === 0) {
        return { suggestions: [] };
    }

    const {output} = await prompt({ ...input, availableProjects: filteredAvailableProjects });
    return output!;
  }
);

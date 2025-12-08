
'use server';
/**
 * @fileOverview AI agent to generate SEO-optimized blog articles.
 *
 * - generateBlogPost - A function that creates a draft blog post.
 * - GenerateBlogPostInput - The input type for the function.
 * - GenerateBlogPostOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateBlogPostInputSchema = z.object({
  topic: z.string().describe('The target topic for the blog article.'),
  language: z.enum(['en', 'fr', 'es']).default('en').describe('The language for the article (e.g., "en", "fr").'),
  countryContext: z.string().optional().describe('Country context examples to include, e.g., "DRC, Kenya"'),
});
export type GenerateBlogPostInput = z.infer<typeof GenerateBlogPostInputSchema>;

export const GenerateBlogPostOutputSchema = z.object({
    title: z.string(),
    meta_title: z.string(),
    meta_description: z.string().max(160, "Meta description should be under 160 characters."),
    primary_keyword: z.string(),
    secondary_keywords: z.array(z.string()),
    excerpt: z.string(),
    content_markdown: z.string().describe("The full article content in Markdown format, with H1, H2, H3 headings, lists, and bold text."),
    hero_image_prompt: z.string().describe("A descriptive prompt for an AI image generator to create a hero image for the article."),
});
export type GenerateBlogPostOutput = z.infer<typeof GenerateBlogPostOutputSchema>;

export async function generateBlogPost(input: GenerateBlogPostInput): Promise<GenerateBlogPostOutput> {
  return generateBlogPostFlow(input);
}

const generateBlogPostPrompt = ai.definePrompt({
  name: 'generateBlogPostPrompt',
  input: { schema: GenerateBlogPostInputSchema },
  output: { schema: GenerateBlogPostOutputSchema },
  prompt: `You are an expert SEO content writer specializing in financial technology and investment.

Your task is to write a long-form, SEO-optimized blog article for a crowdfunding platform named "3JN Fund".

**Instructions:**
- **Language:** Write the article in {{language}}.
- **Target Topic:** "{{topic}}"
- **Target Audience:** Beginner to intermediate investors and entrepreneurs.
- **Content Structure:** The article must include a main H1 title, several H2 and H3 headings for organization, and use bullet points or numbered lists where appropriate.
- **Tone:** The tone should be trustworthy, educational, and slightly inspirational.
- **Context:** Where relevant, include examples related to countries like the DRC, Kenya, Nigeria, or the UK/Europe.
- **Call to Action (CTA):** Naturally weave in a call-to-action, such as encouraging readers to "Create your 3JN Fund account" or "Browse live campaigns".
- **Output:** Your final output must be a single JSON object matching the required schema.

Generate the article now.
  `,
});

const generateBlogPostFlow = ai.defineFlow(
  {
    name: 'generateBlogPostFlow',
    inputSchema: GenerateBlogPostInputSchema,
    outputSchema: GenerateBlogPostOutputSchema,
  },
  async (input) => {
    const { output } = await generateBlogPostPrompt(input);
    return output!;
  }
);

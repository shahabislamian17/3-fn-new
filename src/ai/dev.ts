'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-campaign-pitch.ts';
import '@/ai/flows/generate-financial-projections.ts';
import '@/ai/flows/suggest-funding-terms.ts';
import '@/ai/flows/suggest-investment.ts';
import '@/ai/flows/suggest-projects.ts';
import '@/ai/flows/assistant-flow.ts';
import '@/ai/flows/generate-kyc-suggestion.ts';
import '@/ai/flows/generate-readiness-score.ts';
import '@/ai/flows/discover-niches.ts';
import '@/ai/flows/generate-compliance-recommendation.ts';
import '@/ai/flows/generate-marketing-strategy.ts';
import '@/ai/flows/generate-legal-document.ts';
import '@/ai/flows/generate-seo-metadata.ts';
import '@/ai/flows/generate-blog-post.ts';
import '@/ai/flows/gatekeeper-flow.ts';

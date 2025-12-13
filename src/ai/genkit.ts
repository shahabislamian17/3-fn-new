import {genkit} from 'genkit';
import {vertexAI} from '@genkit-ai/vertexai';

// Get project ID from Firebase project ID (they're the same)
const projectId = process.env.GCP_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!projectId) {
  console.warn('⚠️  GCP_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID not set. Vertex AI may not work.');
}

export const ai = genkit({
  plugins: [
    vertexAI({
      projectId: projectId!,
      location: process.env.GCP_LOCATION || 'us-central1',
    }),
  ],
});

import { describe, it, expect } from 'vitest';
import 'dotenv/config';

describe('Environment Variables', () => {
  it('should have all required environment variables defined', () => {
    const requiredEnvs = [
        'NEXT_PUBLIC_BASE_URL',
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET',
        'FIREBASE_PROJECT_ID',
        'GEMINI_API_KEY',
    ];
    const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
    expect(missingEnvs, `Missing env vars: ${missingEnvs.join(', ')}`).toEqual([]);
  });
});

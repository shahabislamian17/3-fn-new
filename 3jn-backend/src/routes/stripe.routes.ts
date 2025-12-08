import { Router } from 'express';
import { createConnectedAccount, createOnboardingLink, stripeWebhook } from '@/controllers/stripe.controller';
import { requireRole } from '@/middleware/rbac.middleware';
import { protect } from '@/middleware/auth.middleware';

const router = Router();

// These routes require a ProjectOwner role and user must be authenticated
router.post('/create-connected-account', protect, requireRole('ProjectOwner'), createConnectedAccount);
router.post('/create-onboarding-link', protect, requireRole('ProjectOwner'), createOnboardingLink);

// Stripe webhook is called by Stripe, so it needs its own raw body parser and separate auth.
// This is handled in app.ts before this router is used.
router.post('/webhook', stripeWebhook);

export default router;

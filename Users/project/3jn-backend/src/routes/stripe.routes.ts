import { Router } from 'express';
import express from 'express';
import { createConnectedAccount, createOnboardingLink, stripeWebhook } from '@/controllers/stripe.controller';
import { protect } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/rbac.middleware';

const router = Router();

// These routes should be called by an authenticated ProjectOwner
router.post('/create-connected-account', protect, requireRole('ProjectOwner'), createConnectedAccount);
router.post('/create-onboarding-link', protect, requireRole('ProjectOwner'), createOnboardingLink);

// Stripe webhook needs to be a raw body parser, so we handle it separately
router.post('/webhook', express.raw({type: 'application/json'}), stripeWebhook);


export default router;

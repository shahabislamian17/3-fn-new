import { Router } from 'express';
import { createCheckoutSession } from '@/controllers/checkout.controller';
import { protect } from '@/middleware/auth.middleware';

const router = Router();

// This route must be protected to ensure we have a logged-in user.
router.post('/create-session', protect, createCheckoutSession);

export default router;

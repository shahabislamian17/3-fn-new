
import { Router } from 'express';
import { createCheckoutSession } from '@/controllers/checkout.controller';
import { protect } from '@/middleware/auth.middleware';

const router = Router();

// The user is already attached by the proxy middleware if userId was provided
router.post('/create-session', protect, createCheckoutSession);

export default router;

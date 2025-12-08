import { Router } from 'express';
import { createCheckoutSession } from '@/controllers/checkout.controller';
import { protect } from '@/middleware/auth.middleware';

const router = Router();

router.post('/create-session', protect, createCheckoutSession);

export default router;


import { Router } from 'express';
import { createLinkToken, exchangePublicToken, createProcessorToken } from '@/controllers/plaid.controller';
import { protect } from '@/middleware/auth.middleware';

const router = Router();

router.post('/create-link-token', protect, createLinkToken);
router.post('/exchange-public-token', protect, exchangePublicToken);
router.post('/create-processor-token', protect, createProcessorToken);

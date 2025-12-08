import { Router } from 'express';
import { createLinkToken, exchangePublicToken, createProcessorToken } from '@/controllers/plaid.controller';
import { protect } from '@/middleware/auth.middleware';

const router = Router();

// All plaid routes should be protected
router.use(protect);

router.post('/create-link-token', createLinkToken);
router.post('/exchange-public-token', exchangePublicToken);
router.post('/create-processor-token', createProcessorToken);

export default router;

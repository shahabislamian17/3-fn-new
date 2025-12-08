import { Router } from 'express';
import { getMyCampaigns, getMyInvestments } from '@/controllers/user.controller';
import { protect } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/rbac.middleware';

const router = Router();

router.get('/campaigns', protect, requireRole('ProjectOwner'), getMyCampaigns);
router.get('/investments', protect, requireRole('Investor'), getMyInvestments);

export default router;

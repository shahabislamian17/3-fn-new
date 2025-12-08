
import { Router } from 'express';
import { getMyCampaigns, getMyInvestments, updateUserProfile } from '@/controllers/user.controller';
import { requireRole } from '@/middleware/rbac.middleware';
import { protect } from '@/middleware/auth.middleware';

const router = Router();

router.get('/campaigns', requireRole('ProjectOwner'), getMyCampaigns);
router.get('/investments', requireRole('Investor'), getMyInvestments);
router.patch('/profile', updateUserProfile);


export default router;

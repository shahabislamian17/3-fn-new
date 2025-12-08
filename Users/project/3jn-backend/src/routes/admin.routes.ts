import { Router } from 'express';
import { bulkMatchProjects } from '@/controllers/admin.controller';
import { protect } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/rbac.middleware';

const router = Router();

router.post('/match-projects/all', protect, requireRole('Admin'), bulkMatchProjects);

export default router;

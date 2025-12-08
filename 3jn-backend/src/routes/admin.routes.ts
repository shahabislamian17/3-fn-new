import { Router } from 'express';
import { bulkMatchProjects } from '@/controllers/admin.controller';
import { requireRole } from '@/middleware/rbac.middleware';

const router = Router();

router.post('/match-projects/all', requireRole('Admin'), bulkMatchProjects);

export default router;

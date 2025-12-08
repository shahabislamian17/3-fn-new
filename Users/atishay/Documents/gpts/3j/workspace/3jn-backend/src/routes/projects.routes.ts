
import { Router } from 'express';
import { getProjects, createProject } from '@/controllers/project.controller';
import { requireRole } from '@/middleware/rbac.middleware';
import { requireKycPassed } from '@/middleware/kyc.middleware';
import { protect } from '@/middleware/auth.middleware';

const router = Router();

// Public route to get live projects, handled by the public router in api.ts
router.get('/', getProjects);

// Protected route to create a project
router.post(
    '/', 
    protect,
    requireRole('ProjectOwner'), 
    requireKycPassed("publish_project"),
    createProject
);


export default router;

// backend/src/routes/projects.routes.ts
import { Router } from 'express';
import { getProjects, createProject, getProjectBySlug } from '@/controllers/project.controller';
import { requireRole } from '@/middleware/rbac.middleware';
import { requireKycPassed } from '@/middleware/kyc.middleware';
import { protect } from '@/middleware/auth.middleware';

const router = Router();

// Public route to get live projects
router.get('/', getProjects);

// Public route to get a single project by slug
router.get('/:slug', getProjectBySlug);

// Protected route to create a project
router.post(
    '/', 
    protect,
    requireRole('ProjectOwner'), 
    requireKycPassed("publish_project"),
    createProject
);


export default router;

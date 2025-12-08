import { Router } from 'express';
import { getProjects, createProject } from '@/controllers/project.controller';
import { protect } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/rbac.middleware';

const router = Router();

// Public route to get live projects
router.get('/', getProjects);

// Protected route to create a project
router.post('/', protect, requireRole('ProjectOwner'), createProject);


export default router;

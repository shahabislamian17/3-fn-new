import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';
import { createProject as createProjectService } from '@/services/project.service';
import { adminDb } from '@/core/firebase';
import type { Project } from '@/core/types';

export const getProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const projectsRef = adminDb.collection('projects');
        const q = projectsRef.where('status', '==', 'live');
        const querySnapshot = await q.get();
        const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        res.status(200).json(projects);
    } catch (err) {
        next(err);
    }
};

export const createProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const body = req.body;

        const project = await createProjectService({
            ...body,
            owner: {
                id: user!.id,
                name: user!.name,
                avatarUrl: user!.avatarUrl,
                avatarHint: user!.avatarHint,
            },
        });

        res.status(201).json(project);
    } catch (err) {
        next(err);
    }
};

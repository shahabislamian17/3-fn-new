// backend/src/controllers/project.controller.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';
import { createProject as createProjectService } from '@/services/project.service';
import { adminDb } from '@/core/firebase';
import type { Project } from '@/core/types';
import { query, where, getDocs, collection, limit } from 'firebase/firestore';

export const getProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const projectsRef = adminDb.collection('projects');
        const q = query(projectsRef, where('status', '==', 'live'));
        const querySnapshot = await getDocs(q);
        const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        res.status(200).json(projects);
    } catch (err) {
        next(err);
    }
};

export const getProjectBySlug = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const projectsRef = collection(adminDb, 'projects');
        const q = query(projectsRef, where('slug', '==', slug), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const projectDoc = querySnapshot.docs[0];
        const project = { id: projectDoc.id, ...projectDoc.data() } as Project;
        
        res.status(200).json(project);
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
                id: user.id,
                name: user.name,
                avatarUrl: user.avatarUrl,
                avatarHint: user.avatarHint,
            },
        });

        res.status(201).json(project);
    } catch (err) {
        next(err);
    }
};

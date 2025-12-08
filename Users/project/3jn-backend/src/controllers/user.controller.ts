import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { adminDb } from '@/core/firebase';

export const getMyCampaigns = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const ownerId = req.user!.id;
        const projectsRef = adminDb.collection('projects');
        const q = query(projectsRef, where('owner.id', '==', ownerId));
        const querySnapshot = await getDocs(q);
        const projects = querySnapshot.docs.map(doc => doc.data());
        res.status(200).json({ campaigns: projects });
    } catch (err) {
        next(err);
    }
};

export const getMyInvestments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const investmentsRef = adminDb.collection('investments');
        const q = investmentsRef.where('userId', '==', userId);
        const querySnapshot = await q.get();
        const investments = querySnapshot.docs.map(doc => doc.data());
        res.status(200).json({ investments });
    } catch (err) {
        next(err);
    }
};

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';
import { adminDb } from '@/core/firebase';
import type { Notification } from '@/core/types';

export const getNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const notificationsRef = adminDb.collection('notifications');
        const q = notificationsRef.where('userId', '==', userId);
        const querySnapshot = await q.get();
        const notifications: Notification[] = [];
        querySnapshot.forEach((doc) => {
            notifications.push({ id: doc.id, ...doc.data() } as Notification);
        });
        res.status(200).json(notifications);
    } catch (err) {
        next(err);
    }
};

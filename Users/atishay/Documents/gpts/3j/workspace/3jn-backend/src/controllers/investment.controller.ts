
// backend/src/controllers/investment.controller.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';
import { adminDb } from '@/core/firebase';

export const createInvestment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { projectId, amount } = req.body;
        const userId = req.user!.id;

        const investment = {
            userId,
            projectId,
            amount: parseFloat(amount),
            status: "pending",
            createdAt: new Date().toISOString(),
        };

        const ref = await adminDb.collection("investments").add(investment);
        res.status(201).json({ id: ref.id, ...investment });
    } catch (err) {
        next(err);
    }
};

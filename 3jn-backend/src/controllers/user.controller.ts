
// backend/src/controllers/user.controller.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { adminDb } from '@/core/firebase';
import { isStripeSupported } from '@/core/stripe-support';
import { isPlaidSupported } from '@/core/plaid-support';

export const getMyCampaigns = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const ownerId = req.user!.id;
        const projectsRef = collection(adminDb, 'projects');
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
        const q = query(investmentsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const investments = querySnapshot.docs.map(doc => doc.data());
        res.status(200).json({ investments });
    } catch (err) {
        next(err);
    }
};

export const updateUserProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const data = req.body;
        
        const userDocRef = doc(adminDb, 'users', userId);

        let updateData = { ...data };

        if (data.country) {
            const stripeSupported = await isStripeSupported(data.country);
            const plaidSupported = isPlaidSupported(data.country);
            
            updateData.stripeSupported = stripeSupported;
            updateData.plaidSupported = plaidSupported;

            if (!stripeSupported) {
                updateData.payoutBlocked = true;
                updateData.fallbackKycStatus = 'required';
            } else {
                updateData.payoutBlocked = false;
                updateData.fallbackKycStatus = 'not_required';
            }
        }

        await updateDoc(userDocRef, updateData);
        
        const updatedDoc = await getDoc(userDocRef);
        const updatedUserData = updatedDoc.data();

        res.status(200).json({ user: updatedUserData });
    } catch (err) {
        next(err);
    }
}

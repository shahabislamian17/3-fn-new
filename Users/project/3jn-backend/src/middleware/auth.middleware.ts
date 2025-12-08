import { Request, Response, NextFunction } from 'express';
import { adminAuth, adminDb } from '@/core/firebase';
import { User } from '@/core/types';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const sessionCookie = req.cookies.session || '';

  if (!sessionCookie) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection('users').doc(decodedClaims.uid).get();

    if (!userDoc.exists) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
        id: decodedClaims.uid,
        email: decodedClaims.email!,
        ...(userDoc.data() as any)
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

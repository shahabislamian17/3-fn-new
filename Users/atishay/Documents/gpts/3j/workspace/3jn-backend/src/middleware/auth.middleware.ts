
import { Request, Response, NextFunction } from 'express';
import { adminAuth, adminDb } from '@/core/firebase';
import type { User } from '@/core/types';
import { getSecret } from '@/core/secrets';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Middleware for user-facing endpoints, verifies Firebase Auth session cookie or Bearer token.
export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const sessionCookie = req.cookies.session || '';
  const authHeader = req.headers.authorization || '';

  let idToken;
  if (sessionCookie) {
    try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
        const userRecord = await getUserFromClaims(decodedClaims);
        if (userRecord) {
            req.user = userRecord;
            return next();
        }
    } catch (error) {
        // Fallthrough to try bearer token if cookie is invalid
    }
  }

  if(authHeader.startsWith('Bearer ')) {
    idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedClaims = await adminAuth.verifyIdToken(idToken, true);
        const userRecord = await getUserFromClaims(decodedClaims);
        if (userRecord) {
            req.user = userRecord;
            return next();
        }
    } catch(error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  }

  return res.status(401).json({ error: 'Unauthorized: No valid session or token found.' });
};

async function getUserFromClaims(decodedClaims: any): Promise<User | null> {
    const userDoc = await adminDb.collection('users').doc(decodedClaims.uid).get();
    if (!userDoc.exists) {
        // This case can happen if a user is deleted from Firestore but not from Auth.
        // Treat as an error state.
        console.warn(`User with UID ${decodedClaims.uid} found in Auth but not in Firestore.`);
        return null;
    }
    return {
        id: decodedClaims.uid,
        email: decodedClaims.email!,
        ...(userDoc.data() as any)
    };
}


// Middleware for server-to-server communication (e.g., Firebase Functions to Cloud Run)
export const protectWithServerToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const serverToken = req.headers['x-server-token'] as string;
    
    if (!serverToken) {
        return res.status(401).json({ error: 'Unauthorized: Missing server token.' });
    }

    try {
        const validToken = await getSecret('BACKEND_TO_BACKEND_SECRET');
        if (serverToken !== validToken) {
            return res.status(403).json({ error: 'Forbidden: Invalid server token.' });
        }
        next();
    } catch (error) {
        console.error('Server token verification error:', error);
        return res.status(500).json({ error: 'Internal server error during token verification.' });
    }
};

// This middleware will attach the user object if a UID is passed in the body from a trusted source (Firebase Function)
export const proxyUserAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // If there is already a user from 'protect' middleware, just continue
  if (req.user) {
    return next();
  }
  
  const { userId } = req.body;

  if (!userId) {
    // If no userId, maybe it's a public endpoint or needs 'protect' middleware.
    return next();
  }

  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(401).json({ error: `Proxied user with ID ${userId} not found.` });
    }
    const firebaseUser = await adminAuth.getUser(userId);

    req.user = {
      id: userId,
      email: firebaseUser.email!,
      ...(userDoc.data() as any),
    };
    next();
  } catch (error) {
    console.error(`Proxy auth failed for userId ${userId}:`, error);
    return res.status(500).json({ error: 'Failed to proxy user authentication.' });
  }
}

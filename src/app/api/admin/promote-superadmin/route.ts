'use server';

import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    if (!adminAuth || !adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin SDK not initialized. Please configure FIREBASE_SERVICE_ACCOUNT_KEY in your environment variables.' },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const body = await request.json();
    const targetUserId = body.userId || userId;

    // Only allow users to promote themselves, or require SuperAdmin to promote others
    if (targetUserId !== userId) {
      // Check if current user is SuperAdmin
      const currentUserDoc = await adminDb.collection('users').doc(userId).get();
      const currentUser = currentUserDoc.data();
      if (currentUser?.role !== 'SuperAdmin') {
        return NextResponse.json({ error: 'Forbidden: Only SuperAdmin can promote other users' }, { status: 403 });
      }
    }

    // Update the user's role to SuperAdmin
    const userDocRef = adminDb.collection('users').doc(targetUserId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      // Create user document if it doesn't exist
      await userDocRef.set({
        id: targetUserId,
        email: decodedToken.email || '',
        name: decodedToken.name || 'Super Admin',
        role: 'SuperAdmin',
        status: 'active',
      }, { merge: true });
    } else {
      // Update existing user document
      await userDocRef.update({
        role: 'SuperAdmin',
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User promoted to SuperAdmin successfully' 
    });
  } catch (error: any) {
    console.error('Error promoting to SuperAdmin:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}


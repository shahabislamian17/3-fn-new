import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/server-auth';
import { getAdminDb } from '@/lib/firebase-admin';

export async function PATCH(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const adminDb = getAdminDb();
    
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Get current user document to preserve existing data
    const userRef = adminDb.collection('users').doc(user.id);
    const userDoc = await userRef.get();
    const currentUserData = userDoc.exists ? userDoc.data() : {};

    // Update user document with new profile data
    await userRef.set({
      ...currentUserData,
      ...body,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // Get updated user data
    const updatedDoc = await userRef.get();
    const updatedUserData = updatedDoc.data();

    return NextResponse.json({ 
      success: true,
      user: updatedUserData 
    });
  } catch (error: any) {
    console.error('Update user profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}


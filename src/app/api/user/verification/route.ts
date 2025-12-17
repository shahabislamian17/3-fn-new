import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/server-auth';
import { getAdminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
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

    // Save verification data to user's document
    const verificationData = {
      ...body,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
    };

    // Update user document with verification data
    await adminDb.collection('users').doc(user.id).set({
      verification: verificationData,
      kycStatus: 'pending',
      kycSubmittedAt: new Date().toISOString(),
    }, { merge: true });

    // Also create a separate verification submission document for admin review
    await adminDb.collection('verificationSubmissions').add({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      ...verificationData,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Verification information submitted successfully' 
    });
  } catch (error: any) {
    console.error('Verification submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit verification' },
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/server-auth';
import { getAdminDb } from '@/lib/firebase-admin';

export async function POST() {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Check if user already has a pending or approved fallback KYC
    const existingKycSnapshot = await adminDb.collection('fallbackKyc')
      .where('userId', '==', user.id)
      .where('status', 'in', ['pending', 'approved'])
      .limit(1)
      .get();

    if (!existingKycSnapshot.empty) {
      const existingDoc = existingKycSnapshot.docs[0];
      return NextResponse.json({
        id: existingDoc.id,
        status: existingDoc.data().status,
        message: 'Fallback KYC already exists',
      });
    }

    // Create a new fallback KYC request
    const newKycRef = adminDb.collection('fallbackKyc').doc();
    await newKycRef.set({
      userId: user.id,
      userEmail: user.email,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      id: newKycRef.id,
      status: 'pending',
      message: 'Fallback KYC verification started',
    });
  } catch (error: any) {
    console.error('Start fallback KYC error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start fallback KYC' },
      { status: 500 }
    );
  }
}


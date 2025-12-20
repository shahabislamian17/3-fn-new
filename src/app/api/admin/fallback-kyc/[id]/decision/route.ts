import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/server-auth';
import { getAdminDb } from '@/lib/firebase-admin';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user || (user.role !== 'Admin' && user.role !== 'SuperAdmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const body = await request.json();
    const { decision, reason } = body;

    if (!decision || (decision !== 'approved' && decision !== 'rejected')) {
      return NextResponse.json(
        { error: 'Invalid decision. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    // Next.js 15: params is now a Promise
    const { id: kycId } = await params;
    
    if (!kycId || typeof kycId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid KYC ID' },
        { status: 400 }
      );
    }
    
    // Try to find the request in both collections
    let kycRef: FirebaseFirestore.DocumentReference;
    let kycDoc: FirebaseFirestore.DocumentSnapshot;
    
    // First try verificationSubmissions (regular KYC)
    const verificationRef = adminDb.collection('verificationSubmissions').doc(kycId);
    const verificationDoc = await verificationRef.get();
    
    if (verificationDoc.exists) {
      kycRef = verificationRef;
      kycDoc = verificationDoc;
    } else {
      // Try fallbackKyc collection
      const fallbackRef = adminDb.collection('fallbackKyc').doc(kycId);
      const fallbackDoc = await fallbackRef.get();
      
      if (fallbackDoc.exists) {
        kycRef = fallbackRef;
        kycDoc = fallbackDoc;
      } else {
        return NextResponse.json({ error: 'KYC request not found' }, { status: 404 });
      }
    }

    const kycData = kycDoc.data();
    if (!kycData) {
      return NextResponse.json({ error: 'KYC request data not found' }, { status: 404 });
    }

    // Check if already processed
    if (kycData.status && kycData.status !== 'pending') {
      return NextResponse.json(
        { error: 'This request has already been processed' },
        { status: 400 }
      );
    }

    // Update the KYC request
    await kycRef.update({
      status: decision,
      reviewedBy: user.id,
      reviewedByEmail: user.email,
      reviewedAt: new Date().toISOString(),
      reviewReason: reason || null,
    });

    // If approved, update the user's KYC status
    if (decision === 'approved' && kycData?.userId) {
      await adminDb.collection('users').doc(kycData.userId).update({
        kycStatus: 'approved',
        kycApprovedAt: new Date().toISOString(),
        verification: {
          ...kycData,
          status: 'approved',
          reviewedBy: user.id,
          reviewedByEmail: user.email,
          reviewedAt: new Date().toISOString(),
          reviewReason: reason || null,
        },
      });
    } else if (decision === 'rejected' && kycData?.userId) {
      await adminDb.collection('users').doc(kycData.userId).update({
        kycStatus: 'rejected',
        kycRejectedAt: new Date().toISOString(),
        kycRejectionReason: reason || null,
        verification: {
          ...kycData,
          status: 'rejected',
          reviewedBy: user.id,
          reviewedByEmail: user.email,
          reviewedAt: new Date().toISOString(),
          reviewReason: reason || null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Fallback KYC request ${decision} successfully`,
    });
  } catch (error: any) {
    console.error('Decide fallback KYC error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process decision' },
      { status: 500 }
    );
  }
}


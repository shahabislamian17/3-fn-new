import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/server-auth';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Find the user's fallback KYC request
    // Note: We fetch without orderBy to avoid requiring a composite index, then sort in memory
    const fallbackKycSnapshot = await adminDb.collection('fallbackKyc')
      .where('userId', '==', user.id)
      .get();

    if (fallbackKycSnapshot.empty) {
      return NextResponse.json({ status: 'not_started' });
    }

    // Sort by createdAt descending and get the most recent one
    const allKycDocs = fallbackKycSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    allKycDocs.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Descending order
    });

    const kycData = allKycDocs[0];

    return NextResponse.json({
      id: kycData.id,
      status: kycData.status || 'pending',
      createdAt: kycData.createdAt,
      reviewedAt: kycData.reviewedAt,
      reviewReason: kycData.reviewReason,
      bankDocumentUrl: kycData.bankDocumentUrl,
      proofOfAddressUrl: kycData.proofOfAddressUrl,
    });
  } catch (error: any) {
    console.error('Get fallback KYC status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch fallback KYC status' },
      { status: 500 }
    );
  }
}


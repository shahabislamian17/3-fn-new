import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/server-auth';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user || (user.role !== 'Admin' && user.role !== 'SuperAdmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Fetch all pending fallback KYC requests
    // Note: We fetch without orderBy to avoid requiring a composite index, then sort in memory
    const fallbackKycSnapshot = await adminDb.collection('fallbackKyc')
      .where('status', '==', 'pending')
      .get();

    const pendingRequests = fallbackKycSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort by createdAt descending in memory
    pendingRequests.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Descending order
    });

    return NextResponse.json(pendingRequests);
  } catch (error: any) {
    console.error('Get pending fallback KYC error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pending fallback KYC requests' },
      { status: 500 }
    );
  }
}


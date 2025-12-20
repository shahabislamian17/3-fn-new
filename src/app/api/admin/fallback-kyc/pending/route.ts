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

    // Fetch all pending verification requests from both collections:
    // 1. verificationSubmissions - Regular KYC verification submissions
    // 2. fallbackKyc - Fallback KYC requests (for unsupported countries)
    
    const allPendingRequests: any[] = [];

    // Fetch from verificationSubmissions (regular KYC)
    try {
      const verificationSubmissionsSnapshot = await adminDb.collection('verificationSubmissions')
        .where('status', '==', 'pending')
        .get();

      verificationSubmissionsSnapshot.docs.forEach((doc: any) => {
        const data = doc.data();
        allPendingRequests.push({
          id: doc.id,
          type: 'verification', // Mark as regular verification
          ...data,
        });
      });
    } catch (error: any) {
      console.warn('Error fetching verificationSubmissions:', error.message);
    }

    // Fetch from fallbackKyc (fallback KYC system)
    try {
      const fallbackKycSnapshot = await adminDb.collection('fallbackKyc')
        .where('status', '==', 'pending')
        .get();

      fallbackKycSnapshot.docs.forEach((doc: any) => {
        const data = doc.data();
        allPendingRequests.push({
          id: doc.id,
          type: 'fallback', // Mark as fallback KYC
          ...data,
        });
      });
    } catch (error: any) {
      console.warn('Error fetching fallbackKyc:', error.message);
    }

    // If no status filter in verificationSubmissions, also get all and filter by status field
    // Some documents might not have status field, so we'll also check those
    if (allPendingRequests.length === 0) {
      try {
        const allVerificationSnapshot = await adminDb.collection('verificationSubmissions')
          .get();
        
        allVerificationSnapshot.docs.forEach((doc: any) => {
          const data = doc.data();
          // If status is pending or not set (assume pending for new submissions)
          if (!data.status || data.status === 'pending') {
            allPendingRequests.push({
              id: doc.id,
              type: 'verification',
              ...data,
              status: data.status || 'pending', // Ensure status is set
            });
          }
        });
      } catch (error: any) {
        console.warn('Error fetching all verificationSubmissions:', error.message);
      }
    }

    // Sort by createdAt or submittedAt descending in memory
    allPendingRequests.sort((a: any, b: any) => {
      const dateA = a.createdAt || a.submittedAt;
      const dateB = b.createdAt || b.submittedAt;
      const timeA = dateA ? new Date(dateA).getTime() : 0;
      const timeB = dateB ? new Date(dateB).getTime() : 0;
      return timeB - timeA; // Descending order
    });

    console.log(`Found ${allPendingRequests.length} pending KYC requests`);

    return NextResponse.json(allPendingRequests);
  } catch (error: any) {
    console.error('Get pending fallback KYC error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pending fallback KYC requests' },
      { status: 500 }
    );
  }
}


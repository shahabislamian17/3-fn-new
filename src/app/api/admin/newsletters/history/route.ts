import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/server-auth';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (user.role !== 'Admin' && user.role !== 'SuperAdmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Get newsletter history
    const snapshot = await adminDb
      .collection('newsletters')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(history);
  } catch (error: any) {
    console.error('Newsletter history error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch newsletter history' },
      { status: 500 }
    );
  }
}


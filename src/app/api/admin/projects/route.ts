import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/server-auth';
import { getAdminDb } from '@/lib/firebase-admin';
import type { Project } from '@/lib/types';

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

    // Fetch all projects (not just live ones for admin view)
    const projectsSnapshot = await adminDb.collection('projects').get();
    const projects = projectsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    } as Project));

    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error('Admin projects API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}


'use server';

import { NextResponse } from 'next/server';
import { collection, getDocs, query, where, type Firestore } from 'firebase/firestore';
import type { Project } from '@/lib/types';
import { initializeFirebase } from '@/firebase';
import { adminAuth } from '@/lib/firebase-admin';

async function fetchCampaignsForOwner(firestore: Firestore, ownerId: string): Promise<Project[]> {
  try {
    const projectsRef = collection(firestore, 'projects');
    const q = query(projectsRef, where('owner.id', '==', ownerId));
    const querySnapshot = await getDocs(q);
    const projects: Project[] = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() } as Project);
    });
    return projects;
  } catch (e) {
    console.error("Error fetching projects from Firestore: ", e);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1] || '';
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const ownerId = decodedToken.uid;
    
    const { firebaseApp } = initializeFirebase();
    const firestore = (await import('firebase/firestore')).getFirestore(firebaseApp);

    const campaigns = await fetchCampaignsForOwner(firestore, ownerId);
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Failed to fetch campaigns', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

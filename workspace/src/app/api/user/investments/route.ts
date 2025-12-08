'use server';

import { NextResponse } from 'next/server';
import { collection, getDocs, query, where, type Firestore } from 'firebase/firestore';
import type { Investment } from '@/lib/types';
import { initializeFirebase } from '@/firebase';
import { adminAuth } from '@/lib/firebase-admin';


async function fetchInvestmentsForUser(firestore: Firestore, userId: string): Promise<Investment[]> {
  try {
    const investmentsRef = collection(firestore, 'investments');
    const q = query(investmentsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const investments: Investment[] = [];
    querySnapshot.forEach((doc) => {
      investments.push({ id: doc.id, ...doc.data() } as Investment);
    });
    return investments;
  } catch (e) {
    console.error("Error fetching investments from Firestore: ", e);
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
    const userId = decodedToken.uid;

    const { firebaseApp } = initializeFirebase();
    const firestore = (await import('firebase/firestore')).getFirestore(firebaseApp);

    const investments = await fetchInvestmentsForUser(firestore, userId);
    return NextResponse.json({ investments });
  } catch (error) {
    console.error('Failed to fetch investments', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

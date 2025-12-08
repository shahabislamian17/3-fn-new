import { NextResponse } from 'next/server';
import type { Notification } from '@/lib/types';
import { initializeFirebase } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { adminAuth, isAdminInitialized } from '@/lib/firebase-admin';

async function fetchNotificationsForUser(firestore: any, userId: string): Promise<Notification[]> {
  const notificationsRef = collection(firestore, 'notifications');
  const q = query(notificationsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  const notifications: Notification[] = [];
  querySnapshot.forEach((doc) => {
    notifications.push({ id: doc.id, ...doc.data() } as Notification);
  });
  return notifications;
}

export async function GET(request: Request) {
  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1] || '';
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if admin SDK is initialized
    if (!isAdminInitialized || !adminAuth) {
      // In development, return empty array since we can't verify tokens
      if (process.env.NODE_ENV === "development") {
        // Silently return empty array in development - no need to log every request
        return NextResponse.json([]);
      } else {
        return NextResponse.json(
          { error: 'Server configuration error. Admin SDK not initialized.' },
          { status: 500 }
        );
      }
    }

    // Double-check adminAuth is not null (TypeScript guard)
    if (!adminAuth) {
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json([]);
      }
      return NextResponse.json(
        { error: 'Server configuration error. Admin SDK not initialized.' },
        { status: 500 }
      );
    }

    // Verify token using admin SDK
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;
    
    const { firebaseApp } = initializeFirebase();
    const firestore = (await import('firebase/firestore')).getFirestore(firebaseApp);

    const allNotifications = await fetchNotificationsForUser(firestore, userId);
    return NextResponse.json(allNotifications);
  } catch (error) {
    console.error('Failed to fetch notifications', error);
    if ((error as any).code === 'auth/id-token-expired' || (error as any).code === 'auth/id-token-revoked') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  type Firestore,
} from 'firebase/firestore';
import type { User } from '@/lib/types';

/**
 * Fetches a user document from Firestore.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user to fetch.
 * @returns The user data or null if not found.
 */
export async function getUser(
  firestore: Firestore,
  userId: string
): Promise<User | null> {
  const userDocRef = doc(firestore, 'users', userId);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    return userDocSnap.data() as User;
  } else {
    return null;
  }
}

/**
 * Creates a new user document in Firestore.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the new user.
 * @param data - The user data to save.
 */
export async function createUser(
  firestore: Firestore,
  userId: string,
  data: Partial<User>
): Promise<void> {
  const userDocRef = doc(firestore, 'users', userId);
  await setDoc(userDocRef, data, { merge: true });
}


/**
 * Updates a user document in Firestore.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user to update.
 * @param data - The data to update.
 */
export async function updateUser(
  firestore: Firestore,
  userId: string,
  data: Partial<User>
): Promise<void> {
  const userDocRef = doc(firestore, 'users', userId);
  await updateDoc(userDocRef, data);
}

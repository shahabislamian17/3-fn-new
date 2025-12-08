import { cookies } from "next/headers";
import { adminAuth, adminDb } from "./firebase-admin";
import type { User } from "./types";

export type ServerUser = User & {
  id: string;
  email: string;
};

export async function getServerUser(): Promise<ServerUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(token, true);
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();

    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();
    const role: User['role'] = userData?.role || 'Investor';

    return {
      id: decoded.uid,
      email: decoded.email!,
      ...userData,
      role: role,
    } as ServerUser;
  } catch (error) {
    return null;
  }
}

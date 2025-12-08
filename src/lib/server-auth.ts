
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "./firebase-admin";

export type ServerUser = {
  id: string;
  email: string;
  stripeAccountId?: string;
  stripeConnected?: boolean;
  [key: string]: any;
};

export async function getServerUser(): Promise<ServerUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("firebase_id_token")?.value;

  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();

    return {
      id: decoded.uid,
      email: decoded.email ?? "",
      ...(userDoc.exists ? userDoc.data() : {}),
    } as ServerUser;
  } catch (error) {
    // Session cookie is invalid or expired.
    // The client-side onAuthStateChanged will handle re-authentication.
    return null;
  }
}

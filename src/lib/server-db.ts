
import { getAdminDb } from "./firebase-admin";
import type { Project } from "./types";

export async function updateUserStripeAccountId(
  userId: string,
  accountId: string
) {
  const adminDb = getAdminDb();
  if (!adminDb) throw new Error("Admin DB not initialized");
  await adminDb.collection("users").doc(userId).set(
    {
      stripeAccountId: accountId,
      stripe_onboard_status: 'pending',
    },
    { merge: true }
  );
}

export async function updateUserStripeStatusByAccount(
  accountId: string,
  isVerified: boolean
) {
  const adminDb = getAdminDb();
  if (!adminDb) throw new Error("Admin DB not initialized");
  const snap = await adminDb
    .collection("users")
    .where("stripeAccountId", "==", accountId)
    .limit(1)
    .get();

  if (snap.empty) return;

  const doc = snap.docs[0];
  await doc.ref.set(
    {
      stripeConnected: isVerified,
      stripe_onboard_status: isVerified ? 'completed' : 'pending',
    },
    { merge: true }
  );
}

export async function createProject(data: Partial<Project>) {
  const adminDb = getAdminDb();
  if (!adminDb) throw new Error("Admin DB not initialized");
  const ref = await adminDb.collection("projects").add({
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  await ref.update({ id: ref.id });

  const doc = await ref.get();
  return { id: ref.id, ...doc.data() };
}

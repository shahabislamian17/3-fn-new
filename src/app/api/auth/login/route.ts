
import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "Missing idToken" },
        { status: 400 }
      );
    }

    // Check if admin SDK is initialized
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    
    if (!isAdminInitialized || !adminAuth) {
      // In development, we can skip verification but warn about it
      if (process.env.NODE_ENV === "development") {
        console.warn("Firebase Admin SDK not initialized. Skipping token verification in development mode.");
        // Still set the cookie for development
        const res = NextResponse.json({ 
          ok: true,
          warning: "Admin SDK not configured. Token verification skipped in development."
        });
        const isSecure = process.env.VERCEL === "1";
        res.cookies.set("firebase_id_token", idToken, {
          httpOnly: true,
          secure: isSecure,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
        return res;
      } else {
        return NextResponse.json(
          { 
            error: "Server configuration error. Please set up Firebase Admin service account credentials.",
            details: "Set FIREBASE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS in your environment variables."
          },
          { status: 500 }
        );
      }
    }

    // Verify the Firebase ID token
    const decoded = await adminAuth.verifyIdToken(idToken);

    // Optionally ensure user doc exists in Firestore
    if (adminDb) {
      const userRef = adminDb.collection("users").doc(decoded.uid);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        await userRef.set(
          {
            email: decoded.email ?? "",
            createdAt: new Date(),
          },
          { merge: true }
        );
      }
    }

    // Set HttpOnly cookie for server-auth.ts
    const res = NextResponse.json({ ok: true });

    // Set cookie with proper settings for Vercel/production
    const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
    res.cookies.set("firebase_id_token", idToken, {
      httpOnly: true,
      secure: isProduction, // Must be true on HTTPS (Vercel)
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      // Don't set domain - let browser handle it automatically for current domain
    });
    
    // Log for debugging (remove in production if needed)
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Cookie set:", {
        secure: isProduction,
        path: "/",
        maxAge: "7 days",
      });
    }

    return res;
  } catch (err: any) {
    console.error("Login API error", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

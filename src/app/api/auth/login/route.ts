
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
        const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_URL;
        const isSecure = !!isVercel; // Only secure on Vercel, not in local dev
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
    // Vercel always uses HTTPS, so we need secure cookies there
    // Check multiple ways to detect Vercel (most reliable)
    const host = req.headers.get('host') || '';
    const isVercel = !!(process.env.VERCEL === "1" || 
                     process.env.VERCEL_URL || 
                     process.env.NEXT_PUBLIC_VERCEL_URL ||
                     host.includes('vercel.app') ||
                     host.includes('vercel.com'));
    
    // Check if request is HTTPS (for non-Vercel deployments)
    const protocol = req.headers.get('x-forwarded-proto') || 
                     (req.url?.startsWith('https://') ? 'https' : 'http');
    const isHttps = protocol === 'https';
    
    // Use secure if HTTPS or on Vercel (Vercel always uses HTTPS)
    // Prioritize Vercel detection since it's more reliable
    const shouldSecure: boolean = isVercel || isHttps;
    
    res.cookies.set("firebase_id_token", idToken, {
      httpOnly: true,
      secure: shouldSecure, // Must be true on HTTPS (Vercel)
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      // Don't set domain - let browser handle it automatically for current domain
    });
    
    // Log for debugging (always log to help diagnose Vercel issues)
    console.log("✅ Cookie set:", {
      secure: shouldSecure,
      isHttps,
      isVercel: !!isVercel,
      protocol,
      path: "/",
      maxAge: "7 days",
      vercelUrl: process.env.VERCEL_URL,
      host,
      vercelEnv: process.env.VERCEL,
    });

    return res;
  } catch (err: any) {
    console.error("Login API error", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

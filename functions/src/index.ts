import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const BACKEND_URL = process.env.BACKEND_URL;
const BACKEND_SECRET = process.env.BACKEND_TO_BACKEND_SECRET;

if (!BACKEND_URL || !BACKEND_SECRET) {
  throw new Error("Missing BACKEND_URL or BACKEND_TO_BACKEND_SECRET env vars.");
}

const fetch = require("node-fetch");

// Helper to create a callable function that proxies to the backend
const createApiProxy = (endpoint: string, allowedRoles?: string[]) => {
  return functions.https.onCall(async (data, context) => {
    // 1. Authentication: Ensure user is logged in.
    if (!context.auth) {
      throw new functions.https.HttpsError(
          "unauthenticated",
          "The function must be called while authenticated.",
      );
    }

    // 2. Authorization (RBAC): Check user roles if specified
    if (allowedRoles && allowedRoles.length > 0) {
      const userDoc = await admin.firestore().collection("users")
          .doc(context.auth.uid).get();
      const userRole = userDoc.data()?.role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "You do not have permission to perform this action.",
        );
      }
    }

    // 3. Proxy the request to the private backend service
    const backendRequestUrl = `${BACKEND_URL}${endpoint}`;
    
    // Add the authenticated user's ID to the payload
    const body = JSON.stringify({ ...data, userId: context.auth.uid });

    try {
      const response = await fetch(backendRequestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Server-Token": BACKEND_SECRET,
        },
        body,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new functions.https.HttpsError(
            "internal",
            `Backend request failed: ${response.status} ${errorBody}`,
        );
      }

      return await response.json();
    } catch (error: any) {
      console.error(`Error calling backend at ${endpoint}:`, error);
      throw new functions.https.HttpsError(
          "internal",
          "An error occurred while proxying the request.",
          error.message,
      );
    }
  });
};

// === Define all proxied endpoints ===

// PUBLIC-ACCESSIBLE (but requires auth)
export const getProjects = createApiProxy("/api/v1/projects");
export const getNotifications = createApiProxy("/api/v1/notifications");

// USER-SPECIFIC
export const getMyCampaigns = createApiProxy(
    "/api/v1/user/campaigns", ["ProjectOwner"],
);
export const getMyInvestments = createApiProxy(
    "/api/v1/user/investments", ["Investor"],
);
export const createProject = createApiProxy(
    "/api/v1/projects", ["ProjectOwner"],
);
export const createCheckoutSession = createApiProxy(
    "/api/v1/checkout/create-session", ["Investor"],
);
export const createConnectedAccount = createApiProxy(
    "/api/v1/stripe/create-connected-account", ["ProjectOwner"],
);
export const createOnboardingLink = createApiProxy(
    "/api/v1/stripe/create-onboarding-link", ["ProjectOwner"],
);

// ADMIN-ONLY
export const bulkMatchProjects = createApiProxy(
    "/api/v1/admin/match-projects/all", ["Admin", "SuperAdmin"],
);

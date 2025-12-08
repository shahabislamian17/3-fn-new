// Use require instead of import to avoid bundling issues
const admin = require("firebase-admin");
import * as fs from "fs";
import * as path from "path";

let app: admin.app.App | null = null;
let initError: Error | null = null;
let initializationAttempted = false;

function initializeAdmin() {
  if (initializationAttempted) {
    return; // Already attempted initialization
  }
  initializationAttempted = true;

  if (admin.apps.length > 0) {
    app = admin.app();
    return;
  }
  console.log("🔧 Initializing Firebase Admin SDK...");
  console.log("   FIREBASE_SERVICE_ACCOUNT_KEY exists:", !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  console.log("   GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS || "not set");
  console.log("   NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "not set");
  
  // Ensure admin.credential is available
  if (!admin.credential) {
    console.error("❌ admin.credential is not available. Firebase Admin SDK may not be properly installed.");
    initError = new Error("admin.credential is undefined");
  } else {
    // Try to use service account credentials from environment variables
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        console.log("   Attempting to parse FIREBASE_SERVICE_ACCOUNT_KEY...");
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        console.log("   ✅ Parsed successfully, project_id:", serviceAccount.project_id);
        
        // Verify admin.credential exists and has cert method
        if (!admin.credential || typeof admin.credential.cert !== 'function') {
          throw new Error("admin.credential.cert is not a function. Firebase Admin may be incorrectly bundled.");
        }
        
        const credential = admin.credential.cert(serviceAccount);
        if (!credential) {
          throw new Error("admin.credential.cert() returned undefined");
        }
        
        // Verify credential object structure
        console.log("   Credential created, type:", typeof credential);
        console.log("   Credential keys:", Object.keys(credential || {}).slice(0, 5));
        
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || serviceAccount.project_id;
        console.log("   Initializing app with projectId:", projectId);
        
        app = admin.initializeApp({
          credential: credential,
          projectId: projectId,
        });
        console.log("✅ Firebase Admin SDK initialized using FIREBASE_SERVICE_ACCOUNT_KEY");
      } catch (error: any) {
        console.error("❌ Failed to initialize with FIREBASE_SERVICE_ACCOUNT_KEY:", error.message);
        console.error("   Error stack:", error.stack?.split('\n').slice(0, 3).join('\n'));
        initError = error as Error;
      }
    } else {
      console.log("   ⚠️  FIREBASE_SERVICE_ACCOUNT_KEY not found in environment");
    }
  }
  
  // If not initialized yet, try reading from file path
  if (!app && process.env.GOOGLE_APPLICATION_CREDENTIALS && admin.credential) {
    try {
      const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      // Resolve the path relative to the project root
      const resolvedPath = path.isAbsolute(credentialsPath) 
        ? credentialsPath 
        : path.resolve(process.cwd(), credentialsPath);
      
      if (fs.existsSync(resolvedPath)) {
        const serviceAccountJson = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
        
        // Validate required fields
        if (!serviceAccountJson.private_key || !serviceAccountJson.client_email || !serviceAccountJson.project_id) {
          throw new Error("Service account JSON is missing required fields (private_key, client_email, or project_id)");
        }
        
        // Create credential first to validate it
        let credential;
        try {
          if (!admin.credential || !admin.credential.cert) {
            throw new Error("admin.credential.cert is not available");
          }
          credential = admin.credential.cert(serviceAccountJson);
          if (!credential) {
            throw new Error("admin.credential.cert() returned undefined");
          }
        } catch (credError: any) {
          throw new Error(`Failed to create credential: ${credError.message}`);
        }
        
        app = admin.initializeApp({
          credential: credential,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || serviceAccountJson.project_id,
        });
        console.log("✅ Firebase Admin SDK initialized using GOOGLE_APPLICATION_CREDENTIALS");
      } else {
        console.error(`❌ Credentials file not found at: ${resolvedPath}`);
      }
    } catch (error: any) {
      console.error("Failed to initialize with GOOGLE_APPLICATION_CREDENTIALS:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      if (!initError) initError = error as Error;
    }
  }
  
  // Final fallback: try to initialize without any config
  // This only works in specific environments like Firebase Functions or Cloud Run
  // In Next.js, we need explicit credentials, so skip this attempt
  if (!app) {
    // Skip initialization attempts that will fail without credentials
    // In Next.js, we need explicit service account credentials
    if (process.env.NODE_ENV === "development") {
      console.warn("Firebase Admin SDK not initialized. Admin features will be disabled.");
      console.warn("To enable admin features, set FIREBASE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS in your .env.local");
      app = null;
    } else {
      // In production, try one more time, but expect it to fail
      try {
        app = admin.initializeApp();
      } catch (fallbackError) {
        console.error("Firebase Admin initialization failed. Admin features will be disabled.");
        console.error("To enable admin features, set FIREBASE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS in your environment variables.");
        if (!initError) initError = fallbackError as Error;
        app = null;
      }
    }
  }
}

// Initialize on module load
initializeAdmin();

// Export admin services with lazy initialization
export function getAdminAuth() {
  if (!app && !initializationAttempted) {
    initializeAdmin();
  }
  return app ? app.auth() : null;
}

export function getAdminDb() {
  if (!app && !initializationAttempted) {
    initializeAdmin();
  }
  return app ? app.firestore() : null;
}

// For backward compatibility, export as constants (but they'll be null if not initialized)
export const adminAuth = app ? app.auth() : null;
export const adminDb = app ? app.firestore() : null;
export const isAdminInitialized = app !== null;

// Log initialization status after a short delay to ensure logs appear
setTimeout(() => {
  if (app) {
    console.log("✅ Firebase Admin SDK is ready. adminAuth:", !!adminAuth, "adminDb:", !!adminDb);
  } else {
    console.error("❌ Firebase Admin SDK initialization failed!");
    if (initError) {
      console.error("   Error:", initError.message);
    }
    console.error("   Environment check:");
    console.error("     FIREBASE_SERVICE_ACCOUNT_KEY:", !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? "exists" : "missing");
    console.error("     GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS || "not set");
  }
}, 100);

import * as admin from "firebase-admin";

let app: admin.app.App;

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.warn("GOOGLE_APPLICATION_CREDENTIALS not set. Using default credentials.");
    if (!admin.apps.length) {
      app = admin.initializeApp();
    } else {
      app = admin.app();
    }
} else {
    if (!admin.apps.length) {
      app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    } else {
      app = admin.app();
    }
}


export const adminAuth = app.auth();
export const adminDb = app.firestore();

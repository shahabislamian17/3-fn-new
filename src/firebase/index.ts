
import { getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from './config';

// Provides a `useAuth` hook
import { useAuth, AuthProvider } from './auth/use-auth';

// Provides a `useUser` hook
import { useUser } from './auth/use-user';

// Initializes and provides the Firebase app, Firestore, and Auth instances
import {
  FirebaseClientProvider,
  useFirebase,
  useFirestore,
  useFirebaseApp,
} from './client-provider';

function initializeFirebase() {
  const apps = getApps();
  const firebaseApp = apps.length ? apps[0] : initializeApp(firebaseConfig);

  return {
    firebaseApp,
  };
}

export {
  initializeFirebase,
  useAuth,
  useUser,
  FirebaseClientProvider,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  AuthProvider
};
